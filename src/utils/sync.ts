import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Goal, Reminder, Task, UserStats, UserProfile, Milestone, TaskCategory, PipelineItem, PlacementApplication, PlacementPrep, FounderStats } from '../types';
import { PlannerSnapshot } from './storage';

type SyncItem = { id: string; updatedAt: string };

function normalizeReminder(reminder: Reminder): Reminder {
  return {
    ...reminder,
    updatedAt: reminder.updatedAt ?? reminder.lastTriggered ?? '1970-01-01T00:00:00.000Z',
  };
}

function normalizeCategory(cat: TaskCategory): TaskCategory & { updatedAt: string } {
  return {
    ...cat,
    updatedAt: cat.updatedAt ?? '1970-01-01T00:00:00.000Z',
  };
}

function mergeByUpdatedAt<T extends SyncItem>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>();

  for (const item of local) {
    merged.set(item.id, item);
  }

  for (const item of remote) {
    const existing = merged.get(item.id);
    if (!existing || item.updatedAt >= existing.updatedAt) {
      merged.set(item.id, item);
    }
  }

  return Array.from(merged.values());
}

export async function fetchCloudSnapshot(userId: string): Promise<PlannerSnapshot | null> {
  const [
    tasksSnap,
    goalsSnap,
    remindersSnap,
    statsSnap,
    profileSnap,
    milestonesSnap,
    categoriesSnap,
    pipelineSnap,
    placementAppsSnap,
    placementPrepSnap,
    founderStatsSnap
  ] = await Promise.all([
    getDocs(collection(db, 'users', userId, 'tasks')),
    getDocs(collection(db, 'users', userId, 'goals')),
    getDocs(collection(db, 'users', userId, 'reminders')),
    getDoc(doc(db, 'users', userId, 'stats', 'profile')),
    getDoc(doc(db, 'users', userId, 'profiles', 'main')),
    getDocs(collection(db, 'users', userId, 'milestones')),
    getDocs(collection(db, 'users', userId, 'categories')),
    getDocs(collection(db, 'users', userId, 'pipeline')),
    getDocs(collection(db, 'users', userId, 'placementApplications')),
    getDoc(doc(db, 'users', userId, 'placement', 'prep')),
    getDoc(doc(db, 'users', userId, 'founder', 'revenue')),
  ]);

  const hasRemoteData =
    !tasksSnap.empty ||
    !goalsSnap.empty ||
    !remindersSnap.empty ||
    statsSnap.exists() ||
    profileSnap.exists() ||
    !milestonesSnap.empty ||
    !categoriesSnap.empty ||
    !pipelineSnap.empty ||
    !placementAppsSnap.empty ||
    placementPrepSnap.exists() ||
    founderStatsSnap.exists();

  if (!hasRemoteData) {
    return null;
  }

  return {
    userProfile: profileSnap.exists() ? (profileSnap.data() as UserProfile) : null,
    tasks: tasksSnap.docs.map((entry) => entry.data() as Task),
    goals: goalsSnap.docs.map((entry) => entry.data() as Goal),
    milestones: milestonesSnap.docs.map((entry) => entry.data() as Milestone),
    categories: categoriesSnap.docs.map((entry) => entry.data() as TaskCategory),
    reminders: remindersSnap.docs.map((entry) => normalizeReminder(entry.data() as Reminder)),
    userStats: statsSnap.exists()
      ? (statsSnap.data() as UserStats)
      : { streakCount: 0, lastCompletedDate: null, bestStreak: 0 },
    pipelineItems: pipelineSnap.docs.map((entry) => entry.data() as PipelineItem),
    placementApplications: placementAppsSnap.docs.map((entry) => entry.data() as PlacementApplication),
    placementPrep: placementPrepSnap.exists() ? (placementPrepSnap.data() as PlacementPrep) : null,
    founderStats: founderStatsSnap.exists() ? (founderStatsSnap.data() as FounderStats) : null,
  };
}

