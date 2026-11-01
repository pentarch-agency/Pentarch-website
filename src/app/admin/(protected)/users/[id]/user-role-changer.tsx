'use client';

import { useState } from 'react';
import { updateUserRole } from '../actions';

export function UserRoleChanger({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(newRole: string) {
    setLoading(true);
    await updateUserRole(userId, newRole);
    setLoading(false);
    window.location.reload();
  }

  const selectStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <select
      value={currentRole}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded-md px-3 py-2 text-[13px] outline-none appearance-none transition-colors duration-150 disabled:opacity-50"
      style={selectStyle}
    >
      <option value="founder" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Founder</option>
      <option value="team_member" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Team Member</option>
      <option value="client" style={{ background: 'var(--surface-popover)', color: 'var(--text-primary)' }}>Client</option>
    </select>
  );
}
