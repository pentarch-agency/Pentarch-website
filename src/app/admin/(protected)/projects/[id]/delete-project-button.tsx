'use client';

import { useState } from 'react';
import { deleteProject } from '../actions';

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteProject(projectId);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] transition-colors duration-150"
        style={{ color: 'var(--danger-text)' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Delete project
      </button>
    );
  }

  return (
    <div
      className="rounded-md p-4 space-y-3"
      style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)' }}
    >
      <p className="text-[13px] font-medium" style={{ color: 'var(--danger-text)' }}>
        This will permanently delete the project, all its tasks, milestones, and memberships.
      </p>
      <p className="text-[13px]" style={{ color: 'var(--danger-text)' }}>
        Type <strong>{projectName}</strong> to confirm:
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full rounded-md px-3 py-2 text-[14px] outline-none"
        style={{
          background: 'var(--surface-input)',
          border: '1px solid var(--danger-border)',
          color: 'var(--text-primary)',
        }}
        placeholder={projectName}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== projectName}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--danger-solid)', color: '#fff' }}
        >
          {loading ? 'Deleting...' : 'Delete permanently'}
        </button>
        <button
          onClick={() => { setOpen(false); setConfirmText(''); }}
          className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
