import React from 'react';
import { CheckSquare, Wifi, WifiOff, RefreshCw, Keyboard, Sun, Moon } from 'lucide-react';
import { SyncStats } from '../../types';
import { User } from 'firebase/auth';
import AuthButton from '../AuthButton';

interface HeaderProps {
  authUser: User | null;
  isAuthenticating: boolean;
  syncStats: SyncStats;
  isActuallyOnline: boolean;
  isThemeDark: boolean;
  onThemeToggle: () => void;
  onManualSync: () => void;
  onShortcutsClick: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Header({
  authUser,
  isAuthenticating,
  syncStats,
  isActuallyOnline,
  isThemeDark,
  onThemeToggle,
  onManualSync,
  onShortcutsClick,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-md border-b border-border-card px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo Brand area */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-text-title accent-glow leading-none">
              FocusSpace
            </h1>
            <span className="text-[10px] font-mono text-text-muted">
              Premium Planner & Goals
            </span>
          </div>
        </div>

        {/* Sync status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-bg-card border border-border-card p-1 px-2.5 rounded-lg text-[11px] font-mono text-text-muted">
            {isActuallyOnline ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className={`w-2 h-2 rounded-full ${
              syncStats.syncStatus === 'synced' ? 'bg-emerald-500' :
              syncStats.syncStatus === 'syncing' ? 'bg-indigo-500 animate-pulse' :
              syncStats.syncStatus === 'offline' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            <span className="capitalize">{syncStats.syncStatus}</span>
            {syncStats.unsyncedCount > 0 && (
              <span className="bg-amber-500/10 text-amber-500 px-1 rounded-sm ml-0.5">
                ({syncStats.unsyncedCount} pending)
              </span>
            )}
          </div>

          <button
            onClick={onManualSync}
            className="p-1.5 rounded-lg bg-bg-card border border-border-card hover:bg-bg-active text-text-app transition-colors cursor-pointer"
            title="Sync now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Settings / Controls */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcuts */}
          <button
            onClick={onShortcutsClick}
            className="p-1.5 text-text-muted hover:text-text-title transition-colors hidden sm:block"
            title="Keyboard Shortcuts Menu [K]"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-lg border border-border-card bg-bg-card text-text-app hover:bg-bg-active cursor-pointer"
            title="Toggle theme mode [T]"
          >
            {isThemeDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <AuthButton
            user={authUser}
            isAuthenticating={isAuthenticating}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
          />
        </div>

      </div>
    </header>
  );
}
