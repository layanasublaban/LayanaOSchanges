import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Single-user session for the prototype.
 * The real sign-in (Neon Auth + passkey + two-step verification) replaces `signIn` later;
 * the rest of the app only depends on `isSignedIn`, `signIn` and `signOut`.
 */
const STORAGE_KEY = 'lifeos.session';

type AuthState = {
  isSignedIn: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function readSession(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setSignedIn] = useState<boolean>(readSession);

  const signIn = useCallback((email: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, email);
    } catch {
      /* storage can be unavailable; the session then lasts until reload */
    }
    setSignedIn(true);
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSignedIn(false);
  }, []);

  const value = useMemo(() => ({ isSignedIn, signIn, signOut }), [isSignedIn, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function RequireAuth() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  if (!isSignedIn) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
