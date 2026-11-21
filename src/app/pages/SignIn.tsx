import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Brand } from '../components/AppShell';
import { Button, Field } from '../components/ui';

export default function SignIn() {
  const { isSignedIn, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && isSignedIn) return <Navigate to={location.state?.from ?? '/'} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    if (mode === 'up' && password.length < 8) return setError('Use at least 8 characters.');
    setBusy(true);
    setError('');
    const problem = mode === 'in' ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setBusy(false);
    if (problem) setError(problem);
    else navigate(location.state?.from ?? '/', { replace: true });
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-hero p-12 lg:flex">
        <Brand />
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-[40px] leading-[48px] text-ink">One calm place for your whole life.</h1>
          <p className="m-0 text-base text-ink-2">
            Personal, Business and Lensiyana, together with your calendar and an assistant that works inside the
            limits you set.
          </p>
        </div>
        <p className="m-0 text-xs text-ink-3">Private. Built for one person.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <form onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-5" noValidate>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[28px] leading-9 text-ink">{mode === 'in' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="m-0 text-sm text-ink-2">
              {mode === 'in' ? 'Sign in to your Life OS.' : 'First-time setup. Only this first account can ever enter.'}
            </p>
          </div>

          <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            label="Password"
            type="password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            placeholder={mode === 'in' ? 'Your password' : 'At least 8 characters'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="m-0 rounded-md bg-danger-bg px-3 py-2 text-[13px] text-danger-fg">
              {error}
            </p>
          )}

          <Button type="submit" full disabled={busy}>
            {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in');
              setError('');
            }}
            className="border-0 bg-transparent text-[13px] text-accent"
          >
            {mode === 'in' ? 'First time? Create the owner account' : 'I already have an account'}
          </button>
        </form>
      </main>
    </div>
  );
}
