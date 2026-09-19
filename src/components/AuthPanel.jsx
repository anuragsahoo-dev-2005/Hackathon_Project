import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LogIn, UserPlus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthPanel({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Add the VITE_SUPABASE values to your local environment.');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!supabase) return;
    setBusy(true);

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm your account, then sign in.');
      setMode('login');
      setPassword('');
      return;
    }

    onAuthenticated?.(result.data.user);
    onClose();
  };

  const resendConfirmation = async () => {
    if (!supabase || !email) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    setResending(true);
    const result = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMessage('Confirmation email sent. Check your inbox and spam folder.');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-charcoal/60 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="w-full max-w-md rounded-card border border-terracotta/20 bg-warm-white p-5 text-charcoal shadow-warm-lg sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-terracotta">Smriti Sathi account</p>
            <h2 id="auth-title" className="mt-2 font-serif text-3xl">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-2 text-sm text-charcoal/65">Your progress and care activities stay connected across devices.</p>
          </div>
          <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/65 transition hover:border-terracotta hover:text-terracotta" aria-label="Close sign in">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-soft border border-charcoal/20 bg-cream px-4 text-base font-normal outline-none transition focus:border-terracotta" placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-semibold">Password
            <span className="relative mt-1.5 block">
              <input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-soft border border-charcoal/20 bg-cream px-4 pr-12 text-base font-normal outline-none transition focus:border-terracotta" placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1 flex min-h-10 min-w-10 items-center justify-center rounded-full text-charcoal/55 hover:text-terracotta" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && <p role="alert" className="rounded-soft border border-terracotta/25 bg-terracotta-light p-3 text-sm text-terracotta-dark">{error}</p>}
          {message && <p role="status" className="rounded-soft border border-sage/25 bg-sage-light p-3 text-sm text-sage-dark">{message}</p>}

          <button type="submit" disabled={busy || !supabase} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-terracotta px-5 py-3 text-base font-semibold text-warm-white transition hover:bg-terracotta-hover disabled:opacity-60">
            {busy ? <LoaderCircle size={18} className="animate-spin" /> : mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <button type="button" onClick={resendConfirmation} disabled={resending || !supabase} className="w-full text-center text-sm font-semibold text-charcoal/65 hover:text-terracotta disabled:opacity-50">
              {resending ? 'Sending confirmation email...' : 'Resend confirmation email'}
            </button>
          )}
        </form>

        <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="mt-5 w-full text-center text-sm font-semibold text-terracotta hover:underline">
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
