import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { isGoogleAccount } from '../firebase';

interface AuthButtonProps {
  user: User | null;
  isAuthenticating: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function AuthButton({
  user,
  isAuthenticating,
  onSignIn,
  onSignOut,
}: AuthButtonProps) {
  if (isAuthenticating) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-active text-xs text-text-dim">
        <span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span>Connecting…</span>
      </div>
    );
  }

  if (isGoogleAccount(user)) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-semibold max-w-[220px]">
          <UserIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{user?.email}</span>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-input bg-bg-card hover:bg-bg-active text-text-app text-xs font-semibold transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSignIn}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
      title="Sign in to sync across devices"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span>Sign in with Google</span>
    </button>
  );
}
