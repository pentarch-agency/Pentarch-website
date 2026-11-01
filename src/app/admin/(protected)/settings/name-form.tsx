'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateFounderName } from './actions';

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text-primary)',
  height: '40px',
};

export default function NameForm({ firstName, lastName }: { firstName: string | null; lastName: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Not set';

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md cursor-pointer transition-colors duration-150"
        onClick={() => setOpen(true)}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Name</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Display name</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] px-2.5 py-1 rounded-md" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>{displayName}</span>
          <span className="text-[12px] font-medium" style={{ color: 'var(--accent-text)' }}>Edit</span>
        </div>
      </div>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: '#1e1e21', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Name</h3>
            <form
              className="space-y-3"
              action={(formData) => {
                startTransition(async () => {
                  const result = await updateFounderName(formData);
                  if (result.success) setOpen(false);
                });
              }}
            >
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-subtle)' }}>First Name</label>
                  <input name="first_name" defaultValue={firstName ?? ''} placeholder="First name" className="w-full text-[13px] rounded-md px-3 outline-none" style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-subtle)' }}>Last Name</label>
                  <input name="last_name" defaultValue={lastName ?? ''} placeholder="Last name" className="w-full text-[13px] rounded-md px-3 outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-[13px] rounded-md px-6 py-2.5 transition-colors duration-150" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
                <button type="submit" disabled={pending} className="text-[13px] font-semibold rounded-md px-6 py-2.5 disabled:opacity-50" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                  {pending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
