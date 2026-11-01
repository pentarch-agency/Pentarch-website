import { connection } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireFounder } from '@/lib/auth';
import Link from 'next/link';
import { CreateProjectForm } from './create-project-form';

export default async function NewProjectPage() {
  await connection();
  await requireFounder();

  const supabase = createAdminClient();
  const { data: orgs } = await supabase.from('organizations').select('id, name').order('name');

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
            <Link href="/projects" className="transition-colors duration-150" style={{ color: 'var(--text-muted)' }}>Projects</Link>
            <span style={{ color: 'var(--text-subtle)' }}>/</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>New</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div
          className="rounded-lg"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--surface-muted)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>New Project</h1>
                <p className="text-[12px]" style={{ color: 'var(--text-subtle)' }}>Create a new project for an organization</p>
              </div>
            </div>
            <CreateProjectForm organizations={orgs || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
