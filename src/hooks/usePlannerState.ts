import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  Task, Goal, Reminder, SyncStats, UserStats, UserProfile, 
  Milestone, TaskCategory, Persona, PipelineItem, PlacementApplication, PlacementPrep, FounderStats 
} from '../types';
import { 
  subscribeToAuth 
} from '../firebase';
import { 
  emptySnapshot, loadLocalSnapshot, saveLocalSnapshot, DEFAULT_CATEGORIES 
} from '../utils/storage';
import { 
  fetchCloudSnapshot, mergeSnapshots, pushCloudSnapshot, deleteCloudDocument 
} from '../utils/sync';
import { GOAL_TEMPLATES } from '../utils/templates';
import { getLocalDateString, getLocalISOString, generateRecurringDates } from '../utils/date';

export function usePlannerState() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // App Data State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [placementApplications, setPlacementApplications] = useState<PlacementApplication[]>([]);
  const [placementPrep, setPlacementPrep] = useState<PlacementPrep | null>(null);
  const [founderStats, setFounderStats] = useState<FounderStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    streakCount: 0,
    lastCompletedDate: null,
    bestStreak: 0,
    completionRate: 0,
    focusScore: 0,
  });
  const [syncStats, setSyncStats] = useState<SyncStats>({
    unsyncedCount: 0,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'synced'
  });

  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);
  const [todayStr, setTodayStr] = useState(getLocalDateString());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = getLocalDateString();
      if (currentToday !== todayStr) {
        setTodayStr(currentToday);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [todayStr]);

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isActuallyOnline = isBrowserOnline;

  const applySnapshot = useCallback((snapshot: ReturnType<typeof emptySnapshot>) => {
    setUserProfile(snapshot.userProfile);
    setTasks(snapshot.tasks);
    setGoals(snapshot.goals);
    setMilestones(snapshot.milestones || []);
    setCategories(snapshot.categories && snapshot.categories.length > 0 ? snapshot.categories : DEFAULT_CATEGORIES);
    setReminders(snapshot.reminders);
    setUserStats(snapshot.userStats);
    setPipelineItems(snapshot.pipelineItems || []);
    setPlacementApplications(snapshot.placementApplications || []);
    setPlacementPrep(snapshot.placementPrep || null);
    setFounderStats(snapshot.founderStats || null);
  }, []);

  const loadUserData = useCallback(async (uid: string) => {
    setIsLoadingData(true);

    const localSnapshot = loadLocalSnapshot(uid) ?? emptySnapshot();
    applySnapshot(localSnapshot);

    if (isBrowserOnline) {
      try {
        const cloudSnapshot = await fetchCloudSnapshot(uid);
        if (cloudSnapshot) {
          const merged = mergeSnapshots(localSnapshot, cloudSnapshot);
          applySnapshot(merged);
          saveLocalSnapshot(uid, merged);
        }
      } catch (error) {
        console.error('Failed to load cloud data:', error);
        setSyncStats((prev) => ({ ...prev, syncStatus: 'error' }));
      }
    }

    setIsLoadingData(false);
  }, [applySnapshot, isBrowserOnline]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setIsAuthenticating(true);

      if (!user) {
        setAuthUser(null);
        setUserId('');
        setIsAuthenticating(false);
        setIsLoadingData(false);
        return;
      }

      setAuthUser(user);
      setUserId(user.uid);
      setIsAuthenticating(false);
      await loadUserData(user.uid);
    });

    return unsubscribe;
  }, [loadUserData]);

  // Write changes to localStorage anytime data changes, and queue for Cloud Sync
  const persistState = useCallback((
    updatedTasks: Task[],
    updatedGoals: Goal[],
    updatedReminders: Reminder[],
    updatedStats?: UserStats,
    updatedProfile?: UserProfile | null,
    updatedMilestones?: Milestone[],
    updatedCategories?: TaskCategory[],
    updatedPipeline?: PipelineItem[],
    updatedPlacementApps?: PlacementApplication[],
    updatedPlacementPrep?: PlacementPrep | null,
    updatedFounderStats?: FounderStats | null,
  ) => {
    setTasks(updatedTasks);
    setGoals(updatedGoals);
    setReminders(updatedReminders);

    const nextStats = updatedStats ?? userStats;
    if (updatedStats) {
      setUserStats(updatedStats);
    }

    const nextProfile = updatedProfile !== undefined ? updatedProfile : userProfile;
    if (updatedProfile !== undefined) {
      setUserProfile(updatedProfile);
    }

    const nextMilestones = updatedMilestones ?? milestones;
    if (updatedMilestones) {
      setMilestones(updatedMilestones);
    }

    const nextCategories = updatedCategories ?? categories;
    if (updatedCategories) {
      setCategories(updatedCategories);
    }

    const nextPipeline = updatedPipeline ?? pipelineItems;
    if (updatedPipeline) {
      setPipelineItems(nextPipeline);
    }

    const nextPlacementApps = updatedPlacementApps ?? placementApplications;
    if (updatedPlacementApps) {
      setPlacementApplications(nextPlacementApps);
    }

    const nextPlacementPrep = updatedPlacementPrep !== undefined ? updatedPlacementPrep : placementPrep;
    if (updatedPlacementPrep !== undefined) {
      setPlacementPrep(nextPlacementPrep);
    }

    const nextFounderStats = updatedFounderStats !== undefined ? updatedFounderStats : founderStats;
    if (updatedFounderStats !== undefined) {
      setFounderStats(nextFounderStats);
    }

    if (userId) {
      saveLocalSnapshot(userId, {
        userProfile: nextProfile,
        tasks: updatedTasks,
        goals: updatedGoals,
        milestones: nextMilestones,
        categories: nextCategories,
        reminders: updatedReminders,
        userStats: nextStats,
        pipelineItems: nextPipeline,
        placementApplications: nextPlacementApps,
        placementPrep: nextPlacementPrep,
        founderStats: nextFounderStats,
      });
    }

    setSyncStats((prev) => ({
      ...prev,
      unsyncedCount: prev.unsyncedCount + 1,
      syncStatus: isActuallyOnline ? 'syncing' : 'offline',
    }));
  }, [userId, isActuallyOnline, userStats, userProfile, milestones, categories, pipelineItems, placementApplications, placementPrep, founderStats]);

  const handleCloudSync = useCallback(async () => {
    if (!userId || !isActuallyOnline) {
      setSyncStats((prev) => ({ ...prev, syncStatus: 'offline' }));
      return;
    }

    setSyncStats((prev) => ({ ...prev, syncStatus: 'syncing' }));

    try {
      await pushCloudSnapshot(userId, {
        userProfile,
        tasks,
        goals,
        milestones,
        categories,
        reminders,
        userStats,
        pipelineItems,
        placementApplications,
        placementPrep,
        founderStats,
      });

      setSyncStats({
        unsyncedCount: 0,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: 'synced',
      });
    } catch (err) {
      console.error('Cloud synchronisation error:', err);
      setSyncStats((prev) => ({ ...prev, syncStatus: 'error' }));
    }
  }, [userId, userProfile, tasks, goals, milestones, categories, reminders, userStats, isActuallyOnline, pipelineItems, placementApplications, placementPrep, founderStats]);

  // Sync automatically when online status shifts or tasks mutate
  useEffect(() => {
    if (isActuallyOnline && syncStats.unsyncedCount > 0) {
      const timer = setTimeout(() => {
        handleCloudSync();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [syncStats.unsyncedCount, isActuallyOnline, handleCloudSync]);

  const computeAndPersistCompletedStreak = (updatedTasks: Task[]) => {
    const completedTasks = updatedTasks.filter(t => t.completed && t.completedAt);
    if (completedTasks.length === 0) {
      return { streakCount: 0, lastCompletedDate: null, bestStreak: userStats.bestStreak };
    }

    const uniqueCompletionDates = Array.from(
      new Set(completedTasks.map(t => t.completedAt!.split('T')[0]))
    ).sort();

    const todayStr = getLocalDateString();
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const hasCompletedRecently = uniqueCompletionDates.includes(todayStr) || uniqueCompletionDates.includes(yesterdayStr);
    
    if (!hasCompletedRecently) {
      return { streakCount: 0, lastCompletedDate: uniqueCompletionDates[uniqueCompletionDates.length - 1], bestStreak: userStats.bestStreak };
    }

    let activeStreak = 0;
    let pointerDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDateStr = getLocalDateString(pointerDate);
      if (uniqueCompletionDates.includes(checkDateStr)) {
        activeStreak++;
        pointerDate.setDate(pointerDate.getDate() - 1);
      } else {
        if (i === 0) {
          pointerDate.setDate(pointerDate.getDate() - 1);
          const yesterdayCheckStr = getLocalDateString(pointerDate);
          if (uniqueCompletionDates.includes(yesterdayCheckStr)) {
            continue;
          }
        }
        break;
      }
    }

    const calculatedBestStreak = Math.max(activeStreak, userStats.bestStreak);

    return {
      streakCount: activeStreak,
      lastCompletedDate: uniqueCompletionDates[uniqueCompletionDates.length - 1],
      bestStreak: calculatedBestStreak
    };
  };

  const handleTaskCheckToggle = (taskId: string) => {
    const nowIso = getLocalISOString();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.completed;
        return {
          ...t,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? nowIso : null,
          updatedAt: nowIso
        };
      }
      return t;
    });

    const refreshedStats = computeAndPersistCompletedStreak(updated);
    persistState(updated, goals, reminders, refreshedStats);
  };

  const handleTaskSubmit = (
    editingTaskId: string | undefined,
    taskData: Omit<Task, 'id' | 'userId' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt' | 'order'>
  ) => {
    const nowIso = getLocalISOString();
    let updatedTasks = [...tasks];

    if (editingTaskId) {
      updatedTasks = tasks.map(t => 
        t.id === editingTaskId 
          ? {
              ...t,
              ...taskData,
              updatedAt: nowIso
            }
          : t
      );
      
      const updatedReminders = reminders.map(r => 
        r.taskId === editingTaskId 
          ? {
              ...r,
              taskTitle: taskData.title,
              time: taskData.dueTime,
              days: taskData.recurringDays.length > 0 ? taskData.recurringDays : [0, 1, 2, 3, 4, 5, 6],
              updatedAt: nowIso,
            }
          : r
      );
      
      persistState(updatedTasks, goals, updatedReminders);
    } else {
      if (taskData.isRecurring) {
        const recurrenceGroupId = `rec-${Date.now()}`;
        const startDateStr = taskData.dueDate;
        let dates = [startDateStr];

        if (taskData.goalId) {
          const goal = goals.find(g => g.id === taskData.goalId);
          if (goal && goal.targetDate) {
            dates = generateRecurringDates(
              startDateStr,
              goal.targetDate,
              taskData.recurringType || 'daily',
              taskData.recurringDays
            );
          }
        }

        const newTasks: Task[] = [];
        const newReminders: Reminder[] = [];

        dates.forEach((dateStr, index) => {
          const newId = `task-${Date.now()}-${index}`;
          const newTask: Task = {
            ...taskData,
            id: newId,
            userId,
            dueDate: dateStr,
            completed: false,
            completedAt: null,
            order: tasks.length + index,
            isRecurring: true,
            recurrenceGroupId,
            createdAt: nowIso,
            updatedAt: nowIso
          };
          newTasks.push(newTask);

          const newReminder: Reminder = {
            id: `reminder-${Date.now()}-${index}`,
            userId,
            taskId: newId,
            taskTitle: taskData.title,
            time: taskData.dueTime || '09:00',
            days: taskData.recurringDays.length > 0 ? taskData.recurringDays : [0, 1, 2, 3, 4, 5, 6],
            lastTriggered: null,
            snoozedUntil: null,
            isActive: true,
            updatedAt: nowIso,
          };
          newReminders.push(newReminder);
        });

        const updatedTasksList = [...newTasks, ...tasks];
        const updatedRemindersList = [...newReminders, ...reminders];
        persistState(updatedTasksList, goals, updatedRemindersList);
      } else {
        const newId = `task-${Date.now()}`;
        const newTask: Task = {
          ...taskData,
          id: newId,
          userId,
          completed: false,
          completedAt: null,
          order: tasks.length,
          recurrenceGroupId: null,
          createdAt: nowIso,
          updatedAt: nowIso
        };

        updatedTasks.unshift(newTask);

        const newReminder: Reminder = {
          id: `reminder-${Date.now()}`,
          userId,
          taskId: newId,
          taskTitle: taskData.title,
          time: taskData.dueTime || '09:00',
          days: taskData.recurringDays.length > 0 ? taskData.recurringDays : [0, 1, 2, 3, 4, 5, 6],
          lastTriggered: null,
          snoozedUntil: null,
          isActive: true,
          updatedAt: nowIso,
        };

        const updatedReminders = [newReminder, ...reminders];
        persistState(updatedTasks, goals, updatedReminders);
      }
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    let updatedTasks = tasks;
    let updatedReminders = reminders;
    let deletedTaskIds: string[] = [];

    if (taskToDelete && taskToDelete.isRecurring && taskToDelete.recurrenceGroupId) {
      const targetGroupId = taskToDelete.recurrenceGroupId;
      const tasksToDelete = tasks.filter(t => t.recurrenceGroupId === targetGroupId);
      deletedTaskIds = tasksToDelete.map(t => t.id);
      
      updatedTasks = tasks.filter(t => t.recurrenceGroupId !== targetGroupId);
      updatedReminders = reminders.filter(r => !deletedTaskIds.includes(r.taskId));
    } else {
      deletedTaskIds = [taskId];
      updatedTasks = tasks.filter((entry) => entry.id !== taskId);
      updatedReminders = reminders.filter((entry) => entry.taskId !== taskId);
    }

    persistState(updatedTasks, goals, updatedReminders);

    if (userId && isActuallyOnline) {
      try {
        await Promise.all(
          deletedTaskIds.map(async (id) => {
            await deleteCloudDocument(userId, 'tasks', id);
            const linkedReminders = reminders.filter((entry) => entry.taskId === id);
            await Promise.all(
              linkedReminders.map((entry) => deleteCloudDocument(userId, 'reminders', entry.id)),
            );
          })
        );
      } catch (error) {
        console.error('Failed to delete task(s) from cloud:', error);
      }
    }
  };

  const handleGoalSubmit = (
    editingGoalId: string | undefined,
    goalData: Omit<Goal, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>
  ) => {
    const nowIso = new Date().toISOString();
    let updatedGoals = [...goals];

    if (editingGoalId) {
      updatedGoals = goals.map(g => 
        g.id === editingGoalId 
          ? {
              ...g,
              ...goalData,
              updatedAt: nowIso
            }
          : g
      );
      persistState(tasks, updatedGoals, reminders);
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        userId,
        completed: false,
        status: 'active',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      updatedGoals.push(newGoal);
      persistState(tasks, updatedGoals, reminders);
    }
  };

  const handleGoalDelete = async (goalId: string) => {
    const updatedGoals = goals.filter((entry) => entry.id !== goalId);
    const milestonesToDelete = milestones.filter((entry) => entry.goalId === goalId);
    const updatedMilestones = milestones.filter((entry) => entry.goalId !== goalId);
    
    const tasksToDelete = tasks.filter((entry) => entry.goalId === goalId);
    const deletedTaskIds = tasksToDelete.map((t) => t.id);
    const updatedTasks = tasks.filter((entry) => entry.goalId !== goalId);
    const updatedReminders = reminders.filter((entry) => !deletedTaskIds.includes(entry.taskId));
    
    persistState(updatedTasks, updatedGoals, updatedReminders, userStats, userProfile, updatedMilestones);

    if (userId && isActuallyOnline) {
      try {
        await deleteCloudDocument(userId, 'goals', goalId);
        
        await Promise.all(
          milestonesToDelete.map((m) => deleteCloudDocument(userId, 'milestones', m.id))
        );
        
        await Promise.all(
          deletedTaskIds.map(async (id) => {
            await deleteCloudDocument(userId, 'tasks', id);
            const linkedReminders = reminders.filter((entry) => entry.taskId === id);
            await Promise.all(
              linkedReminders.map((entry) => deleteCloudDocument(userId, 'reminders', entry.id))
            );
          })
        );
      } catch (error) {
        console.error('Failed to cascade delete goal components from cloud:', error);
      }
    }
  };

  const handleGoalToggleComplete = (goalId: string) => {
    const nowIso = new Date().toISOString();
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          status: nextCompleted ? 'completed' : 'active' as Goal['status'],
          updatedAt: nowIso
        };
      }
      return g;
    });
    persistState(tasks, updated, reminders);
  };

  const handleAddMilestone = (goalId: string, title: string, targetDate?: string) => {
    const nowIso = new Date().toISOString();
    const newId = `milestone-${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      goalId,
      title,
      targetDate,
      order: milestones.filter(m => m.goalId === goalId).length,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const updatedMilestones = [...milestones, newMilestone];
    persistState(tasks, goals, reminders, userStats, userProfile, updatedMilestones);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
    const updatedTasks = tasks.map(t => t.milestoneId === milestoneId ? { ...t, milestoneId: null } : t);
    persistState(updatedTasks, goals, reminders, userStats, userProfile, updatedMilestones);

    if (userId && isActuallyOnline) {
      deleteCloudDocument(userId, 'milestones', milestoneId).catch(err => console.error(err));
    }
  };

  const handleUpdateMilestone = (
    milestoneId: string,
    updates: Partial<Omit<Milestone, 'id' | 'goalId' | 'createdAt' | 'updatedAt'>>
  ) => {
    const nowIso = new Date().toISOString();
    const updatedMilestones = milestones.map(m =>
      m.id === milestoneId
        ? { ...m, ...updates, updatedAt: nowIso }
        : m
    );
    persistState(tasks, goals, reminders, userStats, userProfile, updatedMilestones);
  };

  const handleMoveMilestone = (milestoneId: string, direction: 'up' | 'down') => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const goalId = milestone.goalId;
    const goalMilestones = milestones
      .filter(m => m.goalId === goalId)
      .sort((a, b) => a.order - b.order);

    const index = goalMilestones.findIndex(m => m.id === milestoneId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= goalMilestones.length) return;

    // Swap the order values
    const updatedMilestones = milestones.map(m => {
      if (m.id === goalMilestones[index].id) {
        return { ...m, order: goalMilestones[targetIndex].order, updatedAt: new Date().toISOString() };
      }
      if (m.id === goalMilestones[targetIndex].id) {
        return { ...m, order: goalMilestones[index].order, updatedAt: new Date().toISOString() };
      }
      return m;
    });

    persistState(tasks, goals, reminders, userStats, userProfile, updatedMilestones);
  };

  const handleAddTaskToMilestone = (milestoneId: string, taskTitle: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const nowIso = new Date().toISOString();
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      userId,
      title: taskTitle,
      description: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueTime: '09:00',
      category: userProfile?.persona === 'founder' ? 'Development' : 'Study',
      categoryId: userProfile?.persona === 'founder' ? 'cat-dev' : 'cat-study',
      completed: false,
      completedAt: null,
      goalId: milestone.goalId,
      milestoneId,
      order: tasks.length,
      isRecurring: false,
      recurringType: null,
      recurringDays: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedTasks = [newTask, ...tasks];
    persistState(updatedTasks, goals, reminders, userStats, userProfile, milestones);
  };

  const handleAddPipelineItem = (itemData: Omit<PipelineItem, 'id' | 'userId' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newItem: PipelineItem = {
      ...itemData,
      id: `deal-${Date.now()}`,
      userId,
      updatedAt: nowIso,
    };
    const updated = [newItem, ...pipelineItems];
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, updated);
  };

  const handleUpdatePipelineItem = (id: string, updates: Partial<PipelineItem>) => {
    const nowIso = new Date().toISOString();
    const updated = pipelineItems.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: nowIso } : item
    );
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, updated);
  };

  const handleDeletePipelineItem = (id: string) => {
    const updated = pipelineItems.filter(item => item.id !== id);
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, updated);
    if (userId && isActuallyOnline) {
      deleteCloudDocument(userId, 'pipeline', id).catch(err => console.error(err));
    }
  };

  const handleUpdateFounderStats = (stats: FounderStats) => {
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, pipelineItems, placementApplications, placementPrep, stats);
  };

  const handleAddPlacementApplication = (appData: Omit<PlacementApplication, 'id' | 'userId' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newApp: PlacementApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      userId,
      updatedAt: nowIso,
    };
    const updated = [newApp, ...placementApplications];
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, pipelineItems, updated);
  };

  const handleUpdatePlacementApplication = (id: string, updates: Partial<PlacementApplication>) => {
    const nowIso = new Date().toISOString();
    const updated = placementApplications.map(app =>
      app.id === id ? { ...app, ...updates, updatedAt: nowIso } : app
    );
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, pipelineItems, updated);
  };

  const handleDeletePlacementApplication = (id: string) => {
    const updated = placementApplications.filter(app => app.id !== id);
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, pipelineItems, updated);
    if (userId && isActuallyOnline) {
      deleteCloudDocument(userId, 'placementApplications', id).catch(err => console.error(err));
    }
  };

  const handleUpdatePlacementPrep = (prep: PlacementPrep) => {
    persistState(tasks, goals, reminders, userStats, userProfile, milestones, categories, pipelineItems, placementApplications, prep);
  };

  const handleMoveOrder = (taskId: string, direction: 'up' | 'down') => {
    const index = tasks.findIndex((entry) => entry.id === taskId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const updated = [...tasks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((entry, idx) => ({ ...entry, order: idx }));
    persistState(reordered, goals, reminders);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    persistState(reorderedTasks, goals, reminders);
  };

  const handleToggleReminderActive = (reminderId: string) => {
    const updated = reminders.map(r =>
      r.id === reminderId
        ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() }
        : r
    );
    persistState(tasks, goals, updated);
  };

  const handleOnboardingComplete = (persona: Persona, selectedTemplateId: string | null) => {
    const nowIso = new Date().toISOString();
    
    const newProfile: UserProfile = {
      id: userId,
      persona,
      onboardingCompleted: true,
      subscription: {
        plan: 'free',
        features: {
          aiCoach: false,
          roadmap: true,
          revenueTracker: persona === 'founder',
          placementTracker: persona === 'student',
          advancedAnalytics: false,
          weeklyReviews: false,
        }
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    let seededGoals: Goal[] = [];
    let seededMilestones: Milestone[] = [];
    let seededTasks: Task[] = [];

    if (selectedTemplateId) {
      const template = GOAL_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        const goalId = `goal-${Date.now()}`;
        const newGoal: Goal = {
          id: goalId,
          userId,
          title: template.title,
          description: template.description,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'long-term',
          category: persona === 'founder' ? 'Development' : 'Study',
          completed: false,
          status: 'active',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        seededGoals.push(newGoal);

        template.milestones.forEach((mTitle, index) => {
          const milestoneId = `milestone-${Date.now()}-${index}`;
          const newMilestone: Milestone = {
            id: milestoneId,
            goalId,
            title: mTitle,
            targetDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order: index,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          seededMilestones.push(newMilestone);

          if (index === 0) {
            const taskId = `task-${Date.now()}`;
            const starterTask: Task = {
              id: taskId,
              userId,
              title: `Complete starter step for: ${mTitle}`,
              description: 'Automatically created blueprint starter task.',
              priority: 'high',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              dueTime: '09:00',
              category: persona === 'founder' ? 'Development' : 'Study',
              categoryId: persona === 'founder' ? 'cat-dev' : 'cat-study',
              completed: false,
              completedAt: null,
              goalId,
              milestoneId,
              order: 0,
              isRecurring: false,
              recurringType: null,
              recurringDays: [],
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            seededTasks.push(starterTask);
          }
        });
      }
    }

    persistState(
      [...seededTasks, ...tasks],
      [...seededGoals, ...goals],
      reminders,
      userStats,
      newProfile,
      [...seededMilestones, ...milestones],
      categories.length > 0 ? categories : DEFAULT_CATEGORIES
    );
  };

  // Catch up recurring daily tasks on day change
  useEffect(() => {
    if (isLoadingData || !userId || tasks.length === 0) return;

    // Only look at daily recurring tasks
    const dailyRecurringTasks = tasks.filter(t => t.isRecurring && t.recurringType === 'daily');
    if (dailyRecurringTasks.length === 0) return;

    const groups: { [key: string]: Task[] } = {};
    dailyRecurringTasks.forEach(t => {
      const key = t.recurrenceGroupId || `${t.title}-${t.dueTime}-${t.goalId || ''}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    let stateChanged = false;
    const newTasksToAppend: Task[] = [];
    const newRemindersToAppend: Reminder[] = [];

    const nowIso = getLocalISOString();

    Object.entries(groups).forEach(([key, groupTasks]) => {
      // Find latest instance
      let latestInstance = groupTasks[0];
      groupTasks.forEach(t => {
        if (t.dueDate > latestInstance.dueDate) {
          latestInstance = t;
        }
      });

      // If the latest instance due date is in the past, catch up to today
      if (latestInstance.dueDate < todayStr) {
        // Calculate days to generate
        const nextDate = new Date(latestInstance.dueDate + 'T00:00:00');
        
        // Loop and add daily tasks (cap at 30 days max catch-up to prevent performance overhead)
        let loops = 0;
        while (loops < 30) {
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateStr = getLocalDateString(nextDate);
          if (nextDateStr > todayStr) break;
          loops++;

          // If linked to a goal, check target date
          if (latestInstance.goalId) {
            const goal = goals.find(g => g.id === latestInstance.goalId);
            if (goal && goal.targetDate && nextDateStr > goal.targetDate) {
              break; // Do not generate beyond goal target date
            }
          }

          // Check if this date already has an instance (to avoid duplicate generation if something partially failed)
          const alreadyExists = groupTasks.some(t => t.dueDate === nextDateStr) || 
                                newTasksToAppend.some(t => {
                                  const tKey = t.recurrenceGroupId || `${t.title}-${t.dueTime}-${t.goalId || ''}`;
                                  return tKey === key && t.dueDate === nextDateStr;
                                });
          
          if (!alreadyExists) {
            const newTaskId = `task-${Date.now()}-${nextDateStr}-${Math.random().toString(36).substr(2, 5)}`;
            const newTask: Task = {
              ...latestInstance,
              id: newTaskId,
              dueDate: nextDateStr,
              completed: false,
              completedAt: null,
              createdAt: nowIso,
              updatedAt: nowIso,
              order: tasks.length + newTasksToAppend.length,
            };
            newTasksToAppend.push(newTask);

            // Also create a reminder
            const newReminder: Reminder = {
              id: `reminder-${Date.now()}-${nextDateStr}-${Math.random().toString(36).substr(2, 5)}`,
              userId: latestInstance.userId,
              taskId: newTaskId,
              taskTitle: latestInstance.title,
              time: latestInstance.dueTime || '09:00',
              days: [0, 1, 2, 3, 4, 5, 6], // daily
              lastTriggered: null,
              snoozedUntil: null,
              isActive: true,
              updatedAt: nowIso,
            };
            newRemindersToAppend.push(newReminder);
            stateChanged = true;
          }
        }
      }
    });

    if (stateChanged) {
      persistState(
        [...newTasksToAppend, ...tasks],
        goals,
        [...newRemindersToAppend, ...reminders]
      );
    }
  }, [isLoadingData, userId, tasks, goals, reminders, todayStr, persistState]);

  return {
    authUser,
    userId,
    isAuthenticating,
    isLoadingData,
    userProfile,
    tasks,
    goals,
    milestones,
    categories,
    reminders,
    pipelineItems,
    placementApplications,
    placementPrep,
    founderStats,
    userStats,
    syncStats,
    isActuallyOnline,
    handleCloudSync,
    handleTaskCheckToggle,
    handleTaskSubmit,
    handleTaskDelete,
    handleGoalSubmit,
    handleGoalDelete,
    handleGoalToggleComplete,
    handleAddMilestone,
    handleDeleteMilestone,
    handleUpdateMilestone,
    handleMoveMilestone,
    handleAddTaskToMilestone,
    handleAddPipelineItem,
    handleUpdatePipelineItem,
    handleDeletePipelineItem,
    handleUpdateFounderStats,
    handleAddPlacementApplication,
    handleUpdatePlacementApplication,
    handleDeletePlacementApplication,
    handleUpdatePlacementPrep,
    handleMoveOrder,
    handleReorderTasks,
    handleToggleReminderActive,
    handleOnboardingComplete,
  };
}
