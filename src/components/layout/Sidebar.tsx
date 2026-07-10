import React from 'react';
import { Info } from 'lucide-react';
import { Persona } from '../../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
  persona?: Persona;
  tasksCount: number;
  goalsCount: number;
  pipelineCount: number;
  applicationsCount: number;
  remindersCount: number;
  progressRatio: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export default function Sidebar({
  activeView,
  setActiveView,
  persona,
  tasksCount,
  goalsCount,
  pipelineCount,
  applicationsCount,
  remindersCount,
  progressRatio,
  completedTasksCount,
  totalTasksCount,
}: SidebarProps) {
  const items = [
    { id: 'today', label: "Today's Focus", count: tasksCount },
    { id: 'goals', label: "Goals Overview", count: goalsCount },
    { id: 'roadmap', label: "Roadmap Timeline", count: goalsCount },
  ];

  if (persona === 'founder') {
    items.push({ id: 'founder', label: "Sales CRM Pipeline", count: pipelineCount });
  } else if (persona === 'student') {
    items.push({ id: 'student', label: "Placement Tracker", count: applicationsCount });
  }

  items.push(
    { id: 'calendar', label: "Planning Calendar", count: null as any },
    { id: 'analytics', label: "Performance charts", count: null as any },
    { id: 'settings', label: "Planner settings", count: remindersCount }
  );

  return (
    <aside className="lg:col-span-3 space-y-4">
      <div className="bento-card p-4 space-y-1">
        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-3 block mb-2">
          NAVIGATION
        </span>

        {items.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === v.id 
                ? 'bg-bg-active text-text-title font-bold border-l-2 border-indigo-500' 
                : 'text-text-muted hover:bg-bg-active hover:text-text-title'
            }`}
          >
            <span>{v.label}</span>
            {v.count !== null && v.count !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-bg-active text-[10px] text-text-muted">
                {v.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick Stats Summary Card */}
      <div className="bento-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-app uppercase tracking-wider block">
            Today's Progress
          </span>
          <span className="text-xs font-mono text-text-muted font-bold">
            {completedTasksCount}/{totalTasksCount}
          </span>
        </div>

        {/* Simple progress bar */}
        <div className="w-full h-2 rounded-full bg-bg-active overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressRatio}%` }}
          />
        </div>

        <p className="text-[10px] text-text-muted leading-normal">
          Linking planner updates to larger, structured goals increases milestone achievements.
        </p>
      </div>

      {/* Help Tips */}
      <div className="p-4 bg-bg-card/30 border border-dashed border-border-card rounded-xl space-y-2">
        <h5 className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> PRO TIP
        </h5>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Press <kbd className="px-1.5 py-0.5 bg-bg-active rounded text-[9px] font-mono text-text-app font-bold">N</kbd> anywhere on this screen to instantly draft a new planner task!
        </p>
      </div>
    </aside>
  );
}
