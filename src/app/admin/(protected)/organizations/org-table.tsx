'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type Org = { id: string; name: string; slug: string; status: string; created_at: string };

const STATUS_OPTIONS = ['all', 'active', 'pending_setup', 'suspended'] as const;

export default function OrgTable({ orgs }: { orgs: Org[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = orgs;
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q));
    }
    return list;
  }, [orgs, search, statusFilter]);

  const statusLabel = (s: string) => s === 'all' ? 'All Status' : s.replace('_', ' ');

  return (
    <div>
      {/* Filter Bar */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 p-3 rounded-lg"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-subtle)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md text-[13px] outline-none"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors duration-150"
              style={{
                background: statusFilter === s ? 'var(--accent-solid)' : 'var(--surface-muted)',
                color: statusFilter === s ? 'var(--text-on-accent)' : 'var(--text-muted)',
                border: statusFilter === s ? '1px solid var(--accent-solid)' : '1px solid var(--border-default)',
              }}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-[12px] mb-3 px-1" style={{ color: 'var(--text-subtle)' }}>
        {filtered.length} organization{filtered.length !== 1 ? 's' : ''}
        {statusFilter !== 'all' || search ? ' found' : ''}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="rounded-lg p-10 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {orgs.length === 0 ? 'No organizations yet' : 'No matches'}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>
            {orgs.length === 0 ? 'Create your first organization to get started' : 'Try a different search or filter'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-default)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border-default)' }}>
                  <th className="text-left data-sm px-5" style={{ color: 'var(--text-subtle)', height: '36px' }}>Organization</th>
                  <th className="text-left data-sm px-5 hidden sm:table-cell" style={{ color: 'var(--text-subtle)', height: '36px' }}>Subdomain</th>
                  <th className="text-left data-sm px-5" style={{ color: 'var(--text-subtle)', height: '36px' }}>Status</th>
                  <th className="text-left data-sm px-5 hidden md:table-cell" style={{ color: 'var(--text-subtle)', height: '36px' }}>Created</th>
                  <th className="w-10 px-3" style={{ height: '36px' }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => {
                  const initial = org.name[0]?.toUpperCase() ?? '?';
                  const isDanger = org.status === 'suspended';

                  return (
                    <tr
                      key={org.id}
                      className="group onlee-row cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onClick={() => router.push(`/organizations/${org.id}`)}
                    >
                      <td className="px-5" style={{ height: '50px' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-bold shrink-0"
                            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
                          >
                            {initial}
                          </div>
                          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {org.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 hidden sm:table-cell" style={{ height: '50px' }}>
                        <span className="text-[12px] font-mono" style={{ color: 'var(--text-subtle)' }}>{org.slug}.pentarch.agency</span>
                      </td>
                      <td className="px-5" style={{ height: '50px' }}>
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{
                            background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                            color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: isDanger ? 'var(--danger-solid)' : org.status === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)',
                            }}
                          />
                          {org.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 hidden md:table-cell" style={{ height: '50px' }}>
                        <span className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>
                          {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-3" style={{ height: '50px' }}>
                        <span style={{ color: 'var(--text-subtle)' }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
