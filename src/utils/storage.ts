import { Goal, Reminder, Task, UserStats, UserProfile, Milestone, TaskCategory, PipelineItem, PlacementApplication, PlacementPrep, FounderStats } from '../types';

const EMPTY_STATS: UserStats = {
  streakCount: 0,
  lastCompletedDate: null,
  bestStreak: 0,
  completionRate: 0,
  focusScore: 0,
};

export const DEFAULT_CATEGORIES: TaskCategory[] = [
  { id: 'cat-dev', name: 'Development', color: '#6366f1' }, // Indigo
  { id: 'cat-marketing', name: 'Marketing', color: '#ec4899' }, // Pink
  { id: 'cat-study', name: 'Study', color: '#f59e0b' }, // Amber
  { id: 'cat-personal', name: 'Personal', color: '#10b981' }, // Emerald
  { id: 'cat-design', name: 'Design', color: '#a855f7' }, // Purple
];

export interface PlannerSnapshot {
  userProfile: UserProfile | null;
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  categories: TaskCategory[];
  reminders: Reminder[];
  userStats: UserStats;
  pipelineItems: PipelineItem[];
  placementApplications: PlacementApplication[];
  placementPrep: PlacementPrep | null;
  founderStats: FounderStats | null;
}

export function loadLocalSnapshot(userId: string): PlannerSnapshot | null {
  const profileRaw = localStorage.getItem(`planner-profile-${userId}`);
  const tasksRaw = localStorage.getItem(`planner-tasks-${userId}`);
  const goalsRaw = localStorage.getItem(`planner-goals-${userId}`);
  const milestonesRaw = localStorage.getItem(`planner-milestones-${userId}`);
  const categoriesRaw = localStorage.getItem(`planner-categories-${userId}`);
  const remindersRaw = localStorage.getItem(`planner-reminders-${userId}`);
  const statsRaw = localStorage.getItem(`planner-stats-${userId}`);
  const pipelineRaw = localStorage.getItem(`planner-pipeline-${userId}`);
  const placementAppsRaw = localStorage.getItem(`planner-placement-apps-${userId}`);
  const placementPrepRaw = localStorage.getItem(`planner-placement-prep-${userId}`);
  const founderStatsRaw = localStorage.getItem(`planner-founder-stats-${userId}`);

  if (!tasksRaw && !goalsRaw && !remindersRaw && !statsRaw && !profileRaw && !pipelineRaw && !placementAppsRaw) {
    return null;
  }

  return {
    userProfile: profileRaw ? JSON.parse(profileRaw) : null,
    tasks: tasksRaw ? JSON.parse(tasksRaw) : [],
    goals: goalsRaw ? JSON.parse(goalsRaw) : [],
    milestones: milestonesRaw ? JSON.parse(milestonesRaw) : [],
    categories: categoriesRaw ? JSON.parse(categoriesRaw) : DEFAULT_CATEGORIES,
    reminders: remindersRaw ? JSON.parse(remindersRaw) : [],
    userStats: statsRaw ? JSON.parse(statsRaw) : EMPTY_STATS,
    pipelineItems: pipelineRaw ? JSON.parse(pipelineRaw) : [],
    placementApplications: placementAppsRaw ? JSON.parse(placementAppsRaw) : [],
    placementPrep: placementPrepRaw ? JSON.parse(placementPrepRaw) : null,
    founderStats: founderStatsRaw ? JSON.parse(founderStatsRaw) : null,
  };
}

export function saveLocalSnapshot(userId: string, snapshot: PlannerSnapshot): void {
  if (snapshot.userProfile) {
    localStorage.setItem(`planner-profile-${userId}`, JSON.stringify(snapshot.userProfile));
  }
  localStorage.setItem(`planner-tasks-${userId}`, JSON.stringify(snapshot.tasks));
  localStorage.setItem(`planner-goals-${userId}`, JSON.stringify(snapshot.goals));
  localStorage.setItem(`planner-milestones-${userId}`, JSON.stringify(snapshot.milestones));
  localStorage.setItem(`planner-categories-${userId}`, JSON.stringify(snapshot.categories));
  localStorage.setItem(`planner-reminders-${userId}`, JSON.stringify(snapshot.reminders));
  localStorage.setItem(`planner-stats-${userId}`, JSON.stringify(snapshot.userStats));
  localStorage.setItem(`planner-pipeline-${userId}`, JSON.stringify(snapshot.pipelineItems || []));
  localStorage.setItem(`planner-placement-apps-${userId}`, JSON.stringify(snapshot.placementApplications || []));
  if (snapshot.placementPrep) {
    localStorage.setItem(`planner-placement-prep-${userId}`, JSON.stringify(snapshot.placementPrep));
  }
  if (snapshot.founderStats) {
    localStorage.setItem(`planner-founder-stats-${userId}`, JSON.stringify(snapshot.founderStats));
  }
}

export function emptySnapshot(): PlannerSnapshot {
  return {
    userProfile: null,
    tasks: [],
    goals: [],
    milestones: [],
    categories: DEFAULT_CATEGORIES,
    reminders: [],
    userStats: { ...EMPTY_STATS },
    pipelineItems: [],
    placementApplications: [],
    placementPrep: null,
    founderStats: null,
  };
}

export function loadThemePreference(): boolean {
  const savedTheme = localStorage.getItem('planner-theme-dark');
  if (savedTheme !== null) {
    return savedTheme === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function saveThemePreference(isDark: boolean): void {
  localStorage.setItem('planner-theme-dark', String(isDark));
}

export function loadNotificationsEnabled(): boolean {
  return localStorage.getItem('planner-notifications') === 'true';
}

export function saveNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem('planner-notifications', String(enabled));
}
