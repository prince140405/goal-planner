import React from 'react';
import { Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { Goal, Milestone, Task, TaskCategory } from '../../types';
import GoalDetail from '../GoalDetail';

interface GoalsViewProps {
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  categories: TaskCategory[];
  onAddMilestone: (goalId: string, title: string, date?: string) => void;
  onDeleteMilestone: (id: string) => void;
  onUpdateMilestone: (milestoneId: string, updates: any) => void;
  onMoveMilestone: (milestoneId: string, direction: 'up' | 'down') => void;
  onAddTaskToMilestone: (milestoneId: string, title: string) => void;
  onToggleTaskComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onGoalToggleComplete: (id: string) => void;
  onEditGoal: (goal: Goal) => void;
  onGoalDelete: (id: string) => void;
  onNewGoalClick: () => void;
}

export default function GoalsView({
  selectedGoalId,
  setSelectedGoalId,
  goals,
  milestones,
  tasks,
  categories,
  onAddMilestone,
  onDeleteMilestone,
  onUpdateMilestone,
  onMoveMilestone,
  onAddTaskToMilestone,
  onToggleTaskComplete,
  onDeleteTask,
  onGoalToggleComplete,
  onEditGoal,
  onGoalDelete,
  onNewGoalClick,
}: GoalsViewProps) {
  if (selectedGoalId) {
    const activeGoal = goals.find(g => g.id === selectedGoalId);
    if (!activeGoal) return null;

    return (
      <GoalDetail
        goal={activeGoal}
        milestones={milestones.filter(m => m.goalId === selectedGoalId)}
        tasks={tasks}
        categories={categories}
        onBack={() => setSelectedGoalId(null)}
        onAddMilestone={(title, date) => onAddMilestone(selectedGoalId, title, date)}
        onDeleteMilestone={onDeleteMilestone}
        onUpdateMilestone={onUpdateMilestone}
        onMoveMilestone={onMoveMilestone}
        onAddTaskToMilestone={onAddTaskToMilestone}
        onToggleTaskComplete={onToggleTaskComplete}
        onDeleteTask={onDeleteTask}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display font-medium text-text-title text-lg">
            Durable Goal Tracker
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Connect individual daily tasks with long-term milestones for absolute clarity. Click on a goal to manage milestones.
          </p>
        </div>

        <button
          onClick={onNewGoalClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 bento-card">
            <p className="text-sm font-semibold text-text-muted">No active goal objectives established</p>
            <button
              onClick={onNewGoalClick}
              className="text-xs font-bold text-indigo-500 hover:underline mt-2"
            >
              Establish your first goal now
            </button>
          </div>
        ) : (
          goals.map(goal => {
            const linkedTasks = tasks.filter(t => t.goalId === goal.id);
            const totalLinked = linkedTasks.length;
            const completedLinked = linkedTasks.filter(t => t.completed).length;
            const completionRatio = totalLinked > 0 ? Math.round((completedLinked / totalLinked) * 100) : goal.completed ? 100 : 0;

            return (
              <div 
                key={goal.id}
                className={`bento-card p-5 flex flex-col justify-between hover:border-border-card/30 transition-all ${
                  goal.completed ? 'opacity-60' : ''
                }`}
              >
                <div 
                  className="space-y-2 cursor-pointer"
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="p-1 px-1.5 text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase rounded-sm whitespace-nowrap">
                      {goal.category}
                    </span>
                    
                    <span className="text-[10px] text-text-muted capitalize">
                      {goal.type === 'short-term' ? '■ Short-horizon' : '▲ Long-horizon'}
                    </span>
                  </div>

                  <h4 className={`text-sm font-semibold text-text-title leading-tight hover:text-indigo-500 transition-colors ${
                    goal.completed ? 'line-through text-text-dim' : ''
                  }`}>
                    {goal.title}
                  </h4>

                  {goal.description && (
                    <p className="text-xs text-text-muted line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress status indicators */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-text-muted">
                    <span>Completion ratio</span>
                    <span className="font-bold text-indigo-500">{completionRatio}%</span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full h-1.5 rounded-full bg-bg-active overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${completionRatio}%` }}
                    />
                  </div>

                  {/* Linked notes */}
                  <div className="flex justify-between items-center pt-2 border-t border-border-card mt-2 text-[10px] text-text-muted font-mono">
                    <span>Due By: {goal.targetDate}</span>
                    <span>{completedLinked}/{totalLinked} linked tasks complete</span>
                  </div>

                  {/* Quick tool controls */}
                  <div className="flex justify-between items-center gap-2 pt-3">
                    <button
                      onClick={() => onGoalToggleComplete(goal.id)}
                      className={`text-[11px] font-bold flex items-center gap-1 p-1 px-2.5 rounded-md border ${
                        goal.completed 
                          ? 'bg-bg-input border-border-input text-text-app' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{goal.completed ? 'Completed' : 'Set Active'}</span>
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="text-text-dim hover:text-indigo-500 p-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onGoalDelete(goal.id)}
                        className="text-text-dim hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
