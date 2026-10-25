import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Client Dashboard Overview — real metrics from database queries.
 */
export default async function DashboardOverview() {
  const headersList = await headers();
  const orgSlug = headersList.get('x-pentarch-org-slug');

  const supabase = await createClient();

  // Get org ID for scoped queries
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug!)
    .single();

  if (!org) return null;

  const [projectsResult, tasksResult, notificationsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .eq('status', 'active'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .eq('status', 'in_progress'),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', org.id)
      .eq('read', false),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome back</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Active Projects" value={projectsResult.count ?? 0} />
        <StatCard label="Tasks In Progress" value={tasksResult.count ?? 0} />
        <StatCard label="Unread Notifications" value={notificationsResult.count ?? 0} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
