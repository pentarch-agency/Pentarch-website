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

  const statusConfig: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending_setup: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusConfig[currentStatus] || 'bg-gray-100'}`}>
        {currentStatus.replace('_', ' ')}
      </span>
      <select
        disabled={loading}
        value=""
        onChange={(e) => {
          if (e.target.value) handleStatusChange(e.target.value);
        }}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600"
      >
        <option value="">Change status...</option>
        {['active', 'pending_setup', 'suspended', 'archived']
          .filter((s) => s !== currentStatus)
          .map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
      </select>
    </div>
  );
}