export function mergeSnapshots(
  local: PlannerSnapshot,
  remote: PlannerSnapshot,
): PlannerSnapshot {
  // Simple LWW (Last Write Wins) for the single UserProfile object
  let mergedProfile = local.userProfile;
  if (remote.userProfile) {
    if (!mergedProfile || remote.userProfile.updatedAt >= mergedProfile.updatedAt) {
      mergedProfile = remote.userProfile;
    }
  }

  let mergedPlacementPrep = local.placementPrep;
  if (remote.placementPrep) {
    if (!mergedPlacementPrep || remote.placementPrep.updatedAt >= mergedPlacementPrep.updatedAt) {
      mergedPlacementPrep = remote.placementPrep;
    }
  }

  let mergedFounderStats = local.founderStats;
  if (remote.founderStats) {
    if (!mergedFounderStats || remote.founderStats.updatedAt >= mergedFounderStats.updatedAt) {
      mergedFounderStats = remote.founderStats;
    }
  }

  return {
    userProfile: mergedProfile,
    tasks: mergeByUpdatedAt(local.tasks, remote.tasks).sort((a, b) => a.order - b.order),
    goals: mergeByUpdatedAt(local.goals, remote.goals),
    milestones: mergeByUpdatedAt(local.milestones, remote.milestones).sort((a, b) => a.order - b.order),
    categories: mergeByUpdatedAt(
      local.categories.map(normalizeCategory),
      remote.categories.map(normalizeCategory),
    ),
    reminders: mergeByUpdatedAt(
      local.reminders.map(normalizeReminder),
      remote.reminders.map(normalizeReminder),
    ),
    userStats: {
      streakCount: Math.max(local.userStats.streakCount, remote.userStats.streakCount),
      bestStreak: Math.max(local.userStats.bestStreak, remote.userStats.bestStreak),
      lastCompletedDate:
        [local.userStats.lastCompletedDate, remote.userStats.lastCompletedDate]
          .filter(Boolean)
          .sort()
          .pop() ?? null,
      completionRate: Math.max(local.userStats.completionRate ?? 0, remote.userStats.completionRate ?? 0),
      focusScore: Math.max(local.userStats.focusScore ?? 0, remote.userStats.focusScore ?? 0),
    },
    pipelineItems: mergeByUpdatedAt(local.pipelineItems, remote.pipelineItems),
    placementApplications: mergeByUpdatedAt(local.placementApplications, remote.placementApplications),
    placementPrep: mergedPlacementPrep,
    founderStats: mergedFounderStats,
  };
}

export async function pushCloudSnapshot(userId: string, snapshot: PlannerSnapshot): Promise<void> {
  const batch = writeBatch(db);

  if (snapshot.userProfile) {
    batch.set(doc(db, 'users', userId, 'profiles', 'main'), snapshot.userProfile, { merge: true });
  }

  snapshot.goals.forEach((goal) => {
    batch.set(doc(db, 'users', userId, 'goals', goal.id), goal, { merge: true });
  });

  snapshot.milestones.forEach((milestone) => {
    batch.set(doc(db, 'users', userId, 'milestones', milestone.id), milestone, { merge: true });
  });

  snapshot.categories.forEach((cat) => {
    batch.set(doc(db, 'users', userId, 'categories', cat.id), cat, { merge: true });
  });

  snapshot.tasks.forEach((task) => {
    batch.set(doc(db, 'users', userId, 'tasks', task.id), task, { merge: true });
  });

  snapshot.reminders.forEach((reminder) => {
    batch.set(doc(db, 'users', userId, 'reminders', reminder.id), reminder, { merge: true });
  });

  snapshot.pipelineItems.forEach((item) => {
    batch.set(doc(db, 'users', userId, 'pipeline', item.id), item, { merge: true });
  });

  snapshot.placementApplications.forEach((item) => {
    batch.set(doc(db, 'users', userId, 'placementApplications', item.id), item, { merge: true });
  });

  if (snapshot.placementPrep) {
    batch.set(doc(db, 'users', userId, 'placement', 'prep'), snapshot.placementPrep, { merge: true });
  }

  if (snapshot.founderStats) {
    batch.set(doc(db, 'users', userId, 'founder', 'revenue'), snapshot.founderStats, { merge: true });
  }

  batch.set(doc(db, 'users', userId, 'stats', 'profile'), snapshot.userStats, { merge: true });

  await batch.commit();
}

export async function deleteCloudDocument(
  userId: string,
  collectionName: 'tasks' | 'goals' | 'reminders' | 'milestones' | 'categories' | 'pipeline' | 'placementApplications',
  documentId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, collectionName, documentId));
}
