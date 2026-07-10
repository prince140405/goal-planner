import React, { useRef } from 'react';
import { Search, Tag, SlidersHorizontal, Plus, CheckSquare, Square, Calendar, Clock, ArrowUp, ArrowDown, Edit2, Trash2 } from 'lucide-react';
import { Task, Goal, TaskCategory, Milestone } from '../../types';
import AIDailyBrief from '../AIDailyBrief';

interface TodayViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  categories: TaskCategory[];
  userId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  distinctCategories: string[];
  onTaskCheckToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onPlanTaskClick: () => void;
  onMoveOrder: (id: string, direction: 'up' | 'down') => void;
  onReorderTasks: (tasks: Task[]) => void;
  todayStr: string;
}

export default function TodayView({
  tasks,
  filteredTasks,
  goals,
  milestones,
  categories,
  userId,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  distinctCategories,
  onTaskCheckToggle,
  onTaskDelete,
  onEditTask,
  onPlanTaskClick,
  onMoveOrder,
  onReorderTasks,
  todayStr,
}: TodayViewProps) {
  const dragSourceItemIndex = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragSourceItemIndex.current = taskId;
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
    dragSourceItemIndex.current = null;
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const sourceTaskId = dragSourceItemIndex.current;
    if (sourceTaskId === null || sourceTaskId === targetTaskId) return;

    const sourceIndex = tasks.findIndex((entry) => entry.id === sourceTaskId);
    const targetIndex = tasks.findIndex((entry) => entry.id === targetTaskId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...tasks];
    const [movedTask] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedTask);

    const reordered = updated.map((entry, idx) => ({ ...entry, order: idx }));
    onReorderTasks(reordered);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <AIDailyBrief
        tasks={tasks}
        goals={goals}
        milestones={milestones}
        categories={categories}
        userId={userId}
      />

      {/* Toolbar Actions & Custom Search/Filter panels */}
      <div className="bento-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search tasks, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-semibold placeholder-text-dim focus:border-indigo-500/50 focus:outline-hidden text-text-app transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-bg-input p-1.5 px-3 rounded-lg border border-border-input">
            <Tag className="w-3.5 h-3.5 text-text-dim" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold hover:text-text-title text-text-muted focus:outline-hidden cursor-pointer"
            >
              {distinctCategories.map(cat => (
                <option key={cat} value={cat} className="bg-bg-card text-text-app">{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 bg-bg-input p-1.5 px-3 rounded-lg border border-border-input">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-dim" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-muted focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-bg-card text-text-app">All Priority</option>
              <option value="high" className="bg-bg-card text-text-app">High Only</option>
              <option value="medium" className="bg-bg-card text-text-app">Medium Only</option>
              <option value="low" className="bg-bg-card text-text-app">Low Only</option>
            </select>
          </div>

          {/* Add action */}
          <button
            onClick={onPlanTaskClick}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Task</span>
          </button>
        </div>

        </div>

      {/* Task list Section */}
      <div className="bento-card overflow-hidden">
        
        <div className="px-6 py-4 border-b border-border-card flex justify-between items-center bg-bg-card/20">
          <span className="text-xs font-bold text-text-dim uppercase tracking-widest">
            REORDER BY DRAGGING LIST ITEMS OR MOVE WITH ACTIONS
          </span>
          <span className="text-xs bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-sm font-semibold">
            {filteredTasks.length} tasks scheduled
          </span>
        </div>

        <div className="divide-y divide-border-card">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <p className="text-sm font-semibold text-text-app">
                {tasks.length === 0 ? 'Start planning your day' : 'No tasks match your filters'}
              </p>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                {tasks.length === 0
                  ? 'Add your first task to track what matters today. Press N or use the button above.'
                  : 'Try adjusting your search or filter settings.'}
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={onPlanTaskClick}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((t) => {
              const linkedGoal = goals.find(g => g.id === t.goalId);
              const isCompletedToday = t.completed;
              
              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, t.id)}
                  className="p-5 flex items-start gap-4 hover:bg-bg-active transition-all group relative cursor-grab active:cursor-grabbing"
                >
                  {/* Complete toggle checkbox status */}
                  <button
                    onClick={() => onTaskCheckToggle(t.id)}
                    className="p-1 rounded-md hover:bg-bg-active transition-colors cursor-pointer self-start"
                    title={isCompletedToday ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompletedToday ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-550 fill-indigo-500/20" />
                    ) : (
                      <Square className="w-5 h-5 text-text-dim hover:text-text-muted" />
                    )}
                  </button>

                  {/* Details details */}
                  <div className="grow space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-semibold text-text-title ${
                        isCompletedToday ? 'line-through text-text-dim' : ''
                      }`}>
                        {t.title}
                      </h4>

                      {/* Priority Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                        t.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-bg-card border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {t.priority}
                      </span>

                      {/* Category Badge */}
                      <span className="px-1.5 py-0.5 rounded-sm bg-bg-active text-[9px] font-mono font-medium text-text-muted uppercase">
                        {t.category}
                      </span>

                      {/* Recurring Schedule Indicator */}
                      {t.isRecurring && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-sm font-semibold capitalize">
                          ↻ {t.recurringType}
                        </span>
                      )}
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-text-muted leading-relaxed max-w-2xl">
                        {t.description}
                      </p>
                    )}

                    {/* Linked Goal info indicator */}
                    {linkedGoal && (
                      <div className="flex items-center gap-1 pt-1">
                        <span className="text-[10px] text-text-dim">Target goal:</span>
                        <span className="p-1 px-1.5 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold line-clamp-1">
                          {linkedGoal.title}
                        </span>
                      </div>
                    )}

                    {/* Due date reminders metadata */}
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-text-muted font-mono">
                      <span className="flex items-center gap-1 text-text-dim">
                        <Calendar className="w-3.5 h-3.5" />
                        {t.isRecurring || t.dueDate === todayStr ? 'Today' : t.dueDate}
                      </span>
                      <span className="flex items-center gap-1 text-text-dim">
                        <Clock className="w-3.5 h-3.5" />
                        {t.dueTime}
                      </span>
                    </div>

                  </div>

                  {/* Quick Edit Delete Reorder Tools Area */}
                  <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    
                    {/* Sorting helpers up/down */}
                    <button
                      onClick={() => onMoveOrder(t.id, 'up')}
                      disabled={tasks.findIndex((entry) => entry.id === t.id) === 0}
                      className="p-1 rounded-sm text-text-dim hover:text-text-title disabled:opacity-20 cursor-pointer"
                      title="Move Task Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onMoveOrder(t.id, 'down')}
                      disabled={tasks.findIndex((entry) => entry.id === t.id) === tasks.length - 1}
                      className="p-1 rounded-sm text-text-dim hover:text-text-title disabled:opacity-20 cursor-pointer"
                      title="Move Task Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditTask(t)}
                      className="p-1 rounded-sm text-text-dim hover:text-indigo-500 cursor-pointer"
                      title="Edit Task Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onTaskDelete(t.id)}
                      className="p-1 rounded-sm text-text-dim hover:text-red-500 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
