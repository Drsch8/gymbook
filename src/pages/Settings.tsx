import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportToCSV, resetFogProgram, getPreferences } from '../db'
import { usePreferences } from '../hooks/usePreferences'
import { useAuth } from '../hooks/useAuth'
import { FOG_PROGRAMS, flattenFogProgram } from '../data/fogPrograms'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

// ── Building blocks ────────────────────────────────────────────────────────────

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold font-body text-faint uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-surface border border-line rounded-panel divide-y divide-line overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-ink text-sm font-medium">{label}</p>
        {sub && <p className="text-faint text-xs mt-0.5 truncate">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function Segment<T extends string | number>({ options, value, onChange, fmt }: {
  options: readonly T[]; value: T; onChange: (v: T) => void; fmt?: (v: T) => string
}) {
  return (
    <div className="flex gap-1 shrink-0">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-control text-sm font-semibold transition-colors ${
            value === opt ? 'bg-ink text-bg' : 'bg-elevated text-muted hover:bg-line'
          }`}>
          {fmt ? fmt(opt) : opt}
        </button>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function Settings() {
  const { prefs, update } = usePreferences()
  const [programProgress, setProgramProgress] = useState<Record<string, number>>({})
  const [confirmReset, setConfirmReset] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getPreferences().then(p => setProgramProgress(p.programProgress ?? {}))
  }, [])

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
    <div className="bg-bg px-[18px] pt-safe">
      <div className="pt-[26px] pb-5">
        <h1 className="font-display text-[26px] font-bold text-ink -tracking-wide">Settings</h1>
      </div>

      <div className="pb-8">
        <Group title="Preferences">
          <Row label="Weight unit" sub="Used for all exercises">
            <Segment options={['kg', 'lbs'] as const} value={prefs.weightUnit} onChange={v => update({ weightUnit: v })} />
          </Row>
          <div className="px-4 py-3.5">
            <p className="text-ink text-sm font-medium">Default rest time</p>
            <p className="text-faint text-xs mb-3">{prefs.restTimerDefault}s between sets</p>
            <div className="flex gap-2">
              {[30, 60, 90, 120, 180].map(s => (
                <button key={s} onClick={() => update({ restTimerDefault: s })}
                  className={`flex-1 py-1.5 rounded-control text-xs font-semibold transition-colors ${
                    prefs.restTimerDefault === s ? 'bg-ink text-bg' : 'bg-elevated text-muted hover:bg-line'
                  }`}>
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          </div>
          <Row label="Dark mode" sub="Switch between light and dark theme">
            <button
              onClick={() => update({ darkMode: !prefs.darkMode })}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${prefs.darkMode ? 'bg-brand' : 'bg-line'}`}
              aria-label="Toggle dark mode"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full shadow transition-transform ${prefs.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </Row>
        </Group>

        <Group title="Data">
          <Row label="Export data" sub="Download all sessions as CSV">
            <button onClick={handleExport}
              className="px-4 py-2 rounded-control bg-elevated hover:bg-line text-ink text-sm font-semibold transition-colors shrink-0">
              Export CSV
            </button>
          </Row>
        </Group>

        <Group title="Programs">
          <div className="px-4 py-3.5">
            <p className="text-ink text-sm font-medium mb-0.5">Reset progress</p>
            <p className="text-faint text-xs mb-3">Sets a program back to session 1 — this can't be undone.</p>
            <div className="space-y-2.5">
              {FOG_PROGRAMS.map(program => {
                const progress = programProgress[program.id] ?? 0
                const total = flattenFogProgram(program).length
                return (
                  <div key={program.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{program.name}</p>
                      <p className="text-xs font-mono text-faint">{progress}/{total} sessions</p>
                    </div>
                    {confirmReset === program.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={async () => {
                            await resetFogProgram(program.id)
                            setProgramProgress(p => ({ ...p, [program.id]: 0 }))
                            setConfirmReset(null)
                          }}
                          className="px-3 py-1.5 rounded-control text-xs font-bold bg-danger text-white transition-colors"
                        >
                          Reset
                        </button>
                        <button onClick={() => setConfirmReset(null)}
                          className="px-3 py-1.5 rounded-control text-xs font-semibold bg-elevated text-muted hover:bg-line transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={progress === 0}
                        onClick={() => setConfirmReset(program.id)}
                        className="px-3 py-1.5 rounded-control text-xs font-semibold text-danger disabled:text-faint disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Group>

        <Group title="Account">
          <Row label={user ? (user.email ?? 'Signed in') : 'Not signed in'} sub={user ? 'Synced to the cloud' : 'Sign in to sync your training'}>
            {user ? (
              <button onClick={async () => { await signOut(auth); navigate('/login') }}
                className="px-4 py-2 rounded-control bg-elevated hover:bg-line text-ink text-sm font-semibold transition-colors shrink-0">
                Sign out
              </button>
            ) : (
              <button onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-control bg-brand text-brand-ink text-sm font-bold transition-colors shrink-0">
                Sign in
              </button>
            )}
          </Row>
        </Group>
      </div>
    </div>
  )
}
