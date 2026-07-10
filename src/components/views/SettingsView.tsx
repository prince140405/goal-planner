import React from 'react';
import { Clock } from 'lucide-react';
import { Reminder, SyncStats } from '../../types';
import { User } from 'firebase/auth';
import AuthButton from '../AuthButton';

interface SettingsViewProps {
  reminders: Reminder[];
  syncStats: SyncStats;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onToggleReminderActive: (id: string) => void;
  authUser: User | null;
  isAuthenticating: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function SettingsView({
  reminders,
  syncStats,
  notificationsEnabled,
  onToggleNotifications,
  onToggleReminderActive,
  authUser,
  isAuthenticating,
  onSignIn,
  onSignOut,
}: SettingsViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="font-display font-medium text-text-title text-lg">
          Settings
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Manage reminders, notifications, and your account.
        </p>
      </div>

      {/* Grid configs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Reminders list */}
        <div className="bento-card p-5 space-y-4">
          <div>
            <h4 className="font-display font-semibold text-xs text-text-title uppercase tracking-widest block">
              Active Smart Reminders
            </h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Triggers periodic toast warnings matching schedules.
            </p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {reminders.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No active reminders configured</p>
            ) : (
              reminders.map(rem => (
                <div key={rem.id} className="p-3 bg-bg-input rounded-lg flex justify-between items-center border border-border-input">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-text-app line-clamp-1">
                      {rem.taskTitle}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Scheduled daily at {rem.time}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleReminderActive(rem.id)}
                    className={`p-1 px-2.5 text-[10px] font-bold rounded-sm border cursor-pointer ${
                      rem.isActive 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-650 dark:text-indigo-400' 
                        : 'bg-transparent border-border-input text-text-dim'
                    }`}
                  >
                    {rem.isActive ? 'Active' : 'Muted'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account & notifications */}
        <div className="bento-card p-5 space-y-4">
          <div>
            <h4 className="font-display font-semibold text-xs text-text-title uppercase tracking-widest block">
              Account & Notifications
            </h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Sign in to sync across devices. Enable browser alerts for scheduled reminders.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-bg-input rounded-lg border border-border-input space-y-2">
              <span className="font-semibold text-text-app block text-xs">Account</span>
              <p className="text-[10px] text-text-dim leading-normal">
                {authUser && authUser.email && !authUser.isAnonymous
                  ? `Signed in as ${authUser.email}. Your data syncs automatically when online.`
                  : 'You are using a guest session. Sign in with Google to keep your planner backed up.'}
              </p>
              <AuthButton
                user={authUser}
                isAuthenticating={isAuthenticating}
                onSignIn={onSignIn}
                onSignOut={onSignOut}
              />
            </div>

            <button
              onClick={onToggleNotifications}
              className={`w-full text-left p-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                notificationsEnabled
                  ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400'
                  : 'border-border-input bg-bg-input text-text-muted hover:bg-bg-active'
              }`}
            >
              <div className="space-y-0.5">
                <span>Browser notifications</span>
                <span className="block text-[10px] font-normal text-text-dim">
                  {notificationsEnabled
                    ? 'Alerts will appear even when this tab is in the background.'
                    : 'Get notified when a scheduled reminder is due.'}
                </span>
              </div>
              <span>{notificationsEnabled ? 'On' : 'Off'}</span>
            </button>

            {syncStats.lastSyncedAt && (
              <div className="p-3 bg-bg-input rounded-lg border border-border-input text-[10px] text-text-dim">
                Last synced: {new Date(syncStats.lastSyncedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
