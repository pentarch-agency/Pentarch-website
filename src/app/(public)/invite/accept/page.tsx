'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Step = 'loading' | 'invalid' | 'expired' | 'set-password' | 'success' | 'error';

export default function AcceptInvitationPage() {
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setStep('invalid');
      return;
    }
    setToken(t);
    validateToken(t);
  }, []);

  async function validateToken(t: string) {
    try {
      const res = await fetch(`/api/invite/validate?token=${encodeURIComponent(t)}`);
      const data = await res.json();

      if (!res.ok) {
        setStep(data.code === 'expired' ? 'expired' : 'invalid');
        return;
      }

      setOrgName(data.orgName);
      setEmail(data.email);
      setStep('set-password');
    } catch {
      setStep('error');
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation.');
        setLoading(false);
        return;
      }

      // Sign in with the new credentials
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Account created but sign-in failed. Try logging in manually.');
        setLoading(false);
        return;
      }

      setStep('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-vermilion border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-grey">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (step === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Invalid Invitation</h2>
          <p className="text-grey">This invitation link is invalid or has already been used.</p>
        </div>
      </div>
    );
  }

  if (step === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Invitation Expired</h2>
          <p className="text-grey">This invitation has expired. Please ask your administrator to send a new one.</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Welcome to {orgName}!</h2>
          <p className="text-grey">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Join {orgName}</h1>
            <p className="text-grey mt-2">Set up your account to get started</p>
          </div>

          <div className="bg-bone rounded-lg p-3 mb-6">
            <p className="text-sm text-slate">
              Signing up as <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleAccept} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
                className="w-full px-4 py-2.5 border border-slate/30 rounded-lg focus:ring-2 focus:ring-vermilion focus:border-transparent outline-none transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate mb-1">
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-slate/30 rounded-lg focus:ring-2 focus:ring-vermilion focus:border-transparent outline-none transition-shadow"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-vermilion text-white rounded-lg hover:bg-vermilion/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up your account...' : 'Accept & Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-grey mt-6">
          By accepting, you agree to access this workspace on Pentarch.
        </p>
      </div>
    </div>
  );
}
