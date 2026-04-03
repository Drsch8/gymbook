export function Statistics() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Statistics</h1>
      <p className="text-stone-400 text-sm mb-8">Log some sessions to unlock your stats.</p>

      {['Volume', 'Progression', 'Frequency', 'Records'].map(label => (
        <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 mb-3">
          <div className="h-2.5 w-20 bg-stone-100 rounded mb-4 animate-pulse" />
          <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
          <p className="text-xs text-stone-300 mt-3 text-center">{label}</p>
        </div>
      ))}
    </div>
  )
}
