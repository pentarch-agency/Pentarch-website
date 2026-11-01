'use client';

import { useState } from 'react';
import { updateProject } from '../actions';

export function EditProjectForm({ projectId, name, description, status, clientVisible }: {
  projectId: string;
  name: string;
  description: string | null;
  status: string;
  clientVisible: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pName, setPName] = useState(name);
  const [pDesc, setPDesc] = useState(description || '');
  const [pStatus, setPStatus] = useState(status);
  const [pVisible, setPVisible] = useState(clientVisible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    const result = await updateProject(projectId, {
      name: pName,
      description: pDesc || null,
      status: pStatus,
      client_visible: pVisible,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditing(false);
      window.location.reload();
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
        className="text-[13px] transition-colors duration-150 mt-3"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
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
          value={pName}
          onChange={(e) => setPName(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
        <textarea
          value={pDesc}
          onChange={(e) => setPDesc(e.target.value)}
          rows={3}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
        <select
          value={pStatus}
          onChange={(e) => setPStatus(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none"
          style={inputStyle}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={pVisible}
          onChange={(e) => setPVisible(e.target.checked)}
          id="edit_visible"
          className="rounded"
          style={{ accentColor: 'var(--accent-solid)' }}
        />
        <label htmlFor="edit_visible" className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Visible to client</label>
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
          onClick={handleSave}
          disabled={loading}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50"
          style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setPName(name); setPDesc(description || ''); setPStatus(status); setPVisible(clientVisible); }}
          className="rounded-md px-5 py-2.5 text-[13px] transition-colors duration-150"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
