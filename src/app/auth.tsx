import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authClient, rest } from './lib/neon';

type AuthState = {
  loading: boolean;
  isSignedIn: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Creates the single owner account. Only works until an owner exists. */
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

/** Registers the first signed-in user as owner; returns false for anybody else. */
let lastOwnerError = '';
async function isOwner(): Promise<boolean> {
  lastOwnerError = '';
  try {
    const claimed = await rest<boolean>('/rpc/claim_owner', { method: 'POST', body: '{}' });
    if (claimed !== true) lastOwnerError = 'owner check returned ' + String(claimed);
    return claimed === true;
  } catch (e) {
    lastOwnerError = e instanceof Error ? e.message : String(e);
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await authClient.getSession();
    if (data?.user && (await isOwner())) setEmail(data.user.email);
    else {
      // keep the session while we report why, so the real reason is not lost
      setEmail(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const finish = useCallback(async (): Promise<string | null> => {
    await refresh();
    const { data } = await authClient.getSession();
    if (!data?.user) return 'Sign-in did not complete. Please try again.';
    return lastOwnerError ? 'Signed in, but the owner check failed: ' + lastOwnerError : null;
  }, [refresh]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      isSignedIn: !!email,
      email,
      async signIn(e, p) {
        const { error } = await authClient.signIn.email({ email: e, password: p });
        return error ? 'Wrong email or password.' : finish();
      },
      async signUp(e, p) {
        const { error } = await authClient.signUp.email({ email: e, password: p, name: 'Layana' });
        return error ? (error.message ?? 'Could not create the account.') : finish();
      },
      async signOut() {
        await authClient.signOut();
        setEmail(null);
      },
    }),
    [loading, email, finish],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}

export function RequireAuth() {
  const { isSignedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-8 text-sm text-ink-2">Loading…</p>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
