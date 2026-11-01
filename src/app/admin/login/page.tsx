'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function Logo({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/pentarch-logo.svg" alt="Pentarch" className={className} />
  );
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    document.cookie = 'sidebar-collapsed=true;path=/;max-age=31536000;SameSite=Lax';
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0F1A' }}>
      {/* Left side — branding */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #111A2E 0%, #0B0F1A 50%, #0D1220 100%)' }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7E9FF5 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #9FBBFF 0%, transparent 70%)' }}
        />

        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Logo */}
          <div>
            <Logo className="h-7 w-auto" />
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1
              className="text-[2.75rem] font-bold leading-[1.15] tracking-tight"
              style={{ color: '#DCE3EF' }}
            >
              Manage your
              <br />
              agency from
              <br />
              <span style={{ color: '#7E9FF5' }}>one place.</span>
            </h1>
            <p
              className="mt-6 text-[1.05rem] leading-relaxed max-w-sm"
              style={{ color: '#5A6A84' }}
            >
              Organizations, projects, teams, and billing — all in your founder dashboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5 mt-10">
              {['Organizations', 'Projects', 'Finance', 'Teams'].map((item) => (
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

          {/* Footer */}
          <p className="text-xs" style={{ color: '#2E3A50' }}>
            &copy; {new Date().getFullYear()} Pentarch Agency
          </p>
        </div>
      </div>

      {/* Right side — login form (light) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12" style={{ background: '#FFFFFF' }}>
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <Logo className="h-6 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
              Welcome back
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Sign in to the admin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="you@pentarch.agency"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: '#9CA3AF' }}>
            Founder access only. Contact your admin if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
