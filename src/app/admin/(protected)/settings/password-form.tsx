'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { changePassword } from './actions';

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text-primary)',
  height: '40px',
};

export default function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-md cursor-pointer transition-colors duration-150"
        onClick={() => { setOpen(true); setError(null); setSuccess(false); }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; }}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>Password</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Account security</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {success && <span className="text-[11px]" style={{ color: 'var(--success-text)' }}>Updated</span>}
          <span className="text-[12px] font-medium" style={{ color: 'var(--accent-text)' }}>Change</span>
        </div>
      </div>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: '#1e1e21', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
            <form
              className="space-y-3"
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await changePassword(formData);
                  if (result.error) setError(result.error);
                  else { setOpen(false); setSuccess(true); }
                });
              }}
            >
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-subtle)' }}>New Password</label>
                <input name="password" type="password" placeholder="New password" required minLength={8} className="w-full text-[13px] rounded-md px-3 outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-subtle)' }}>Confirm Password</label>
                <input name="confirm_password" type="password" placeholder="Confirm new password" required minLength={8} className="w-full text-[13px] rounded-md px-3 outline-none" style={inputStyle} />
              </div>
              {error && <p className="text-[11px]" style={{ color: 'var(--danger-text)' }}>{error}</p>}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-[13px] rounded-md px-6 py-2.5" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>Cancel</button>
                <button type="submit" disabled={pending} className="text-[13px] font-semibold rounded-md px-6 py-2.5 disabled:opacity-50" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                  {pending ? 'Saving...' : 'Update Password'}
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
