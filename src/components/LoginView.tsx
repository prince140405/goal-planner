import React from 'react';
import { Target, Sparkles, Award, Calendar, Layers, Flame, TrendingUp, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSignIn: () => void;
  isAuthenticating: boolean;
}

export default function LoginView({ onSignIn, isAuthenticating }: LoginViewProps) {
  return (
    <div className="min-h-screen bg-bg-app text-text-app flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden transition-colors duration-200 font-sans">
      {/* Dynamic Glowing Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 dark:bg-indigo-650/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 dark:bg-purple-650/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="w-full max-w-5xl bg-bg-card/75 backdrop-blur-md border border-border-card rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* Left Panel: App Feature Showcase & Interactive Mockup (Visible on lg screens) */}
        <div className="hidden lg:flex lg:col-span-7 bg-linear-to-br from-indigo-950/20 to-purple-950/20 border-r border-border-card p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg-app)_100%)] opacity-30 pointer-events-none" />

          {/* Logo & Headline */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Target className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-text-title">
                FocusSpace
              </span>
            </div>
            <h2 className="font-display font-extrabold text-3xl text-text-title leading-tight tracking-tight">
              A workspace built to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">execute</span> your goals.
            </h2>
            <p className="text-text-muted text-sm max-w-md">
              Ditch scattered checklists. Track CRM stages, roadmap milestones, DSA prep, and block schedules in a unified dashboard.
            </p>
          </div>

          {/* High-Fidelity UI Dashboard Mockup representation */}
          <div className="relative my-8 bg-zinc-950/45 dark:bg-zinc-950/70 border border-white/5 rounded-xl shadow-2xl p-5 space-y-4 scale-95 origin-center">
            {/* Header Line */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-zinc-500 font-mono ml-2">FocusSpace Dashboard</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-zinc-800" />
            </div>

            {/* Simulated Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Daily Streak Card */}
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Streaks</span>
                  <span className="text-base font-extrabold text-white font-mono mt-0.5 block">14 Days</span>
                </div>
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>

              {/* Completion Progress Card */}
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Progress</span>
                  <span className="text-base font-extrabold text-white font-mono mt-0.5 block">82%</span>
                </div>
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Milestones Card */}
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-lg space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Upcoming Milestones</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                  <div className="w-3.5 h-3.5 rounded-md border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">✓</div>
                  <span>Draft startup CRM pipeline stages</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                  <div className="w-3.5 h-3.5 rounded-md border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">✓</div>
                  <span>Complete weekly time-blocking calendar</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <div className="w-3.5 h-3.5 rounded-md border border-zinc-700 bg-transparent" />
                  <span className="line-through text-zinc-650">Solve 250+ DSA placement questions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Features summary */}
          <div className="relative z-10 flex gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-450" /> Structured Steps
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-455" /> Rolling Reminders
            </span>
          </div>
        </div>

        {/* Right Panel: Sign-In Box */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between min-h-[500px]">
          {/* Logo only on mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-indigo-650 flex items-center justify-center text-white">
              <Target className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-text-title">
              FocusSpace
            </span>
          </div>

          <div /> {/* Spacer */}

          {/* Action Box */}
          <div className="space-y-6 w-full">
            <div className="space-y-2">
              <h1 className="font-display font-extrabold text-2xl text-text-title tracking-tight lg:text-3xl">
                Welcome to FocusSpace
              </h1>
              <p className="text-text-muted text-xs leading-normal">
                An integrated Goal Execution OS for student placements, founder CRM sales pipelines, and time blocking. Log in to access your personal dashboard.
              </p>
            </div>

            <button
              onClick={onSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border border-border-input bg-bg-input hover:bg-bg-active text-text-app text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 select-none group/btn"
            >
              {isAuthenticating ? (
                <div className="w-5 h-5 border-2 border-text-app border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 group-hover/btn:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </div>

          {/* Secure Cloud Backups Disclaimer */}
          <div className="pt-8 border-t border-border-subtle/40 flex items-center justify-between gap-4">
            <span className="text-[10px] text-text-dim flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Secure cloud backup
            </span>
            <span className="text-[9px] text-text-dim max-w-[200px] text-right leading-tight">
              Streaks, metrics, and cloud state sync instantly when connected.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
