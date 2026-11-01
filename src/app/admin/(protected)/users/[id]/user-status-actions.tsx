'use client';

import { useState } from 'react';
import { deactivateUser, reactivateUser } from '../actions';

export function UserStatusActions({ userId, hasActiveMemberships }: { userId: string; hasActiveMemberships: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleDeactivate() {
    if (!confirm('Suspend all active memberships for this user?')) return;
    setLoading(true);
    await deactivateUser(userId);
    setLoading(false);
    window.location.reload();
  }

  async function handleReactivate() {
    setLoading(true);
    await reactivateUser(userId);
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      {hasActiveMemberships ? (
        <button
          onClick={handleDeactivate}
          disabled={loading}
          className="rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-50"
          style={{
            background: 'var(--danger-tint)',
            color: 'var(--danger-text)',
            border: '1px solid var(--danger-border)',
          }}
        >
          Suspend all memberships
        </button>
      ) : (
        <button
          onClick={handleReactivate}
          disabled={loading}
          className="rounded-md px-4 py-2.5 text-[13px] transition-colors duration-150 disabled:opacity-50"
          style={{
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          Reactivate memberships
        </button>
      )}
    </div>
  );
}
