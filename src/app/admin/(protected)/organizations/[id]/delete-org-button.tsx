'use client';

import { useState } from 'react';
import { deleteOrganization } from '../actions';

export function DeleteOrgButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const result = await deleteOrganization(orgId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] rounded-md px-3 py-1.5 transition-colors duration-150"
        style={{ color: 'var(--danger-text)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-tint)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
      >
        Delete organization
      </button>
    );
  }

  return (
    <div
      className="rounded-md p-5 space-y-4"
      style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)' }}
    >
      <p className="text-[13px] font-medium" style={{ color: 'var(--danger-text)' }}>
        This will permanently delete the organization, all its members, invitations, projects, and tasks.
      </p>
      <p className="text-[13px]" style={{ color: 'var(--danger-text)', opacity: 0.7 }}>
        Type <strong style={{ opacity: 1 }}>{orgName}</strong> to confirm:
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
        style={{
          background: 'var(--surface-input)',
          border: '1px solid var(--danger-border)',
          color: 'var(--text-primary)',
        }}
        placeholder={orgName}
      />
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
      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== orgName}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ background: 'var(--danger-solid)', color: '#fff' }}
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {loading ? 'Deleting…' : 'Delete permanently'}
        </button>
        <button
          onClick={() => { setOpen(false); setConfirmText(''); }}
          className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
