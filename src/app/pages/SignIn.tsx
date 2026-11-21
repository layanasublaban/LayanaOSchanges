import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '../auth';
import { Brand } from '../components/AppShell';
import { Button, Field } from '../components/ui';

export default function SignIn() {
  const { isSignedIn, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isSignedIn) return <Navigate to="/" replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    signIn(email.trim());
    navigate(location.state?.from ?? '/', { replace: true });
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-hero p-12 lg:flex">
        <Brand />
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-[40px] leading-[48px] text-ink">One calm place for your whole life.</h1>
          <p className="m-0 text-base text-ink-2">
            Personal, Business and Lensiyana, together with your calendar and an assistant that works inside
            the limits you set.
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
            <h2 className="text-[28px] leading-9 text-ink">Welcome back</h2>
            <p className="m-0 text-sm text-ink-2">Sign in to your Life OS.</p>
          </div>

          <Field
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="m-0 rounded-md bg-danger-bg px-3 py-2 text-[13px] text-danger-fg">
              {error}
            </p>
          )}

          <Button type="submit" full>
            Sign in
          </Button>
          <Button variant="secondary" full onClick={() => { signIn('passkey'); navigate('/', { replace: true }); }}>
            <Fingerprint size={18} aria-hidden /> Use a passkey
          </Button>

          <p className="m-0 text-center text-xs text-ink-3">
            Prototype: any email and password work until Neon Auth is connected.
          </p>
        </form>
      </main>
    </div>
  );
}
