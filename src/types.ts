export type Priority = 'high' | 'medium' | 'low';

export type GoalType = 'short-term' | 'long-term';

export type Persona = 'founder' | 'student' | 'general';

export type GoalStatus = 'not_started' | 'active' | 'at_risk' | 'completed' | 'paused';

export type GoalHealth = 'healthy' | 'warning' | 'critical';

export interface UserSubscription {
  plan: 'free' | 'pro';
  features: {
    aiCoach: boolean;
    roadmap: boolean;
    revenueTracker: boolean;
    placementTracker: boolean;
    advancedAnalytics: boolean;
    weeklyReviews: boolean;
  };
}

export interface UserProfile {
  id: string;
  persona: Persona;
  onboardingCompleted: boolean;
  subscription: UserSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineItem {
  id: string;
  userId: string;
  name: string;
  company: string;
  stage: 'lead' | 'prospect' | 'trial' | 'customer' | 'lost';
  value: number;
  notes: string;
  updatedAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  category: string; // keep for backward compatibility
  categoryId: string; // reference to TaskCategory
  completed: boolean;
  completedAt: string | null; // ISO timestamp
  goalId: string | null; // linked goal
  milestoneId: string | null; // linked milestone
  order: number;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'custom' | null;
  recurringDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  recurrenceGroupId?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string; // YYYY-MM-DD
  type: GoalType;
  category: string;
  completed: boolean;
  status: GoalStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface GoalTemplate {
  id: string;
  persona: Persona;
  title: string;
  description: string;
  milestones: string[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  time: string; // HH:MM
  days: number[]; // days of the week it repeats (0-6)
  lastTriggered: string | null; // ISO
  snoozedUntil: string | null; // ISO timestamp of snooze end
  isActive: boolean;
  updatedAt: string; // ISO
}

export interface SyncStats {
  unsyncedCount: number;
  lastSyncedAt: string | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
}

export interface UserStats {
  streakCount: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  bestStreak: number;
  completionRate?: number;
  focusScore?: number;
}

export interface AIReview {
  id: string;
  userId: string;
  type: 'daily' | 'weekly';
  generatedAt: string;
  summary: string;
  recommendations: string[];
  metrics: {
    completionRate: number;
    focusScore: number;
    streakCount: number;
  };
}

export interface PlacementApplication {
  id: string;
  userId: string;
  role: string;
  company: string;
  stage: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  notes: string;
  updatedAt: string;
}

export interface PlacementPrep {
  dsaCount: number;
  mockInterviews: number;
  resumeStatus: 'draft' | 'under_review' | 'approved';
  updatedAt: string;
}

export interface FounderStats {
  revenueTarget: number;
  monthlyRevenue: number;
  updatedAt: string;
}


