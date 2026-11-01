'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateMemberRole, updateMemberStatus, resendInvite } from '../actions';

export function MemberActions({ membershipId, currentRole, currentStatus, orgId, userId, hasLoggedIn }: {
  membershipId: string;
  currentRole: string;
  currentStatus: string;
  orgId: string;
  userId: string;
  hasLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [resendMsg, setResendMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmRemove(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  async function handleRoleChange(newRole: string) {
    setLoading(true);
    setMenuOpen(false);
    await updateMemberRole(membershipId, newRole);
    setLoading(false);
    router.refresh();
  }

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setMenuOpen(false);
    setConfirmRemove(false);
    await updateMemberStatus(membershipId, newStatus);
    setLoading(false);
    router.refresh();
  }

  async function handleResend() {
    setLoading(true);
    setResendMsg(null);
    const result = await resendInvite(orgId, userId);
    setLoading(false);
    if (result.error) {
      setResendMsg({ type: 'error', text: result.error });
    } else {
      setResendMsg({ type: 'success', text: 'Sent!' });
      setTimeout(() => setResendMsg(null), 3000);
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {/* Resend invite — inline button for pending users */}
      {!hasLoggedIn && currentStatus === 'active' && (
        resendMsg ? (
          <span className="text-[11px] font-medium px-2" style={{ color: resendMsg.type === 'success' ? 'var(--success-solid)' : 'var(--danger-text)' }}>
            {resendMsg.text}
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-md px-2.5 py-1.5 transition-all duration-150 disabled:opacity-50"
            style={{ color: 'var(--accent-solid)', background: 'var(--accent-tint, #FFF3F0)', border: '1px solid var(--accent-border, #FFD6CC)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            {loading ? 'Sending...' : 'Resend'}
          </button>
        )
      )}

      {/* Three-dot menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-100"
          style={{ color: 'var(--text-subtle)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
          aria-label="Member actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-44 rounded-lg py-1 z-50"
            style={{
              background: 'var(--surface-popover)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            {/* Role section */}
            <div className="px-3 pt-1.5 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Role</span>
            </div>
            <button
              onClick={() => handleRoleChange('admin')}
              disabled={loading || currentRole === 'admin'}
              className="w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-100 disabled:opacity-40"
              style={{ color: currentRole === 'admin' ? 'var(--accent-solid)' : 'var(--text-primary)' }}
              onMouseEnter={(e) => { if (currentRole !== 'admin') e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
            >
              {currentRole === 'admin' ? '✓ Admin' : '  Admin'}
            </button>
            <button
              onClick={() => handleRoleChange('member')}
              disabled={loading || currentRole === 'member'}
              className="w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-100 disabled:opacity-40"
              style={{ color: currentRole === 'member' ? 'var(--accent-solid)' : 'var(--text-primary)' }}
              onMouseEnter={(e) => { if (currentRole !== 'member') e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
            >
              {currentRole === 'member' ? '✓ Member' : '  Member'}
            </button>

            {/* Divider */}
            <div className="my-1" style={{ borderTop: '1px solid var(--border-default)' }} />

            {/* Status actions */}
            {currentStatus === 'active' ? (
              <button
                onClick={() => handleStatusChange('suspended')}
                disabled={loading}
                className="w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-100 disabled:opacity-50"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                Suspend
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={loading}
                className="w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-100 disabled:opacity-50"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                Reactivate
              </button>
            )}

            {/* Divider */}
            <div className="my-1" style={{ borderTop: '1px solid var(--border-default)' }} />

            {/* Remove */}
            {!confirmRemove ? (
              <button
                onClick={() => setConfirmRemove(true)}
                disabled={loading}
                className="w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-100 disabled:opacity-50"
                style={{ color: 'var(--danger-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-tint)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                Remove member
              </button>
            ) : (
              <div className="px-3 py-2">
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Remove this member?</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange('removed')}
                    disabled={loading}
                    className="text-[11px] font-medium rounded px-2.5 py-1 transition-colors duration-100 disabled:opacity-50"
                    style={{ background: 'var(--danger-solid)', color: '#fff' }}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="text-[11px] rounded px-2 py-1 transition-colors duration-100"
                    style={{ color: 'var(--text-subtle)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
