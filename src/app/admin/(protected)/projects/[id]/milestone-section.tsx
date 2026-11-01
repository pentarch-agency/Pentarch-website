'use client';

import { useState } from 'react';
import { addMilestone, deleteMilestone } from '../actions';

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
};

export function MilestoneSection({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await addMilestone(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setAdding(false);
      window.location.reload();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete milestone "${name}"?`)) return;
    await deleteMilestone(id);
    window.location.reload();
  }

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-3">
      {milestones.length === 0 && !adding && (
        <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>No milestones yet.</p>
      )}
      {milestones.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
            {m.due_date && <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>Due {new Date(m.due_date).toLocaleDateString()}</span>}
            {m.completed_at && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--success-solid)' }} />
                Completed
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(m.id, m.name)}
            className="text-[11px] transition-colors duration-150"
            style={{ color: 'var(--danger-text)' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Delete
          </button>
        </div>
      ))}
      {adding ? (
        <form action={handleAdd} className="space-y-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
          <input type="hidden" name="project_id" value={projectId} />
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input
              name="name"
              required
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Due date</label>
            <input
              name="due_date"
              type="date"
              className="rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
              style={inputStyle}
            />
          </div>
          {error && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-md text-[13px]"
              style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
            >
              {error}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50"
              style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-[13px] transition-colors duration-150"
          style={{ color: 'var(--accent-text)' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          + Add milestone
        </button>
      )}
    </div>
  );
}
