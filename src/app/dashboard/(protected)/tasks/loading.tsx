export default function TasksLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 rounded bg-[var(--surface-raised)] mb-2" />
        <div className="h-8 w-20 rounded bg-[var(--surface-raised)]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          />
        ))}
      </div>
    </div>
  );
}
