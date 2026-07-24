interface InfoPanelProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function InfoPanel({ title, onClose, children }: InfoPanelProps) {
  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute left-3 right-3 mx-auto max-w-[680px] bg-elevated rounded-panel shadow-2xl overflow-hidden flex flex-col"
        style={{
          top: 'calc(env(safe-area-inset-top) + 12px)',
          bottom: 'calc(env(safe-area-inset-bottom) + 12px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h2 className="text-base font-bold font-display text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-faint hover:text-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
