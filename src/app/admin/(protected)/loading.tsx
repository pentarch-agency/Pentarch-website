export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-16 rounded bg-[var(--surface-raised)] mb-2" />
        <div className="h-8 w-48 rounded bg-[var(--surface-raised)]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="h-3 w-20 rounded bg-[var(--surface-raised)] mb-3" />
            <div className="h-7 w-12 rounded bg-[var(--surface-raised)]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          >
            <div className="h-5 w-36 rounded bg-[var(--surface-raised)] mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-12 rounded-lg bg-[var(--surface-raised)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
