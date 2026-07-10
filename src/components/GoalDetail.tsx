import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Calendar, AlertCircle, CheckCircle2, Circle, ListTodo, PlusCircle, CheckSquare, Square, Edit2, X, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { Goal, Milestone, Task, Priority, TaskCategory, GoalHealth } from '../types';
import { getLocalDateString } from '../utils/date';

interface GoalDetailProps {
  goal: Goal;
  milestones: Milestone[];
  tasks: Task[];
  categories: TaskCategory[];
  onBack: () => void;
  onAddMilestone: (title: string, targetDate?: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onUpdateMilestone: (milestoneId: string, updates: Partial<Omit<Milestone, 'id' | 'goalId' | 'createdAt' | 'updatedAt'>>) => void;
  onMoveMilestone: (milestoneId: string, direction: 'up' | 'down') => void;
  onAddTaskToMilestone: (milestoneId: string, taskTitle: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function GoalDetail({
  goal,
  milestones,
  tasks,
  categories,
  onBack,
  onAddMilestone,
  onDeleteMilestone,
  onUpdateMilestone,
  onMoveMilestone,
  onAddTaskToMilestone,
  onToggleTaskComplete,
  onDeleteTask,
}: GoalDetailProps) {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [inlineTaskTitles, setInlineTaskTitles] = useState<{ [milestoneId: string]: string }>({});
  
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDate, setEditingDate] = useState('');

  // 1. Calculate Goal Progress & Health
  const goalTasks = tasks.filter(t => t.goalId === goal.id);
  const totalTasksCount = goalTasks.length;
  const completedTasksCount = goalTasks.filter(t => t.completed).length;
  const progressRatio = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Derived Goal Health
  const targetDateObj = new Date(goal.targetDate);
  const today = new Date();
  const remainingDays = Math.ceil((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let health: GoalHealth = 'healthy';
  if (goal.completed) {
    health = 'healthy';
  } else if (remainingDays <= 7 && progressRatio < 40) {
    health = 'critical';
  } else if (remainingDays <= 14 && progressRatio < 60) {
    health = 'warning';
  }

  const healthColors = {
    healthy: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-450 border-amber-500/25',
    critical: 'bg-rose-500/10 text-rose-450 border-rose-500/25'
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    onAddMilestone(newMilestoneTitle.trim(), newMilestoneDate || undefined);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const handleInlineTaskSubmit = (milestoneId: string) => {
    const title = inlineTaskTitles[milestoneId];
    if (!title || !title.trim()) return;
    onAddTaskToMilestone(milestoneId, title.trim());
    setInlineTaskTitles(prev => ({ ...prev, [milestoneId]: '' }));
  };

  const handleSaveEdit = (milestoneId: string) => {
    if (!editingTitle.trim()) return;
    onUpdateMilestone(milestoneId, {
      title: editingTitle.trim(),
      targetDate: editingDate || undefined,
    });
    setEditingMilestoneId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-bg-card border border-border-input hover:bg-bg-active text-text-muted hover:text-text-title transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-xs font-mono text-text-dim uppercase tracking-widest">GOAL WORKSPACE</span>
          <h2 className="text-xl font-bold text-text-title leading-tight">{goal.title}</h2>
        </div>
      </div>

      {/* Goal Summary Panel */}
      <div className="bento-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="p-1 px-2.5 text-[10px] bg-purple-500/10 text-purple-650 dark:text-purple-400 font-bold uppercase rounded-md">
              {goal.category}
            </span>
            <span className="p-1 px-2.5 text-[10px] bg-bg-active text-text-muted font-bold uppercase rounded-md">
              {goal.type === 'short-term' ? 'Short Term' : 'Long Term'}
            </span>
            <span className={`p-1 px-2.5 text-[10px] font-bold uppercase rounded-md border ${healthColors[health]}`}>
              Health: {health}
            </span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {goal.description || 'No description provided for this goal objective.'}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-text-dim">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-dim" />
              Target: {goal.targetDate}
            </span>
            <span>
              ({remainingDays > 0 ? `${remainingDays} days remaining` : 'Target date passed'})
            </span>
          </div>
        </div>

        {/* Dynamic Progress circular display or status */}
        <div className="flex flex-col justify-center items-center bg-bg-app border border-border-card rounded-2xl p-4">
          <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">Overall Goal Progress</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20">
              <circle
                className="text-border-card"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className="text-indigo-500"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - progressRatio / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-text-title font-mono">{progressRatio}%</span>
          </div>
          <span className="text-[10px] text-text-muted mt-2">{completedTasksCount}/{totalTasksCount} tasks completed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column: Milestones Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-400" />
            Milestone Timeline
          </h3>

          {milestones.length === 0 ? (
            <div className="bento-card p-8 text-center text-text-dim text-xs">
              No milestones created yet. Establish milestones to segment your roadmap.
            </div>
          ) : (
            <div className="relative pl-8 space-y-8">
              {/* Premium timeline vertical line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-zinc-250 dark:bg-zinc-800" />
              {[...milestones]
                .sort((a, b) => a.order - b.order || (a.createdAt || '').localeCompare(b.createdAt || ''))
                .map((milestone, idx, arr) => {
                  const milestoneTasks = goalTasks.filter(t => t.milestoneId === milestone.id);
                  const totalMTasks = milestoneTasks.length;
                  const completedMTasks = milestoneTasks.filter(t => t.completed).length;
                  const milestoneProgress = totalMTasks > 0 ? Math.round((completedMTasks / totalMTasks) * 100) : 0;
                  const isEditing = editingMilestoneId === milestone.id;
                  const isOverdue = milestone.targetDate && milestone.targetDate < getLocalDateString() && milestoneProgress < 100;

                  return (
                    <div key={milestone.id} className="relative group">
                      {/* Circle Node on Timeline */}
                      <div className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                        milestoneProgress === 100 && totalMTasks > 0
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                          : isOverdue
                            ? 'bg-rose-500 border-rose-500 text-white shadow-md animate-pulse'
                            : 'bg-bg-card border-border-input'
                      }`}>
                        {milestoneProgress === 100 && totalMTasks > 0 ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-2.5 h-2.5 text-white" />
                        ) : null}
                      </div>

                      <div className="bento-card p-5 space-y-4 hover:border-indigo-550/20 transition-all duration-200">
                        {isEditing ? (
                          /* Edit Mode Form */
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Milestone Title</label>
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Target Date</label>
                              <input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs text-text-app focus:outline-hidden"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingMilestoneId(null)}
                                className="px-2.5 py-1 text-[11px] font-bold border border-border-input hover:bg-bg-active text-text-muted rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(milestone.id)}
                                className="px-3 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode Details */
                          <>
                            {/* Milestone Header */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-text-title group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {idx + 1}. {milestone.title}
                                </h4>
                                {milestone.targetDate && (
                                  <span className={`text-[10px] font-mono block ${isOverdue ? 'text-rose-500 font-bold' : 'text-text-dim'}`}>
                                    Target Date: {milestone.targetDate} {isOverdue && '(Overdue)'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono bg-bg-active border border-border-card text-text-muted px-2 py-0.5 rounded-md mr-1">
                                  {milestoneProgress}% ({completedMTasks}/{totalMTasks})
                                </span>
                                
                                {/* Reordering buttons */}
                                <div className="flex items-center bg-bg-active rounded-md border border-border-card p-0.5">
                                  <button
                                    onClick={() => onMoveMilestone(milestone.id, 'up')}
                                    disabled={idx === 0}
                                    className="p-0.5 text-text-dim hover:text-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onMoveMilestone(milestone.id, 'down')}
                                    disabled={idx === arr.length - 1}
                                    className="p-0.5 text-text-dim hover:text-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingMilestoneId(milestone.id);
                                    setEditingTitle(milestone.title);
                                    setEditingDate(milestone.targetDate || '');
                                  }}
                                  className="p-1 rounded-md text-text-dim hover:text-indigo-500 hover:bg-bg-active transition-colors cursor-pointer"
                                  title="Edit Milestone"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => onDeleteMilestone(milestone.id)}
                                  className="p-1 rounded-md text-text-dim hover:text-red-500 dark:hover:text-red-400 hover:bg-bg-active transition-colors cursor-pointer"
                                  title="Delete Milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Milestone Sub-tasks List */}
                        <div className="space-y-2 border-t border-border-subtle pt-3">
                          {milestoneTasks.map(task => {
                            const isCompleted = task.completed;
                            return (
                              <div key={task.id} className="flex items-center justify-between gap-3 text-xs bg-bg-card hover:bg-bg-active border border-border-subtle rounded-lg p-2.5 group/task">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onToggleTaskComplete(task.id)}
                                    className="text-text-dim hover:text-text-title cursor-pointer"
                                  >
                                    {isCompleted ? (
                                      <CheckSquare className="w-4 h-4 text-indigo-500" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>
                                  <span className={`text-text-app font-medium ${isCompleted ? 'line-through text-text-dim' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  className="opacity-0 group-hover/task:opacity-100 p-0.5 text-text-dim hover:text-red-500 dark:hover:text-red-400 transition-opacity cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Inline quick task adder */}
                        <div className="flex gap-2 items-center pt-2">
                          <input
                            type="text"
                            placeholder="Quick add task to this milestone..."
                            value={inlineTaskTitles[milestone.id] || ''}
                            onChange={(e) => setInlineTaskTitles(prev => ({ ...prev, [milestone.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlineTaskSubmit(milestone.id);
                            }}
                            className="grow px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-[11px] placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50 text-text-app"
                          />
                          <button
                            onClick={() => handleInlineTaskSubmit(milestone.id)}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                            title="Add Task"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right Column: Add Milestone Action Panel */}
        <div className="space-y-6">
          <div className="bento-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-text-title uppercase tracking-wider">
                Create Milestone
              </h3>
            </div>
            <form onSubmit={handleAddMilestoneSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Create landing page layout..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-input bg-bg-input text-xs text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-input bg-bg-input text-xs text-text-app focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
              >
                Add Milestone
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
