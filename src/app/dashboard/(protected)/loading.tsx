export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-4 w-20 rounded bg-[var(--surface-raised)] mb-2" />
        <div className="h-8 w-64 rounded bg-[var(--surface-raised)]" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-raised)]" />
              <div className="h-3 w-20 rounded bg-[var(--surface-raised)]" />
            </div>
            <div className="h-7 w-12 rounded bg-[var(--surface-raised)]" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="h-5 w-40 rounded bg-[var(--surface-raised)] mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-[var(--surface-raised)]" />
            ))}
          </div>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="h-5 w-28 rounded bg-[var(--surface-raised)] mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-[var(--surface-raised)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
