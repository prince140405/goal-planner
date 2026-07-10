import React from 'react';
import { Bell, Clock, Check, X, Volume2 } from 'lucide-react';
import { Reminder } from '../types';

interface NotificationToastProps {
  activeReminder: Reminder | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

export default function NotificationToast({ activeReminder, onDismiss, onSnooze, onComplete }: NotificationToastProps) {
  if (!activeReminder) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-bg-card border border-border-card text-text-app rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4">
        {/* Header indicator */}
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>Planner Alert</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-text-dim bg-bg-active px-1.5 py-0.5 rounded-sm">
            <Volume2 className="w-3 h-3" /> Enabled
          </span>
        </div>

        {/* Content detail */}
        <p className="text-sm font-semibold text-text-title mt-1 leading-tight">
          {activeReminder.taskTitle}
        </p>
        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Scheduled for {activeReminder.time}
        </p>

        {/* Actions panel */}
        <div className="grid grid-cols-3 gap-2 mt-4 border-t border-border-card pt-3">
          <button
            onClick={() => onSnooze(2)} // 2 minutes representation
            className="px-2 py-1.5 rounded-lg bg-bg-active hover:opacity-90 text-text-app text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            title="Snooze for 2 mins"
          >
            <Clock className="w-3.5 h-3.5" /> Snooze
          </button>

          <button
            onClick={onComplete}
            className="px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors col-span-2 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" /> Mark Done
          </button>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-sm text-text-dim hover:text-text-app transition-colors"
        title="Dismiss Alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
