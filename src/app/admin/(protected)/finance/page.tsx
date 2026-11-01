import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';
import { createFinanceRecord, deleteFinanceRecord } from './actions';

const categoryLabels: Record<string, string> = {
  project_payment: 'Project Payment',
  retainer: 'Retainer',
  subscription: 'Subscription',
  consulting: 'Consulting',
  salary: 'Salary',
  contractor: 'Contractor',
  software: 'Software',
  hosting: 'Hosting',
  marketing: 'Marketing',
  office: 'Office',
  taxes: 'Taxes',
  other: 'Other',
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; filter?: string }>;
}) {
  await connection();
  await requireFounder();
  const supabase = createAdminClient();
  const params = await searchParams;
  const filter = params.filter ?? 'all';

  let query = supabase
    .from('finance_records')
    .select('*, organizations(name), projects(name)')
    .order('recorded_at', { ascending: false });

  if (filter === 'income') query = query.eq('type', 'income');
  if (filter === 'expense') query = query.eq('type', 'expense');

  const { data: records } = await query.limit(50);

  const { data: orgs, count: orgCount } = await supabase.from('organizations').select('id, name', { count: 'exact' }).order('name');
  const { data: projects } = await supabase.from('projects').select('id, name').order('name');

  const allRecords = records ?? [];
  const totalIncome = allRecords.filter(r => r.type === 'income' && r.status === 'completed').reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = allRecords.filter(r => r.type === 'expense' && r.status === 'completed').reduce((s, r) => s + Number(r.amount), 0);
  const net = totalIncome - totalExpense;

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const cardStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-default)' };
  const thStyle = { color: 'var(--text-subtle)', background: 'var(--surface-muted)', height: '36px' };
  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 -mx-6 -mt-6 px-6 mb-6"
        style={{ background: 'var(--surface-canvas)', borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5 text-[13px] pl-10 lg:pl-0">
            <Link href="/" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Pentarch</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Finance</span>
          </div>
        </div>
      </div>

      {params.error && (
        <div
          className="mb-5 px-4 py-3 rounded-md text-[13px]"
          style={{ background: 'var(--danger-tint)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          {params.error === 'missing_fields' ? 'Please fill in all required fields.' : 'Something went wrong. Try again.'}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link href="/organizations" className="rounded-lg px-5 py-4" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
            <p className="data-sm" style={{ color: 'var(--text-subtle)' }}>Organizations</p>
          </div>
          <p className="data-xl" style={{ color: 'var(--accent-solid)' }}>{orgCount ?? 0}</p>
        </Link>
        <div className="rounded-lg px-5 py-4" style={cardStyle}>
          <p className="data-sm mb-2" style={{ color: 'var(--text-subtle)' }}>Total Income</p>
          <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{fmt(totalIncome)}</p>
        </div>
        <div className="rounded-lg px-5 py-4" style={cardStyle}>
          <p className="data-sm mb-2" style={{ color: 'var(--text-subtle)' }}>Total Expenses</p>
          <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{fmt(totalExpense)}</p>
        </div>
        <div className="rounded-lg px-5 py-4" style={cardStyle}>
          <p className="data-sm mb-2" style={{ color: 'var(--text-subtle)' }}>Net Profit</p>
          <p className="data-xl" style={{ color: 'var(--text-primary)' }}>{fmt(net)}</p>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Records List */}
        <div className="flex-1 min-w-0">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-4">
            {['all', 'income', 'expense'].map(f => (
              <Link
                key={f}
                href={`/finance${f === 'all' ? '' : `?filter=${f}`}`}
                className="px-4 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors duration-150"
                style={{
                  background: filter === f ? 'var(--accent-solid)' : 'transparent',
                  color: filter === f ? 'var(--text-on-accent)' : 'var(--text-muted)',
                }}
              >
                {f}
              </Link>
            ))}
          </div>

          <div className="rounded-lg overflow-hidden" style={cardStyle}>
            {allRecords.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>No records yet</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>Add your first financial record using the form</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left px-5 data-sm" style={thStyle}>Date</th>
                    <th className="text-left px-5 data-sm" style={thStyle}>Description</th>
                    <th className="text-left px-5 data-sm" style={thStyle}>Category</th>
                    <th className="text-left px-5 data-sm" style={thStyle}>Status</th>
                    <th className="text-right px-5 data-sm" style={thStyle}>Amount</th>
                    <th className="text-right px-5 data-sm" style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.map((r) => {
                    const isDanger = r.status === 'cancelled' || r.status === 'refunded';
                    return (
                      <tr
                        key={r.id}
                        className="onlee-row"
                        style={{ borderBottom: '1px solid var(--border-default)' }}
                      >
                        <td className="px-5 text-[12px]" style={{ color: 'var(--text-muted)', height: '50px' }}>{new Date(r.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="px-5">
                          <p className="text-[13px] font-medium truncate max-w-[240px]" style={{ color: 'var(--text-primary)' }}>{r.description}</p>
                          {r.reference && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Ref: {r.reference}</p>}
                        </td>
                        <td className="px-5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{categoryLabels[r.category] ?? r.category}</td>
                        <td className="px-5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: isDanger ? 'var(--danger-tint)' : 'var(--surface-muted)',
                              color: isDanger ? 'var(--danger-text)' : 'var(--text-muted)',
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 text-right data-md" style={{ color: 'var(--text-primary)' }}>
                          {r.type === 'income' ? '+' : '-'}{fmt(Number(r.amount))}
                        </td>
                        <td className="px-5 text-right">
                          <form action={deleteFinanceRecord}>
                            <input type="hidden" name="id" value={r.id} />
                            <button
                              type="submit"
                              className="onlee-danger-icon"
                              style={{ color: 'var(--text-subtle)' }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Record Form */}
        <div className="w-[360px] shrink-0">
          <div className="rounded-lg" style={cardStyle}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="display-sm" style={{ color: 'var(--text-primary)' }}>Add Record</h3>
            </div>
            <form action={createFinanceRecord} className="p-5 space-y-4">
              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Type *</label>
                <select name="type" required className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Category *</label>
                <select name="category" required className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle}>
                  {Object.entries(categoryLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Amount (USD) *</label>
                <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Description *</label>
                <input name="description" type="text" required placeholder="What is this for?" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Reference / Invoice #</label>
                <input name="reference" type="text" placeholder="INV-001" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Date</label>
                <input name="recorded_at" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Status</label>
                <select name="status" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle}>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Organization</label>
                <select name="organization_id" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle}>
                  <option value="">None</option>
                  {(orgs ?? []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Project</label>
                <select name="project_id" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle}>
                  <option value="">None</option>
                  {(projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="data-sm block mb-1.5" style={{ color: 'var(--text-subtle)' }}>Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Additional details..."
                  className="w-full px-3 py-2 rounded-md text-[13px] outline-none resize-none"
                  style={{ background: 'var(--surface-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md py-2.5 text-[13px] font-semibold transition-colors duration-150"
                style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
              >
                Add Record
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
