import { createClient } from '@/lib/supabase/server';

/**
 * Admin Overview Dashboard
 * All metrics are real database queries — no mock data.
 */
export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch real counts
  const [orgsResult, projectsResult, tasksResult, inquiriesResult] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('contact_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const stats = [
    { label: 'Organizations', value: orgsResult.count ?? 0 },
    { label: 'Projects', value: projectsResult.count ?? 0 },
    { label: 'Active Tasks', value: tasksResult.count ?? 0 },
    { label: 'New Inquiries', value: inquiriesResult.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
