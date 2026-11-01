'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteMember } from '../actions';

export function InviteForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    formData.set('organization_id', orgId);
    const result = await inviteMember(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1">
          <label htmlFor="email" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
            style={inputStyle}
            placeholder="member@example.com"
          />
        </div>

        <div className="sm:w-32">
          <label htmlFor="role" className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150 cursor-pointer appearance-none"
            style={inputStyle}
          >
            <option value="member" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Member</option>
            <option value="admin" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {loading ? 'Sending…' : 'Send invite'}
        </button>
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
      {success && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-md text-[13px]"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Invitation sent!
        </div>
      )}
    </form>
  );
}
