import React, { useMemo } from 'react';
import { Sparkles, AlertTriangle, CheckSquare, TrendingUp, Calendar, Award } from 'lucide-react';
import { Task, Goal, Milestone, AIReview, TaskCategory } from '../types';
import { getLocalDateString } from '../utils/date';

interface AIDailyBriefProps {
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  categories: TaskCategory[];
  userId: string;
  onSaveReview?: (review: Omit<AIReview, 'id' | 'userId' | 'generatedAt'>) => void;
}

export default function AIDailyBrief({ tasks, goals, milestones, categories, userId, onSaveReview }: AIDailyBriefProps) {
  // 1. Generate Proactive Daily Focus
  const dailyFocusData = useMemo(() => {
    const today = getLocalDateString();
    const todayTasks = tasks.filter(t => {
      return !t.completed && (t.dueDate === today || t.dueDate < today);
    });
    
    // Sort: High priority first, then ordered
    const sorted = [...todayTasks].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority] || a.order - b.order;
    });

    // Select top 3
    const focusTasks = sorted.slice(0, 3);

    // Calculate progress impact
    const impacts = focusTasks.map(task => {
      if (!task.goalId) return null;
      const goal = goals.find(g => g.id === task.goalId);
      if (!goal) return null;

      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      const totalCount = goalTasks.length;
      if (totalCount === 0) return null;

      // Completion impact of completing this single task
      const impactPercent = Math.round((1 / totalCount) * 100);
      return {
        taskTitle: task.title,
        goalTitle: goal.title,
        impact: impactPercent
      };
    }).filter(Boolean);

    return { focusTasks, impacts };
  }, [tasks, goals]);

  // 2. Risk Detection System
  const riskAlerts = useMemo(() => {
    const alerts: Array<{ goalTitle: string; daysRemaining: number; progress: number; severity: 'warning' | 'critical' }> = [];
    
    goals.forEach(goal => {
      if (goal.completed) return;

      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      const totalCount = goalTasks.length;
      const completedCount = goalTasks.filter(t => t.completed).length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const targetDateObj = new Date(goal.targetDate);
      const remainingDays = Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (remainingDays <= 7 && progress < 40) {
        alerts.push({ goalTitle: goal.title, daysRemaining: remainingDays, progress, severity: 'critical' });
      } else if (remainingDays <= 14 && progress < 60) {
        alerts.push({ goalTitle: goal.title, daysRemaining: remainingDays, progress, severity: 'warning' });
      }
    });

    return alerts;
  }, [goals, tasks]);

  // 3. Weekly Achievements & Neglected Areas Summary
  const weeklyReviewData = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const completedThisWeek = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) >= oneWeekAgo);
    
    // Find neglected categories: categories with highest proportion of overdue incomplete tasks
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date());
    const categoryCounts: { [catId: string]: number } = {};
    
    overdueTasks.forEach(t => {
      categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
    });

    let neglectedCategoryName = 'None';
    let maxOverdueCount = 0;
    
    Object.entries(categoryCounts).forEach(([catId, count]) => {
      if (count > maxOverdueCount) {
        maxOverdueCount = count;
        const cat = categories.find(c => c.id === catId);
        if (cat) neglectedCategoryName = cat.name;
      }
    });

    return {
      completedCount: completedThisWeek.length,
      neglectedCategory: neglectedCategoryName,
      milestonesMet: 0, // Placeholder or count milestones met
    };
  }, [tasks, categories]);

  return (
    <div className="space-y-6">
      
      {/* Daily Brief Dashboard Card */}
      <div className="bento-card p-6 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/20 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">AI Daily Focus Brief</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Focus Recommendations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Today's Focus Items</h4>
            {dailyFocusData.focusTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No tasks scheduled for today. Create high priority items to start executing.</p>
            ) : (
              <div className="space-y-2">
                {dailyFocusData.focusTasks.map((task, idx) => (
                  <div key={task.id} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-zinc-400">
                      {idx + 1}
                    </span>
                    <span className="font-medium mt-0.5">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Impact & Goals Advancement */}
          <div className="space-y-4 md:border-l md:border-white/5 md:pl-6">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Advancement Impact</h4>
            {dailyFocusData.impacts.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">None of today's focus items are linked to core goals.</p>
            ) : (
              <div className="space-y-2.5">
                {dailyFocusData.impacts.map((imp, idx) => imp && (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-4 h-4 text-emerald-450 shrink-0" />
                    <span className="text-zinc-400">
                      Completing <strong className="text-zinc-200">"{imp.taskTitle}"</strong> advances <strong className="text-indigo-400">"{imp.goalTitle}"</strong> by <strong className="text-emerald-400">+{imp.impact}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Warnings Panel */}
      {riskAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-450" />
            Risk Detection Alerts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskAlerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  alert.severity === 'critical' 
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-450' 
                    : 'bg-amber-500/5 border-amber-500/20 text-amber-450'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                    {alert.severity === 'critical' ? 'CRITICAL RISK' : 'WARNING'}
                  </span>
                  <p className="text-xs font-medium text-white">{alert.goalTitle}</p>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Target date is <span className="text-white font-semibold">{alert.daysRemaining} days away</span>, but goal is only <span className="text-white font-semibold">{alert.progress}% complete</span>. We recommend scheduling priority sub-tasks.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly review stats */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Weekly Execution Metrics</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Tasks Completed</span>
            <span className="text-2xl font-extrabold text-white font-mono">{weeklyReviewData.completedCount}</span>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Milestones Met</span>
            <span className="text-2xl font-extrabold text-white font-mono">{weeklyReviewData.milestonesMet}</span>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-1 text-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Most Neglected Area</span>
            <span className="text-xs font-extrabold text-indigo-400 truncate block mt-2">{weeklyReviewData.neglectedCategory}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
