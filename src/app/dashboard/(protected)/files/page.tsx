import { connection } from 'next/server';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';

const iconByMime: Record<string, string> = {
  pdf: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  default: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
};

function getIconType(mime: string | null): string {
  if (!mime) return 'default';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('pdf')) return 'pdf';
  return 'default';
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase() : '';
}

type FileRow = {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  uploaded_by: string;
  project_id: string | null;
  organization_id: string;
  projects: { name: string } | null;
  organizations: { name: string } | null;
};

export default async function FilesPage() {
  await connection();
  const user = await requireAuth('/login');
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  let files: FileRow[] = [];

  if (orgIds.length > 0) {
    const { data } = await supabase
      .from('files')
      .select('id, name, mime_type, size_bytes, created_at, uploaded_by, project_id, organization_id')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })
      .limit(100);

    files = (data ?? []) as FileRow[];
  }

  const totalSize = files.reduce((sum, f) => sum + (f.size_bytes ?? 0), 0);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="display-sm" style={{ color: 'var(--text-muted)' }}>
            <Link href="/dashboard" className="onlee-link-accent">Dashboard</Link>
            <span className="mx-1.5">/</span>
            Files
          </p>
          <h1 className="text-[1.5rem] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            Files
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(126,159,245,0.1)', color: '#7E9FF5' }}>
            {files.length} files
          </span>
          <span className="text-[12px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
            {formatSize(totalSize)}
          </span>
        </div>
      </div>

      {files.length === 0 ? (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No files yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Files from your organizations will appear here.</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          {/* Table header */}
          <div
            className="hidden md:grid grid-cols-[1fr_140px_100px_100px] gap-4 px-5 py-2.5"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Name</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Project</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Size</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Uploaded</span>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {files.map((file) => {
              const iconType = getIconType(file.mime_type);
              const ext = getExt(file.name);
              const uploaded = new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={file.id}
                  className="md:grid md:grid-cols-[1fr_140px_100px_100px] md:gap-4 flex flex-col gap-1 px-5 py-3.5 onlee-row transition-colors"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {/* File name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(126, 159, 245, 0.1)' }}
                    >
                      <svg className="w-4 h-4" style={{ color: '#7E9FF5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconByMime[iconType]} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                      <div className="flex items-center gap-1.5">
                        {ext && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>
                            {ext}
                          </span>
                        )}
                        <span className="text-[11px] md:hidden" style={{ color: 'var(--text-muted)' }}>{formatSize(file.size_bytes)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="flex items-center">
                    <span className="text-[12px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {file.projects?.name ?? '—'}
                    </span>
                  </div>

                  {/* Size */}
                  <div className="hidden md:flex items-center justify-end">
                    <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{formatSize(file.size_bytes)}</span>
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex items-center justify-end">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{uploaded}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
