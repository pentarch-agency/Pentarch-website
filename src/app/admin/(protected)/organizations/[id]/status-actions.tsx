'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrganizationStatus } from '../actions';

export function StatusActions({ orgId, currentStatus }: { orgId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    const result = await updateOrganizationStatus(orgId, newStatus);
    if (!result?.error) {
      router.refresh();
    }
    setLoading(false);
  }

  const isDanger = currentStatus === 'suspended' || currentStatus === 'archived';

  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
        style={{
          background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
          color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isDanger
              ? 'var(--danger-solid)'
              : currentStatus === 'active'
                ? 'var(--success-solid)'
                : 'var(--text-subtle)',
          }}
        />
        {currentStatus.replace('_', ' ')}
      </span>
      <select
        disabled={loading}
        value=""
        onChange={(e) => {
          if (e.target.value) handleStatusChange(e.target.value);
        }}
        className="text-[12px] rounded-md px-2.5 py-2 outline-none transition-colors duration-150 cursor-pointer appearance-none"
        style={{
          background: 'var(--surface-input)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
        }}
      >
        <option value="" style={{ background: 'var(--surface-popover)', color: 'var(--text-subtle)' }}>Change status…</option>
        {['active', 'pending_setup', 'suspended', 'archived']
          .filter((s) => s !== currentStatus)
          .map((s) => (
            <option key={s} value={s} style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>{s.replace('_', ' ')}</option>
          ))}
      </select>
    </div>
  );
}
