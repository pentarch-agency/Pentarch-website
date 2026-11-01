'use client';

import { useState } from 'react';
import { updateInquiryStatus, updateInquiryNotes, assignInquiry } from '../actions';

export function InquiryActions({ inquiryId, currentStatus, currentNotes, assignedTo, founders }: {
  inquiryId: string;
  currentStatus: string;
  currentNotes: string | null;
  assignedTo: string | null;
  founders: { id: string; email: string }[];
}) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');
  const [assigned, setAssigned] = useState(assignedTo || '');
  const [loading, setLoading] = useState(false);

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const selectStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setStatus(newStatus);
    await updateInquiryStatus(inquiryId, newStatus);
    setLoading(false);
  }

  async function handleSaveNotes() {
    setLoading(true);
    await updateInquiryNotes(inquiryId, notes);
    setLoading(false);
  }

  async function handleAssign(userId: string) {
    setLoading(true);
    setAssigned(userId);
    await assignInquiry(inquiryId, userId || null);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg p-5 space-y-4" style={cardStyle}>
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Actions</h2>
        <div className="flex gap-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
              className="rounded-md px-3 py-2 text-[13px] outline-none"
              style={selectStyle}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="responded">Responded</option>
              <option value="closed">Closed</option>
              <option value="spam">Spam</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Assign to</label>
            <select
              value={assigned}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={loading}
              className="rounded-md px-3 py-2 text-[13px] outline-none"
              style={selectStyle}
            >
              <option value="">Unassigned</option>
              {founders.map((f) => (
                <option key={f.id} value={f.id}>{f.email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-5 space-y-4" style={cardStyle}>
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Internal Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-md text-[13px] outline-none resize-none transition-colors duration-150"
          style={{
            background: 'var(--surface-input)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
          placeholder="Add notes..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={loading}
          className="rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50"
          style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
        >
          Save Notes
        </button>
      </div>
    </div>
  );
}
