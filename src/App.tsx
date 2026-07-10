import React, { useState, useEffect, useMemo } from 'react';
import { Keyboard } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router';
import { Task, Goal, Persona } from './types';
import { 
  signInWithGoogle, signOutUser, isGoogleAccount 
} from './firebase';
import {
  loadNotificationsEnabled, loadThemePreference,
  saveNotificationsEnabled, saveThemePreference
} from './utils/storage';

// Hook Injections
import { usePlannerState } from './hooks/usePlannerState';
import { useReminderAlerts } from './hooks/useReminderAlerts';
import { getLocalDateString } from './utils/date';

// Component Injections
import TaskForm from './components/TaskForm';
import GoalForm from './components/GoalForm';
import DashboardAnalytics from './components/DashboardAnalytics';
import NotificationToast from './components/NotificationToast';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ConfirmDialog from './components/ConfirmDialog';
import OnboardingWizard from './components/OnboardingWizard';
import RoadmapView from './components/RoadmapView';
import FounderDashboard from './components/FounderDashboard';
import StudentDashboard from './components/StudentDashboard';
import CalendarView from './components/CalendarView';
import LoginView from './components/LoginView';

// Layout & View Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TodayView from './components/views/TodayView';
import GoalsView from './components/views/GoalsView';
import SettingsView from './components/views/SettingsView';

type PendingDelete =
  | { type: 'task'; id: string; title: string }
  | { type: 'goal'; id: string; title: string };

