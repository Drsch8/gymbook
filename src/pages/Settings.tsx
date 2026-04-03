import { exportToCSV } from '../db'
import { usePreferences } from '../hooks/usePreferences'

export function Settings() {
  const { prefs, update } = usePreferences()

  const handleExport = async () => {
    const csv = await exportToCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gymbook-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Settings</h1>

      <div className="space-y-3">
        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-stone-900 text-sm font-medium">Weight unit</p>
            <p className="text-stone-400 text-xs mt-0.5">Used for all exercises</p>
          </div>
          <div className="flex gap-1">
            {(['kg', 'lbs'] as const).map(unit => (
              <button key={unit} onClick={() => update({ weightUnit: unit })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  prefs.weightUnit === unit
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}>
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4">
          <p className="text-stone-900 text-sm font-medium mb-0.5">Default rest time</p>
          <p className="text-stone-400 text-xs mb-3">{prefs.restTimerDefault}s between sets</p>
          <div className="flex gap-2">
            {[60, 90, 120, 180, 240].map(s => (
              <button key={s} onClick={() => update({ restTimerDefault: s })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  prefs.restTimerDefault === s
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}>
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-stone-900 text-sm font-medium">Export data</p>
            <p className="text-stone-400 text-xs mt-0.5">Download all sessions as CSV</p>
          </div>
          <button onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium transition-colors">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
