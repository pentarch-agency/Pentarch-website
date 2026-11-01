'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'magic'>('login');
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
        <div className="w-full max-w-md p-8 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(84, 120, 217, 0.1)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#5478D9">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>Check your email</h2>
          <p style={{ color: '#6B7280' }}>
            We sent a sign-in link to <strong style={{ color: '#111827' }}>{email}</strong>. Click the link to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0F1A' }}>
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #111A2E 0%, #0B0F1A 50%, #0D1220 100%)' }}
      >
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7E9FF5 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #9FBBFF 0%, transparent 70%)' }}
        />

        <div className="relative z-10 p-12 flex flex-col h-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pentarch-logo.svg" alt="Pentarch" className="h-7 w-auto" />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1
              className="text-[2.75rem] font-bold leading-[1.15] tracking-tight"
              style={{ color: '#DCE3EF' }}
            >
              Your client
              <br />
              dashboard,
              <br />
              <span style={{ color: '#7E9FF5' }}>at a glance.</span>
            </h1>
            <p
              className="mt-6 text-[1.05rem] leading-relaxed max-w-sm"
              style={{ color: '#5A6A84' }}
            >
              Track progress, review deliverables, and stay connected with your project team.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-10">
              {['Projects', 'Deliverables', 'Messages', 'Billing'].map((item) => (
                <span
                  key={item}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(126, 159, 245, 0.08)',
                    color: '#6B83AD',
                    border: '1px solid rgba(126, 159, 245, 0.12)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: '#2E3A50' }}>
            &copy; {new Date().getFullYear()} Pentarch Agency
          </p>
        </div>
      </div>

      {/* Right side — login form (light) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12" style={{ background: '#FFFFFF' }}>
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex justify-center mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pentarch-logo.svg" alt="Pentarch" className="h-6 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
              Client Portal
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Sign in to your dashboard
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-lg p-1 mb-6"
            style={{ background: '#F3F4F6' }}
          >
            <button
              onClick={() => setMode('login')}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#111827' : '#6B7280',
                boxShadow: mode === 'login' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Password
            </button>
            <button
              onClick={() => setMode('magic')}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                background: mode === 'magic' ? '#FFFFFF' : 'transparent',
                color: mode === 'magic' ? '#111827' : '#6B7280',
                boxShadow: mode === 'magic' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Magic link
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handlePasswordLogin : handleMagicLink} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#374151' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#5478D9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(84, 120, 217, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {mode === 'login' && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: '#374151' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#5478D9';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(84, 120, 217, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #5478D9 0%, #7E9FF5 100%)',
                color: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(84, 120, 217, 0.15)',
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Send magic link'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: '#9CA3AF' }}>
            Access is by invitation only. Contact your Pentarch account manager for access.
          </p>
        </div>
      </div>
    </div>
  );
}
