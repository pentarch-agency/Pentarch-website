export default function FilesLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 rounded bg-[var(--surface-raised)] mb-2" />
        <div className="h-8 w-16 rounded bg-[var(--surface-raised)]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          />
        ))}
      </div>
    </div>
  );
}
