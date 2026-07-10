import React, { useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, CheckCircle, Flame, Target, 
  Calendar, Award, Activity, Heart, RefreshCw 
} from 'lucide-react';
import { Task, Goal } from '../types';
import { getLocalDateString } from '../utils/date';

interface DashboardAnalyticsProps {
  tasks: Task[];
  goals: Goal[];
  streakCount: number;
  bestStreak: number;
}

export default function DashboardAnalytics({ tasks, goals, streakCount, bestStreak }: DashboardAnalyticsProps) {
  
  // Weekly Metrics calculation
  const stats = useMemo(() => {
    // Generate dates of the last 7 days including today
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalDateString(d);
    }).reverse();

    // Mapping for weekdays
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Map tasks to completion date
    const dailyDataMap = dates.reduce((acc, date) => {
      const dayIndex = new Date(date).getDay();
      acc[date] = {
        date,
        dayLabel: weekdayLabels[dayIndex],
        completed: 0,
        total: 0,
      };
      return acc;
    }, {} as Record<string, { date: string; dayLabel: string; completed: number; total: number }>);

    // Populate data based on user tasks
    tasks.forEach(task => {
      // Due Date checks
      if (dailyDataMap[task.dueDate]) {
        dailyDataMap[task.dueDate].total += 1;
        if (task.completed) {
          dailyDataMap[task.dueDate].completed += 1;
        }
      } else {
        // If completed in last 7 days but due date was different, still count as completed trend
        if (task.completed && task.completedAt) {
          const finishedDate = task.completedAt.split('T')[0];
          if (dailyDataMap[finishedDate]) {
            dailyDataMap[finishedDate].completed += 1;
          }
        }
      }
    });

    // Make charts data
    const weeklyChartData = dates.map(date => {
      const info = dailyDataMap[date];
      return {
        name: info.dayLabel,
        'Completed Tasks': info.completed,
        'Scheduled Tasks': info.total || Math.max(info.completed, 1) // default line
      };
    });

    // Total stats
    const totalAddedLast7Days = tasks.length;
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const overallCompletionRate = totalAddedLast7Days > 0 
      ? Math.round((completedTasksCount / totalAddedLast7Days) * 100) 
      : 0;

    // Daily Consistency Score
    // Percentage of the last 7 days where at least 1 task was completed
    const daysWithCompletionCount = Object.values(dailyDataMap).filter(d => d.completed > 0).length;
    const consistencyScore = Math.round((daysWithCompletionCount / 7) * 100);

    // Goal Achievements / Linked Completion Calculations
    const goalCompletes = goals.map(g => {
      const linkedTasks = tasks.filter(t => t.goalId === g.id);
      const totalLinked = linkedTasks.length;
      const completedLinked = linkedTasks.filter(t => t.completed).length;
      
      const completionPercentage = totalLinked > 0 
        ? Math.round((completedLinked / totalLinked) * 100) 
        : g.completed ? 100 : 0;

      return {
        ...g,
        totalLinked,
        completedLinked,
        completionPercentage
      };
    });

    const activeGoalsCount = goals.filter(g => !g.completed).length;
    const completedGoalsCount = goals.filter(g => g.completed).length;

    return {
      weeklyChartData,
      overallCompletionRate,
      consistencyScore,
      goalCompletes,
      completedTasksCount,
      totalAddedLast7Days,
      activeGoalsCount,
      completedGoalsCount
    };
  }, [tasks, goals]);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row - Bento-style Minimal Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bento-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-400">Current Streak</span>
            <span className="p-1 px-2 rounded-md bg-amber-500/10 text-xs font-bold text-amber-400 flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Active
            </span>
          </div>
          <div className="mt-2">
            <span className="font-display text-3xl font-bold text-white">{streakCount}</span>
            <span className="text-[11px] text-zinc-500 block mt-1">Best streak: {bestStreak} days</span>
          </div>
        </div>

        {/* Completion rate */}
        <div className="bento-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-400">Completion rate</span>
            <span className="p-1 rounded-md bg-indigo-505/10 text-indigo-400">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-display text-3xl font-bold text-white">{stats.overallCompletionRate}%</span>
            <span className="text-[11px] text-zinc-500 block mt-1">
              {stats.completedTasksCount} / {stats.totalAddedLast7Days} tasks completed
            </span>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="bento-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-400">Consistency Score</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-display text-3xl font-bold text-white">{stats.consistencyScore}%</span>
            <span className="text-[11px] text-zinc-500 block mt-1">Last 7 days active frequency</span>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bento-card p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-400">Active Goals</span>
            <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-display text-3xl font-bold text-white">{stats.activeGoalsCount}</span>
            <span className="text-[11px] text-zinc-500 block mt-1">
              {stats.completedGoalsCount} milestones achieved
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity trend */}
        <div className="bento-card p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Weekly Productivity Trend
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">Completed vs. scheduled tasks over last 7 days</p>
            </div>
          </div>
          
          <div className="h-64 mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a', 
                    borderRadius: '8px',
                    color: '#fafafa',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Completed Tasks" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="Scheduled Tasks" 
                  stroke="#4b5563" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Overview Progress bar list */}
        <div className="bento-card p-5">
          <h4 className="font-display font-semibold text-white text-sm flex items-center gap-2 mb-1.5">
            <Award className="w-4 h-4 text-purple-400" /> Goal Projections
          </h4>
          <p className="text-xs text-zinc-500 mb-4">Completion ratios aligned with established planner habits</p>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {stats.goalCompletes.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No goals established yet. Toggle Goals to write guidelines!
              </div>
            ) : (
              stats.goalCompletes.map((g) => (
                <div key={g.id} className="space-y-1.5 pb-3 border-b border-white/5 last:border-none last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-zinc-200 line-clamp-1">
                      {g.title}
                    </span>
                    <span className="text-xs font-bold text-indigo-400 pl-2">
                      {g.completionPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span className="capitalize px-1.5 py-0.5 rounded-sm bg-white/5 text-[9px]">
                      {g.category}
                    </span>
                    <span>
                      {g.completedLinked} / {g.totalLinked} linked tasks complete
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${g.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
