import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, Tag, HelpCircle } from 'lucide-react';
import { Task, Priority, Goal, Milestone, TaskCategory } from '../types';
import { getLocalDateString } from '../utils/date';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'userId' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  initialTask?: Task;
  goals: Goal[];
  milestones: Milestone[];
  categories: TaskCategory[];
}

const PRESET_CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Study', 'Creative'];

export default function TaskForm({ isOpen, onClose, onSubmit, initialTask, goals, milestones, categories }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [goalId, setGoalId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  
  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [recurringDays, setRecurringDays] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description);
        setPriority(initialTask.priority);
        setDueDate(initialTask.dueDate);
        setDueTime(initialTask.dueTime);
        
        if (PRESET_CATEGORIES.includes(initialTask.category)) {
          setCategory(initialTask.category);
          setShowCustomCategoryInput(false);
        } else {
          setCategory('Custom');
          setCustomCategory(initialTask.category);
          setShowCustomCategoryInput(true);
        }

        setGoalId(initialTask.goalId || '');
        setMilestoneId(initialTask.milestoneId || '');
        setIsRecurring(initialTask.isRecurring);
        setRecurringType(initialTask.recurringType || 'daily');
        setRecurringDays(initialTask.recurringDays || []);
      } else {
        // Safe resets
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate(getLocalDateString());
        setDueTime('09:00');
        setCategory('Personal');
        setCustomCategory('');
        setShowCustomCategoryInput(false);
        setGoalId('');
        setMilestoneId('');
        setIsRecurring(false);
        setRecurringType('daily');
        setRecurringDays([]);
      }
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Custom' && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    // Handle automated recurringDays depending on selection
    let finalDays = [...recurringDays];
    if (isRecurring) {
      if (recurringType === 'daily') {
        finalDays = [0, 1, 2, 3, 4, 5, 6];
      } else if (recurringType === 'weekly' && finalDays.length === 0) {
        // Default to current day
        const currentDayIndex = new Date(dueDate || Date.now()).getDay();
        finalDays = [currentDayIndex];
      }
    } else {
      finalDays = [];
    }

    const matchedCategory = categories.find(
      c => c.name.toLowerCase() === finalCategory.toLowerCase()
    );
    const categoryId = matchedCategory 
      ? matchedCategory.id 
      : `cat-${finalCategory.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      dueTime,
      category: finalCategory,
      categoryId,
      goalId: goalId || null,
      milestoneId: goalId && milestoneId ? milestoneId : null,
      isRecurring,
      recurringType: isRecurring ? recurringType : null,
      recurringDays: finalDays
    });

    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    setRecurringDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  const weekdays = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-bg-card border border-border-card rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-card">
          <h3 className="font-display font-semibold text-lg text-text-title">
            {initialTask ? 'Edit Planner Task' : 'Plan a New Task'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-active text-text-muted hover:text-text-title transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Meditate for 15 mins, code core layout..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-input bg-bg-input text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50 transition-all text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Notes / Sub-steps
            </label>
            <textarea
              placeholder="Add key insights, links, checklist steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border-input bg-bg-input text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50 transition-all text-sm"
            />
          </div>

          {/* Core Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const colors = {
                    low: 'border-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-bg-input active:bg-bg-active',
                    medium: 'border-amber-500/10 text-amber-600 dark:text-amber-400 bg-bg-input active:bg-bg-active',
                    high: 'border-rose-500/10 text-rose-600 dark:text-rose-400 bg-bg-input active:bg-bg-active'
                  };
                  const selectedColors = {
                    low: 'bg-emerald-600 dark:bg-emerald-650 text-white border-emerald-500',
                    medium: 'bg-amber-600 dark:bg-amber-650 text-white border-amber-500',
                    high: 'bg-rose-600 dark:bg-rose-650 text-white border-rose-500'
                  };
                  const isSelected = priority === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                        isSelected ? selectedColors[p] : colors[p]
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Category
              </label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    setShowCustomCategoryInput(val === 'Custom');
                  }}
                  className="grow px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden cursor-pointer"
                >
                  {PRESET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-bg-card text-text-app">{cat}</option>
                  ))}
                  <option value="Custom" className="bg-bg-card text-text-app">+ Custom Category</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Category Input */}
          {showCustomCategoryInput && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Custom Category Name
              </label>
              <input 
                type="text"
                placeholder="e.g. Routine, Workouts"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app placeholder-text-dim focus:outline-hidden"
              />
            </div>
          )}

          {/* Date and Time selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-dim" /> Due Date
              </label>
              <input 
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-text-dim" /> Due Time & Reminder
              </label>
              <input 
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden"
              />
            </div>
          </div>

          {/* Goal Link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Link to Larger Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => {
                const gid = e.target.value;
                setGoalId(gid);
                setMilestoneId('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden cursor-pointer"
            >
              <option value="" className="bg-bg-card text-text-muted">No parent goal (Standalone task)</option>
              {goals.map(g => (
                <option key={g.id} value={g.id} className="bg-bg-card text-text-app">
                  [{g.type === 'short-term' ? 'Short' : 'Long'}] {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Link */}
          {goalId && (
            <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Link to Goal Milestone
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden cursor-pointer"
              >
                <option value="" className="bg-bg-card text-text-muted">No specific milestone</option>
                {milestones
                  .filter(m => m.goalId === goalId)
                  .sort((a, b) => a.order - b.order || (a.createdAt || '').localeCompare(b.createdAt || ''))
                  .map(m => (
                    <option key={m.id} value={m.id} className="bg-bg-card text-text-app">
                      {m.title} {m.targetDate ? `(Due: ${m.targetDate})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Recurring Toggles */}
          <div className="border-t border-border-card pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-app tracking-wide block">
                  Recurring Schedule
                </span>
                <span className="text-[11px] text-text-muted">
                  Automatically schedules this task periodically.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-bg-active peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {isRecurring && (
              <div className="bg-bg-input p-3 rounded-lg border border-border-input space-y-3 animate-in slide-in-from-top-1 duration-150">
                <div className="flex gap-4 text-xs font-medium">
                  {(['daily', 'weekly', 'custom'] as const).map(type => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer text-text-muted hover:text-text-title">
                      <input 
                        type="radio"
                        name="recurringType"
                        checked={recurringType === type}
                        onChange={() => setRecurringType(type)}
                        className="text-indigo-650 dark:text-indigo-400 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="capitalize text-xs font-semibold">{type}</span>
                    </label>
                  ))}
                </div>

                {recurringType === 'custom' && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-dim block">
                      Select Days
                    </span>
                    <div className="flex justify-between gap-1.5">
                      {weekdays.map(day => {
                        const isSelected = recurringDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`grow w-8 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'bg-transparent text-text-muted border-border-input hover:bg-bg-active hover:text-text-title'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="bg-bg-card/90 px-6 py-4 border-t border-border-card flex justify-between gap-3">
          <span className="text-[11px] text-text-dim self-center flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-text-muted" />
            Esc to close
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border border-border-input hover:bg-bg-active text-text-muted rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
            >
              {initialTask ? 'Save Changes' : 'Add to Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
