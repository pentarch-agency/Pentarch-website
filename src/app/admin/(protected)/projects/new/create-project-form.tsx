'use client';

import { useState } from 'react';
import { createProject } from '../actions';

export function CreateProjectForm({ organizations }: { organizations: { id: string; name: string }[] }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await createProject(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Organization <span style={{ color: 'var(--danger-text)' }}>*</span>
        </label>
        <select
          name="organization_id"
          required
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none"
          style={inputStyle}
        >
          <option value="" style={{ background: 'var(--surface-popover)', color: 'var(--text-subtle)' }}>Select...</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id} style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>{o.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Name <span style={{ color: 'var(--danger-text)' }}>*</span>
        </label>
        <input
          name="name"
          required
          minLength={2}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="client_visible"
          id="client_visible"
          className="rounded"
          style={{ accentColor: 'var(--accent-solid)' }}
        />
        <label htmlFor="client_visible" className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Visible to client</label>
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
          style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
        >
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          )}
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