export default function App() {
  // Theme & Settings Local State
  const [isThemeDark, setIsThemeDark] = useState<boolean>(() => loadThemePreference());
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => loadNotificationsEnabled());
  const location = useLocation();
  const navigate = useNavigate();
  
  // Clean activeView mapping from path
  const pathPart = location.pathname.substring(1);
  const activeView = pathPart === '' ? 'today' : pathPart;

  const setActiveView = (view: string) => {
    navigate(view === 'today' ? '/' : `/${view}`);
  };

  // Logic Hook
  const planner = usePlannerState();

  // Reminder alert hook integration
  const alerts = useReminderAlerts({
    reminders: planner.reminders,
    tasks: planner.tasks,
    goals: planner.goals,
    notificationsEnabled,
    persistState: planner.handleReorderTasks,
    onTaskCheckToggle: planner.handleTaskCheckToggle,
  });

  // UI Dialog States
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  // Local Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sync theme
  useEffect(() => {
    if (isThemeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveThemePreference(isThemeDark);
  }, [isThemeDark]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          setIsTaskFormOpen(false);
          setIsGoalFormOpen(false);
          setIsShortcutsHelpOpen(false);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setEditingTask(undefined);
          setIsTaskFormOpen(true);
          break;
        case 'g':
          e.preventDefault();
          setEditingGoal(undefined);
          setIsGoalFormOpen(true);
          break;
        case 'k':
          e.preventDefault();
          setIsShortcutsHelpOpen(prev => !prev);
          break;
        case 't':
          e.preventDefault();
          setIsThemeDark(prev => !prev);
          break;
        case 's':
          e.preventDefault();
          planner.handleCloudSync();
          break;
        case 'escape':
          setIsTaskFormOpen(false);
          setIsGoalFormOpen(false);
          setIsShortcutsHelpOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [planner]);

  const todayStr = useMemo(() => getLocalDateString(), []);

  // Tasks search & filtering logic
  const distinctCategories = useMemo(() => {
    const cats = planner.tasks.map(t => t.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [planner.tasks]);

  const filteredTasks = useMemo(() => {
    return planner.tasks.filter(t => {
      // 1. Date Filtering
      const isScheduledToday = t.dueDate === todayStr;
      const isOverdueIncomplete = t.dueDate && t.dueDate < todayStr && !t.completed;

      if (!isScheduledToday && !isOverdueIncomplete) {
        return false;
      }

      // 2. Text Search & Category/Priority Filter
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      return matchSearch && matchCategory && matchPriority;
    });
  }, [planner.tasks, searchQuery, categoryFilter, priorityFilter, todayStr]);

  const totalTasksCount = planner.tasks.length;
  const completedTasksCount = planner.tasks.filter(t => t.completed).length;
  const progressRatio = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  // Handlers mappings
  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'userId' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt' | 'order'>) => {
    planner.handleTaskSubmit(editingTask?.id, taskData);
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  const handleGoalSubmit = (goalData: Omit<Goal, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>) => {
    planner.handleGoalSubmit(editingGoal?.id, goalData);
    setIsGoalFormOpen(false);
    setEditingGoal(undefined);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'task') {
      await planner.handleTaskDelete(pendingDelete.id);
    } else {
      await planner.handleGoalDelete(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled && typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    saveNotificationsEnabled(nextValue);
  };

  const handleAddTaskAtDate = (date: string, time: string) => {
    setEditingTask({
      dueDate: date,
      dueTime: time,
      title: '',
      description: '',
      priority: 'medium',
      category: planner.userProfile?.persona === 'founder' ? 'Development' : 'Study',
      categoryId: planner.userProfile?.persona === 'founder' ? 'cat-dev' : 'cat-study',
    } as Task);
    setIsTaskFormOpen(true);
  };

  if (planner.isAuthenticating) {
    return (
      <div className="min-h-screen bg-bg-app text-text-app flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-650 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-semibold text-text-title">Loading FocusSpace…</p>
          <p className="text-xs text-text-dim">Verifying session</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users must land on /login or redirect there
  if (!planner.authUser) {
    if (location.pathname === '/login') {
      return (
        <LoginView
          onSignIn={signInWithGoogle}
          isAuthenticating={planner.isAuthenticating || planner.isLoadingData}
        />
      );
    }
    return <Navigate to="/login" replace />;
  }

  // 2. Authenticated users on /login are redirected to home page
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // 3. Authenticated onboarding block
  if (!planner.userProfile || !planner.userProfile.onboardingCompleted) {
    return <OnboardingWizard onComplete={planner.handleOnboardingComplete} />;
  }

  // 4. Loading data for authenticated user
  if (planner.isLoadingData) {
    return (
      <div className="min-h-screen bg-bg-app text-text-app flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-650 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-semibold text-text-title">Loading your planner…</p>
          <p className="text-xs text-text-dim">Syncing tasks and goals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-app font-sans transition-colors duration-200">
      
      <Header
        authUser={planner.authUser}
        isAuthenticating={planner.isAuthenticating}
        syncStats={planner.syncStats}
        isActuallyOnline={planner.isActuallyOnline}
        isThemeDark={isThemeDark}
        onThemeToggle={() => setIsThemeDark(prev => !prev)}
        onManualSync={planner.handleCloudSync}
        onShortcutsClick={() => setIsShortcutsHelpOpen(true)}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />

      {/* Hero Header Area - Streak counter alerts */}
      <section className="bg-bg-card/40 border-b border-border-subtle py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-text-title text-base">
              {isGoogleAccount(planner.authUser) ? 'Welcome back' : 'Your personal workspace'}
            </h2>
            <p className="text-text-muted text-xs mt-0.5">
              {isGoogleAccount(planner.authUser)
                ? 'Your tasks and goals sync across devices when you are online.'
                : 'Sign in with Google to back up and access your planner anywhere.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 p-2 px-4 rounded-xl">
              <span className="text-2xl font-bold font-display">{planner.userStats.streakCount}</span>
              <div className="text-[10px] leading-tight font-semibold">
                <span>DAY STREAK</span>
                <span className="block text-amber-500 font-bold">Best {planner.userStats.bestStreak}</span>
              </div>
            </div>

            <div className="flex flex-col text-xs font-medium text-text-muted leading-normal">
              <span>Overall completion</span>
              <span className="text-text-app font-bold font-mono text-sm leading-none mt-1">
                {Math.round(progressRatio)}% Complete
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          persona={planner.userProfile?.persona}
          tasksCount={filteredTasks.length}
          goalsCount={planner.goals.length}
          pipelineCount={planner.pipelineItems.length}
          applicationsCount={planner.placementApplications.length}
          remindersCount={planner.reminders.length}
          progressRatio={progressRatio}
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
        />

        {/* Dynamic Display Panels */}
        <section className="lg:col-span-9 space-y-6">
          
          <Routes>
            <Route path="/" element={
              <TodayView
                tasks={planner.tasks}
                filteredTasks={filteredTasks}
                goals={planner.goals}
                milestones={planner.milestones}
                categories={planner.categories}
                userId={planner.userId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                distinctCategories={distinctCategories}
                onTaskCheckToggle={planner.handleTaskCheckToggle}
                onTaskDelete={(id) => setPendingDelete({ type: 'task', id, title: planner.tasks.find(t => t.id === id)?.title || '' })}
                onEditTask={(t) => { setEditingTask(t); setIsTaskFormOpen(true); }}
                onPlanTaskClick={() => { setEditingTask(undefined); setIsTaskFormOpen(true); }}
                onMoveOrder={planner.handleMoveOrder}
                onReorderTasks={planner.handleReorderTasks}
                todayStr={todayStr}
              />
            } />

            <Route path="/today" element={<Navigate to="/" replace />} />

            <Route path="/goals" element={
              <GoalsView
                selectedGoalId={selectedGoalId}
                setSelectedGoalId={setSelectedGoalId}
                goals={planner.goals}
                milestones={planner.milestones}
                tasks={planner.tasks}
                categories={planner.categories}
                onAddMilestone={planner.handleAddMilestone}
                onDeleteMilestone={planner.handleDeleteMilestone}
                onUpdateMilestone={planner.handleUpdateMilestone}
                onMoveMilestone={planner.handleMoveMilestone}
                onAddTaskToMilestone={planner.handleAddTaskToMilestone}
                onToggleTaskComplete={planner.handleTaskCheckToggle}
                onDeleteTask={planner.handleTaskDelete}
                onGoalToggleComplete={planner.handleGoalToggleComplete}
                onEditGoal={(g) => { setEditingGoal(g); setIsGoalFormOpen(true); }}
                onGoalDelete={(id) => setPendingDelete({ type: 'goal', id, title: planner.goals.find(g => g.id === id)?.title || '' })}
                onNewGoalClick={() => { setEditingGoal(undefined); setIsGoalFormOpen(true); }}
              />
            } />

            <Route path="/roadmap" element={
              <RoadmapView
                goals={planner.goals}
                milestones={planner.milestones}
                tasks={planner.tasks}
                userPersona={planner.userProfile?.persona}
              />
            } />

            <Route path="/founder" element={
              planner.userProfile?.persona === 'founder' ? (
                <FounderDashboard
                  pipelineItems={planner.pipelineItems}
                  founderStats={planner.founderStats}
                  onAddPipelineItem={planner.handleAddPipelineItem}
                  onUpdatePipelineItem={planner.handleUpdatePipelineItem}
                  onDeletePipelineItem={planner.handleDeletePipelineItem}
                  onUpdateFounderStats={planner.handleUpdateFounderStats}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />

            <Route path="/student" element={
              planner.userProfile?.persona === 'student' ? (
                <StudentDashboard
                  applications={planner.placementApplications}
                  placementPrep={planner.placementPrep}
                  onAddApplication={planner.handleAddPlacementApplication}
                  onUpdateApplication={planner.handleUpdatePlacementApplication}
                  onDeleteApplication={planner.handleDeletePlacementApplication}
                  onUpdatePlacementPrep={planner.handleUpdatePlacementPrep}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />

            <Route path="/calendar" element={
              <CalendarView
                tasks={planner.tasks}
                goals={planner.goals}
                milestones={planner.milestones}
                onAddTaskAtDate={handleAddTaskAtDate}
              />
            } />

            <Route path="/analytics" element={
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="font-display font-medium text-text-title text-lg">
                    Wellness & Weekly Output Metrics
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Dynamic indices capturing consistent planning behaviors over past 7 days.
                  </p>
                </div>

                <DashboardAnalytics 
                  tasks={planner.tasks}
                  goals={planner.goals}
                  streakCount={planner.userStats.streakCount}
                  bestStreak={planner.userStats.bestStreak}
                />
              </div>
            } />

            <Route path="/settings" element={
              <SettingsView
                reminders={planner.reminders}
                syncStats={planner.syncStats}
                notificationsEnabled={notificationsEnabled}
                onToggleNotifications={handleToggleNotifications}
                onToggleReminderActive={planner.handleToggleReminderActive}
                authUser={planner.authUser}
                isAuthenticating={planner.isAuthenticating}
                onSignIn={signInWithGoogle}
                onSignOut={signOutUser}
              />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </section>

      </main>

      {/* Shortcuts Guide Helper */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <button
          onClick={() => setIsShortcutsHelpOpen(true)}
          className="p-3 rounded-full bg-bg-card border border-border-card hover:bg-bg-active text-text-app shadow-2xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Keyboard className="w-4 h-4 text-indigo-500 animate-bounce" />
          <span className="text-[10px] font-bold font-mono">Shortcuts [K]</span>
        </button>
      </div>

      {/* Overlay Modals */}
      <TaskForm 
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
        goals={planner.goals}
        milestones={planner.milestones}
        categories={planner.categories}
      />

      <GoalForm 
        isOpen={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        onSubmit={handleGoalSubmit}
        initialGoal={editingGoal}
      />

      <KeyboardShortcutsHelp 
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title={pendingDelete?.type === 'task' ? 'Delete task?' : 'Delete goal?'}
        message={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <NotificationToast 
        activeReminder={alerts.activeTriggeredReminder}
        onDismiss={() => alerts.setActiveTriggeredReminder(null)}
        onSnooze={alerts.handleNotificationSnooze}
        onComplete={alerts.handleNotificationComplete}
      />

    </div>
  );
}
