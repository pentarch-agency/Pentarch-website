'use client';

import { useState } from 'react';
import { createOrganization } from '../actions';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 63);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <Link href="/" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Pentarch</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <Link href="/organizations" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Organizations</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>New</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div
          className="rounded-lg"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--surface-muted)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>New Organization</h1>
                <p className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>Set up a new client tenant</p>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Organization name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
                  style={{
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Subdomain slug
                </label>
                <div className="flex items-center">
                  <input
                    id="slug"
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 rounded-l-md px-3 py-2 font-mono text-[14px] outline-none transition-colors duration-150"
                    style={{
                      background: 'var(--surface-input)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      }}
                    placeholder="acme"
                  />
                  <span
                    className="px-3 py-2 font-mono text-[13px] rounded-r-md flex items-center"
                    style={{
                      background: 'var(--surface-muted)',
                      border: '1px solid var(--border-default)',
                      borderLeft: 'none',
                      color: 'var(--text-subtle)',
                      }}
                  >
                    .pentarch.agency
                  </span>
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-subtle)' }}>Lowercase letters, numbers, and hyphens only.</p>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2.5 p-3 rounded-md text-[13px]"
                  style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
                  style={{
                    background: 'var(--accent-solid)',
                    color: 'var(--text-on-accent)',
                  }}
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  )}
                  {loading ? 'Creating...' : 'Create Organization'}
                </button>
                <Link
                  href="/organizations"
                  className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150 flex items-center"
                  style={{
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
