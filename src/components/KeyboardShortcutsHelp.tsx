import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['N'], desc: 'Quickly create a new task' },
    { keys: ['G'], desc: 'Quickly create a new goal' },
    { keys: ['K'], desc: 'Open this shortcuts helper' },
    { keys: ['T'], desc: 'Toggle Dark / Light mode' },
    { keys: ['Esc'], desc: 'Close any modal or dialog' },
    { keys: ['S'], desc: 'Force synchronise with Cloud DB' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-bg-card border border-border-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-card">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display font-semibold text-lg text-text-title">Keyboard Shortcuts</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-active text-text-dim hover:text-text-app transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-text-muted">
            Boost your productivity flow with context shortcuts designed for minimalist control.
          </p>

          <div className="space-y-3">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-text-app">{s.desc}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, kIdx) => (
                    <kbd 
                      key={kIdx} 
                      className="px-2 py-1 text-xs font-mono font-medium text-text-app bg-bg-app border border-border-input rounded-md shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-app px-6 py-3 border-t border-border-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-text-title text-bg-card hover:opacity-90 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
