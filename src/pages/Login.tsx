import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

type Mode = 'signin' | 'signup' | 'reset'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':    return 'E-Mail oder Passwort falsch.'
    case 'auth/email-already-in-use': return 'Diese E-Mail ist bereits registriert.'
    case 'auth/weak-password':     return 'Passwort muss mindestens 6 Zeichen haben.'
    case 'auth/invalid-email':     return 'Ungültige E-Mail-Adresse.'
    case 'auth/too-many-requests': return 'Zu viele Versuche. Kurz warten und erneut versuchen.'
    default:                       return `Fehler: ${code}`
  }
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const switchMode = (next: Mode) => { setMode(next); setError(null); setResetSent(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email)
        setResetSent(true)
      } else if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
        navigate('/')
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
        navigate('/')
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(errorMessage(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-stone-100 mb-2">GymBook</h1>
        <p className="text-stone-400 text-sm mb-10">Dein persönliches Trainingsbuch</p>

        {resetSent ? (
          <div className="bg-stone-800 rounded-2xl p-6 text-center">
            <p className="text-stone-100 font-medium mb-2">E-Mail gesendet</p>
            <p className="text-stone-400 text-sm mb-4">
              Prüfe dein Postfach für <span className="text-stone-200">{email}</span> und folge dem Link zum Zurücksetzen.
            </p>
            <button onClick={() => switchMode('signin')} className="text-stone-400 text-sm underline">
              Zurück zur Anmeldung
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-400 text-xs mb-1.5 uppercase tracking-wide">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="du@beispiel.de"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-stone-800 text-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-500 placeholder:text-stone-600"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-stone-400 text-xs mb-1.5 uppercase tracking-wide">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-stone-800 text-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-500 placeholder:text-stone-600"
                />
              </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-100 text-stone-900 font-semibold rounded-xl py-3 text-sm disabled:opacity-50">
              {loading ? '…' : mode === 'signin' ? 'Anmelden' : mode === 'signup' ? 'Registrieren' : 'Link senden'}
            </button>
          </form>
        )}

        {!resetSent && (
          <div className="mt-4 flex flex-col items-center gap-1">
            {mode === 'signin' && <>
              <button onClick={() => switchMode('signup')} className="text-stone-500 text-sm py-1">
                Noch kein Konto? Registrieren
              </button>
              <button onClick={() => switchMode('reset')} className="text-stone-600 text-xs py-1">
                Passwort vergessen
              </button>
            </>}
            {mode === 'signup' && (
              <button onClick={() => switchMode('signin')} className="text-stone-500 text-sm py-1">
                Bereits registriert? Anmelden
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => switchMode('signin')} className="text-stone-500 text-sm py-1">
                Zurück zur Anmeldung
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
