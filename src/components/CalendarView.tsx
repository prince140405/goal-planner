import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Tag } from 'lucide-react';
import { Task, Goal, Milestone } from '../types';
import { getLocalDateString } from '../utils/date';

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  onAddTaskAtDate: (date: string, time: string) => void;
}

export default function CalendarView({
  tasks,
  goals,
  milestones,
  onAddTaskAtDate,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Hours for time-blocking (00:00 to 23:00)
  const HOURS = Array.from({ length: 24 }, (_, i) => {
    return `${String(i).padStart(2, '0')}:00`;
  });

  // Week helpers
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);

  // Month helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    // Padding for first week
    const padding = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // start from Monday
    for (let i = 0; i < padding; i++) {
      days.push(null);
    }

    // Fill days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const monthDays = getMonthDays(currentDate);

  const navigate = (direction: 'prev' | 'next') => {
    const offset = direction === 'prev' ? -1 : 1;
    const nextDate = new Date(currentDate);

    if (viewMode === 'week') {
      nextDate.setDate(currentDate.getDate() + offset * 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() + offset);
    }
    setCurrentDate(nextDate);
  };

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isTaskDueOnDate = (task: Task, dateString: string) => {
    if (!task.dueDate) return false;

    const todayStr = getLocalDateString();

    // 1. Past & Present: match only physical task instances
    if (dateString <= todayStr) {
      return task.dueDate === dateString;
    }

    // 2. Future: match physical instance OR project virtual instances for standalone recurring tasks
    if (task.dueDate === dateString) {
      return true;
    }

    if (task.isRecurring && !task.goalId) {
      if (dateString < task.dueDate) {
        return false;
      }

      // Cap future projection to 30 days from today to prevent infinite calendar clutter
      const maxProj = new Date();
      maxProj.setDate(maxProj.getDate() + 30);
      const maxProjStr = getLocalDateString(maxProj);
      if (dateString > maxProjStr) {
        return false;
      }

      if (task.recurringType === 'daily') {
        return true;
      }

      if (task.recurringType === 'weekly' || task.recurringType === 'custom') {
        const targetDate = new Date(dateString + 'T00:00:00');
        const dayOfWeek = targetDate.getDay();
        return task.recurringDays && task.recurringDays.includes(dayOfWeek);
      }
    }

    return false;
  };

  const isTaskCompletedOnDate = (task: Task, dateString: string) => {
    return task.completed && task.dueDate === dateString;
  };

  const getItemsForDate = (dateString: string) => {
    const dayTasks = tasks.filter((t) => isTaskDueOnDate(t, dateString));
    const dayGoals = goals.filter((g) => g.targetDate === dateString);
    const dayMilestones = milestones.filter((m) => m.targetDate === dateString);
    return { dayTasks, dayGoals, dayMilestones };
  };

  const getTasksForDateTime = (dateString: string, hourString: string) => {
    const [targetHour] = hourString.split(':');
    return tasks.filter((t) => {
      if (!isTaskDueOnDate(t, dateString) || !t.dueTime) return false;
      const [taskHour] = t.dueTime.split(':');
      return taskHour === targetHour;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bento-card overflow-hidden flex flex-col h-full bg-bg-card border border-border-card rounded-2xl p-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-550 dark:text-indigo-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-title tracking-tight">
              {viewMode === 'week' ? (
                <>
                  Week of {weekDates[0].getDate()} {monthNames[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
                </>
              ) : (
                <>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </>
              )}
            </h3>
            <span className="text-[10px] text-text-dim font-semibold font-mono">Timeblocking & Planner Timeline</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex bg-bg-input p-1 border border-border-input rounded-lg">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                viewMode === 'week' ? 'bg-indigo-600 text-white' : 'text-text-muted hover:text-text-title'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-indigo-600 text-white' : 'text-text-muted hover:text-text-title'
              }`}
            >
              Month View
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-bg-input border border-border-input p-0.5 rounded-lg">
            <button
              onClick={() => navigate('prev')}
              className="p-1.5 text-text-muted hover:text-text-title transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-[10px] font-bold text-text-muted hover:text-text-title border-x border-border-card cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-1.5 text-text-muted hover:text-text-title transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid (Time-blocked) */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-auto mt-4 max-h-[600px] border border-border-subtle rounded-xl">
          <div className="grid grid-cols-8 min-w-[700px] border-b border-border-card bg-bg-card">
            {/* Hours Header column */}
            <div className="p-3 border-r border-border-subtle text-[10px] font-bold text-text-dim uppercase tracking-widest text-center self-center">
              Hours
            </div>

            {/* Days Columns headers */}
            {weekDates.map((day, idx) => {
              const formatted = formatDateString(day);
              const isToday = formatDateString(new Date()) === formatted;
              const { dayTasks, dayGoals, dayMilestones } = getItemsForDate(formatted);

              return (
                <div
                  key={idx}
                  className={`p-3 border-r border-border-subtle text-center flex flex-col gap-0.5 justify-center ${
                    isToday ? 'bg-indigo-500/5 border-b-2 border-b-indigo-500' : ''
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-550 dark:text-indigo-400' : 'text-text-muted'}`}>
                    {dayNames[idx]}
                  </span>
                  <span className={`text-sm font-extrabold ${isToday ? 'text-indigo-550 dark:text-indigo-400' : 'text-text-title'}`}>
                    {day.getDate()}
                  </span>
                  {(dayGoals.length > 0 || dayMilestones.length > 0) && (
                    <div className="flex justify-center gap-1 mt-1">
                      {dayGoals.map((g) => (
                        <span key={g.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={`Goal: ${g.title}`} />
                      ))}
                      {dayMilestones.map((m) => (
                        <span key={m.id} className="w-1.5 h-1.5 rounded-full bg-amber-500" title={`Milestone: ${m.title}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          <div className="divide-y divide-border-subtle bg-bg-card/10">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-w-[700px]">
                {/* Time slot label */}
                <div className="p-2 border-r border-border-subtle flex items-center justify-center gap-1 text-[10px] font-mono text-text-dim border-b border-b-border-subtle">
                  <Clock className="w-3 h-3 text-text-dim" />
                  <span>{hour}</span>
                </div>

                {/* Day hourly cells */}
                {weekDates.map((day, idx) => {
                  const formattedDate = formatDateString(day);
                  const cellTasks = getTasksForDateTime(formattedDate, hour);

                  return (
                    <div
                      key={idx}
                      className="p-1 border-r border-border-subtle min-h-[50px] relative hover:bg-bg-active transition-colors group flex flex-col gap-1 border-b border-b-border-subtle"
                    >
                      {cellTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-1.5 rounded text-[10px] leading-tight font-semibold border flex flex-col gap-0.5 justify-between ${
                            isTaskCompletedOnDate(task, formattedDate)
                              ? 'bg-bg-active border-border-card text-text-dim line-through'
                              : task.priority === 'high'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300'
                              : task.priority === 'medium'
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                              : 'bg-bg-active border-border-card text-text-app'
                          }`}
                        >
                          <span className="truncate">{task.title}</span>
                          <span className="text-[8px] opacity-75 font-mono">{task.dueTime || hour}</span>
                        </div>
                      ))}

                      {/* Hover action to add a task */}
                      <button
                        onClick={() => onAddTaskAtDate(formattedDate, hour)}
                        className="absolute right-1 bottom-1 p-0.5 rounded bg-bg-active border border-border-input opacity-0 group-hover:opacity-100 hover:bg-bg-active/85 text-text-muted hover:text-text-title transition-all cursor-pointer"
                        title="Add task at this time"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Grid */}
      {viewMode === 'month' && (
        <div className="flex-1 overflow-auto mt-4 max-h-[600px] border border-border-subtle rounded-xl">
          <div className="grid grid-cols-7 border-b border-border-card bg-bg-card">
            {dayNames.map((name) => (
              <div key={name} className="p-3 text-[10px] font-bold text-text-dim uppercase tracking-widest text-center">
                {name}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-bg-card/10 divide-x divide-y divide-border-subtle border-t border-l border-border-subtle">
            {monthDays.map((day, idx) => {
              if (!day) {
                return (
                  <div key={`empty-${idx}`} className="bg-transparent min-h-[100px] border-b border-r border-border-subtle" />
                );
              }

              const formattedDate = formatDateString(day);
              const isToday = formatDateString(new Date()) === formattedDate;
              const { dayTasks, dayGoals, dayMilestones } = getItemsForDate(formattedDate);

              return (
                <div
                  key={formattedDate}
                  className={`p-2 min-h-[100px] relative hover:bg-bg-active transition-colors group flex flex-col gap-1 border-b border-r border-border-subtle ${
                    isToday ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isToday ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-text-dim'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <button
                      onClick={() => onAddTaskAtDate(formattedDate, '09:00')}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-bg-active border border-border-input hover:bg-bg-active/85 text-text-muted hover:text-text-title transition-all cursor-pointer"
                      title="Add task for this day"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                    {dayGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-0.5 px-1.5 rounded text-[8px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-650 dark:text-indigo-300 truncate"
                        title={`Goal: ${goal.title}`}
                      >
                        🎯 {goal.title}
                      </div>
                    ))}
                    {dayMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="p-0.5 px-1.5 rounded text-[8px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 truncate"
                        title={`Milestone: ${milestone.title}`}
                      >
                        📍 {milestone.title}
                      </div>
                    ))}
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-0.5 px-1.5 rounded text-[8px] font-semibold border truncate ${
                          isTaskCompletedOnDate(task, formattedDate)
                            ? 'bg-bg-active border-border-card text-text-dim line-through'
                            : task.priority === 'high'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300'
                            : 'bg-bg-active border-border-card text-text-app'
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
