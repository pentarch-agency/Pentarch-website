'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrganization } from '../actions';

export function EditOrgForm({ orgId, name, logoUrl }: { orgId: string; name: string; logoUrl: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [orgName, setOrgName] = useState(name);
  const [logo, setLogo] = useState(logoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    const result = await updateOrganization(orgId, { name: orgName, logo_url: logo || null });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
      router.refresh();
    }
  }

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-[12px] rounded-md px-3 py-1.5 transition-colors duration-150"
        style={{ color: 'var(--text-subtle)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-subtle)'; }}
      >
        Edit
      </button>
    );
  }

  return (
    <div className="space-y-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Logo URL</label>
        <input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={inputStyle}
        />
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
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setOrgName(name); setLogo(logoUrl || ''); }}
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
