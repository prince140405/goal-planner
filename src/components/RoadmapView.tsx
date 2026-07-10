import React, { useState } from 'react';
import { Layers, Calendar, Filter, CheckCircle2, Circle, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { Goal, Milestone, Task, Persona, Priority, GoalHealth } from '../types';
import { getLocalDateString } from '../utils/date';

interface RoadmapViewProps {
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  userPersona?: Persona;
}

export default function RoadmapView({ goals, milestones, tasks, userPersona }: RoadmapViewProps) {
  const [personaFilter, setPersonaFilter] = useState<string>(userPersona || 'All');
  const [healthFilter, setHealthFilter] = useState<string>('All');

  // Filter goals
  const filteredGoals = goals.filter(g => {
    // 1. Filter by Persona (based on goal category or user preference)
    const matchPersona = 
      personaFilter === 'All' || 
      (personaFilter === 'founder' && (g.category === 'Development' || g.category === 'Marketing')) ||
      (personaFilter === 'student' && g.category === 'Study') ||
      (personaFilter === 'general' && g.category !== 'Development' && g.category !== 'Marketing' && g.category !== 'Study');

    // 2. Filter by health
    if (healthFilter === 'All') return matchPersona;

    const goalTasks = tasks.filter(t => t.goalId === g.id);
    const totalTasksCount = goalTasks.length;
    const completedTasksCount = goalTasks.filter(t => t.completed).length;
    const progressRatio = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
    const targetDateObj = new Date(g.targetDate);
    const remainingDays = Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    let health: GoalHealth = 'healthy';
    if (g.completed) health = 'healthy';
    else if (remainingDays <= 7 && progressRatio < 40) health = 'critical';
    else if (remainingDays <= 14 && progressRatio < 60) health = 'warning';

    return matchPersona && health === healthFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-medium text-text-title text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500 animate-pulse" />
            Execution Roadmap
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Trace the complete trajectory from macro goals to micro daily tasks.
          </p>
        </div>

        {/* Advanced filters toolbar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 bg-bg-card border border-border-card p-1.5 px-3 rounded-lg text-xs text-text-app">
            <Filter className="w-3.5 h-3.5 text-text-dim" />
            <span>Persona:</span>
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden hover:text-text-title cursor-pointer"
            >
              <option value="All" className="bg-bg-card">All Personas</option>
              <option value="founder" className="bg-bg-card">Founder</option>
              <option value="student" className="bg-bg-card">Student</option>
              <option value="general" className="bg-bg-card">General</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-bg-card border border-border-card p-1.5 px-3 rounded-lg text-xs text-text-app">
            <Activity className="w-3.5 h-3.5 text-text-dim" />
            <span>Health Status:</span>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden hover:text-text-title cursor-pointer"
            >
              <option value="All" className="bg-bg-card">All Healths</option>
              <option value="healthy" className="bg-bg-card">Healthy</option>
              <option value="warning" className="bg-bg-card">Warning</option>
              <option value="critical" className="bg-bg-card">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of roadmap trees */}
      <div className="space-y-6">
        {filteredGoals.length === 0 ? (
          <div className="bento-card p-12 text-center text-text-dim text-xs">
            No roadmap items match the selected filters. Establish goals and assign milestones.
          </div>
        ) : (
          filteredGoals.map(goal => {
            const goalTasks = tasks.filter(t => t.goalId === goal.id);
            const goalMilestones = milestones.filter(m => m.goalId === goal.id);
            const totalTasksCount = goalTasks.length;
            const completedTasksCount = goalTasks.filter(t => t.completed).length;
            const progressRatio = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

            // Health calculation
            const targetDateObj = new Date(goal.targetDate);
            const remainingDays = Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            let health: GoalHealth = 'healthy';
            if (goal.completed) health = 'healthy';
            else if (remainingDays <= 7 && progressRatio < 40) health = 'critical';
            else if (remainingDays <= 14 && progressRatio < 60) health = 'warning';

            const healthLabelColors = {
              healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
              warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
              critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20'
            };

            return (
              <div key={goal.id} className="bento-card p-6 space-y-6">
                
                {/* Goal Level Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-0.5 px-2 text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase rounded-md">
                        {goal.category}
                      </span>
                      <span className={`p-0.5 px-2 text-[9px] font-bold uppercase rounded-md border ${healthLabelColors[health]}`}>
                        {health}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-text-title">{goal.title}</h4>
                  </div>

                  {/* Goal Progress bar */}
                  <div className="w-full md:w-64 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-text-dim">
                      <span>Goal Progress</span>
                      <span className="font-mono text-text-app font-bold">{progressRatio}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-bg-active overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-dim font-mono block text-right">
                      Due: {goal.targetDate}
                    </span>
                  </div>
                </div>

                 {/* Milestones timeline representation */}
                 {goalMilestones.length === 0 ? (
                   <p className="text-xs text-text-dim italic">No milestones defined for this goal yet.</p>
                 ) : (
                   <div className="relative pl-8 space-y-6 pt-2">
                     {/* Timeline line */}
                     <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                     {[...goalMilestones]
                       .sort((a, b) => a.order - b.order || (a.createdAt || '').localeCompare(b.createdAt || ''))
                       .map((milestone, idx) => {
                         const milestoneTasks = goalTasks.filter(t => t.milestoneId === milestone.id);
                         const totalMTasks = milestoneTasks.length;
                         const completedMTasks = milestoneTasks.filter(t => t.completed).length;
                         const milestoneProgress = totalMTasks > 0 ? Math.round((completedMTasks / totalMTasks) * 100) : 0;
                         const isOverdue = milestone.targetDate && milestone.targetDate < getLocalDateString() && milestoneProgress < 100;

                         return (
                           <div key={milestone.id} className="relative group space-y-2">
                             
                             {/* Node icon on vertical line */}
                             <div className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                               milestoneProgress === 100 && totalMTasks > 0
                                 ? 'bg-indigo-500 border-indigo-500 text-white'
                                 : isOverdue
                                   ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                                   : 'bg-bg-input border-border-input'
                             }`}>
                               {milestoneProgress === 100 && totalMTasks > 0 ? (
                                 <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                               ) : isOverdue ? (
                                 <AlertCircle className="w-2.5 h-2.5 text-white" />
                               ) : null}
                             </div>

                             <div className="bg-bg-card/40 hover:bg-bg-active/20 border border-border-subtle rounded-xl p-4 transition-all duration-200 space-y-3">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                 <div className="space-y-0.5">
                                   <span className="text-xs font-bold text-text-title group-hover:text-indigo-650 dark:group-hover:text-indigo-400">
                                     {idx + 1}. {milestone.title}
                                   </span>
                                   {milestone.targetDate && (
                                     <span className={`text-[10px] font-mono block ${isOverdue ? 'text-rose-500 font-bold' : 'text-text-dim'}`}>
                                       Target Date: {milestone.targetDate} {isOverdue && '(Overdue)'}
                                     </span>
                                   )}
                                 </div>
                                 <span className="text-[10px] font-mono bg-bg-active border border-border-card text-text-muted px-2 py-0.5 rounded-md whitespace-nowrap self-start sm:self-center">
                                   {completedMTasks}/{totalMTasks} Tasks ({milestoneProgress}%)
                                 </span>
                               </div>

                               {/* Render child tasks under milestone */}
                               {milestoneTasks.length > 0 && (
                                 <div className="space-y-1.5 border-t border-border-subtle pt-2">
                                   {milestoneTasks.map(task => (
                                     <div key={task.id} className="flex items-center gap-2 text-xs text-text-muted">
                                       {task.completed ? (
                                         <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                       ) : (
                                         <Circle className="w-3.5 h-3.5 text-text-dim shrink-0" />
                                       )}
                                       <span className={`grow ${task.completed ? 'line-through text-text-dim' : 'text-text-app'}`}>
                                         {task.title}
                                       </span>
                                       {task.dueDate && (
                                         <span className="text-[10px] text-text-dim font-mono whitespace-nowrap">
                                           {task.dueDate}
                                         </span>
                                       )}
                                     </div>
                                   ))}
                                 </div>
                               )}
                             </div>

                           </div>
                         );
                       })}
                   </div>
                 )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
