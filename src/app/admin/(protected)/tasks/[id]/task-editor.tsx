'use client';

import { useState } from 'react';
import { updateTask, deleteTask } from '../actions';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  milestone_id: string | null;
  client_visible: boolean;
  project_id: string;
  projects: { name: string } | null;
};

export function TaskEditor({ task, assignableUsers, milestones }: {
  task: Task;
  assignableUsers: { id: string; email: string }[];
  milestones: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigned, setAssigned] = useState(task.assigned_to || '');
  const [milestone, setMilestone] = useState(task.milestone_id || '');
  const [visible, setVisible] = useState(task.client_visible);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setLoading(true);
    const result = await updateTask(task.id, {
      title,
      description: desc || null,
      status,
      priority,
      assigned_to: assigned || null,
      milestone_id: milestone || null,
      client_visible: visible,
    });
    setLoading(false);
    if (result?.error) setError(result.error);
    else window.location.reload();
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    await deleteTask(task.id);
  }

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 space-y-5" style={cardStyle}>
        <div className="flex items-start justify-between">
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{task.title}</h1>
          <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{(task.projects as any)?.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none transition-colors duration-150"
              style={inputStyle}
            >
              <option value="todo" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Todo</option>
              <option value="in_progress" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>In Progress</option>
              <option value="review" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Review</option>
              <option value="done" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Done</option>
              <option value="cancelled" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none transition-colors duration-150"
              style={inputStyle}
            >
              <option value="low" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Low</option>
              <option value="medium" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Medium</option>
              <option value="high" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>High</option>
              <option value="urgent" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Assigned to</label>
            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none transition-colors duration-150"
              style={inputStyle}
            >
              <option value="" style={{ background: 'var(--surface-popover)', color: 'var(--text-subtle)' }}>Unassigned</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id} style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>{u.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Milestone</label>
            <select
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-[14px] outline-none appearance-none transition-colors duration-150"
              style={inputStyle}
            >
              <option value="" style={{ background: 'var(--surface-popover)', color: 'var(--text-subtle)' }}>None</option>
              {milestones.map(m => (
                <option key={m.id} value={m.id} style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              id="task_visible"
              className="rounded"
              style={{ accentColor: 'var(--accent-solid)' }}
            />
            <label htmlFor="task_visible" className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Visible to client</label>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full rounded-md px-3 py-2 text-[14px] outline-none transition-colors duration-150"
            style={{
              background: 'var(--surface-input)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
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

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md px-5 py-2.5 text-[13px] font-medium transition-colors duration-150"
            style={{
              background: 'var(--danger-tint)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
            }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
