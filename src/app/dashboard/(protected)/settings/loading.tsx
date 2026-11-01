export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-32 rounded bg-[var(--surface-raised)] mb-2" />
        <div className="h-8 w-24 rounded bg-[var(--surface-raised)]" />
      </div>
      <div className="space-y-6 max-w-2xl">
        {/* Profile card skeleton */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="h-28" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #1a2440 40%, #5478D9 100%)' }} />
          <div className="px-6 pb-5 -mt-10">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--surface-raised)]" />
              <div className="pb-1">
                <div className="h-5 w-36 rounded bg-[var(--surface-raised)] mb-2" />
                <div className="h-3 w-48 rounded bg-[var(--surface-raised)]" />
              </div>
            </div>
            <div className="h-10 rounded-xl bg-[var(--surface-raised)]" />
          </div>
        </div>
        {/* Form skeleton */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="h-4 w-40 rounded bg-[var(--surface-raised)] mb-2" />
          <div className="h-3 w-56 rounded bg-[var(--surface-raised)] mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-16 rounded-lg bg-[var(--surface-raised)]" />
            <div className="h-16 rounded-lg bg-[var(--surface-raised)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
