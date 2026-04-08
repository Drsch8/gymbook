import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      navigate('/')
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(
        code === 'auth/invalid-credential'   ? 'E-Mail oder Passwort falsch.' :
        code === 'auth/email-already-in-use' ? 'Diese E-Mail ist bereits registriert.' :
        code === 'auth/weak-password'        ? 'Passwort muss mindestens 6 Zeichen haben.' :
        (err as Error).message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-stone-100 mb-2">GymBook</h1>
        <p className="text-stone-400 text-sm mb-10">Dein persönliches Trainingsbuch</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-400 text-xs mb-1.5 uppercase tracking-wide">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="du@beispiel.de"
              required
              className="w-full bg-stone-800 text-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-500 placeholder:text-stone-600"
            />
          </div>

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

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-100 text-stone-900 font-semibold rounded-xl py-3 text-sm disabled:opacity-50">
            {loading ? '…' : mode === 'signin' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null) }}
          className="mt-4 w-full text-stone-500 text-sm py-2">
          {mode === 'signin' ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-1 w-full text-stone-600 text-xs py-2">
          Ohne Konto fortfahren
        </button>
      </div>
    </div>
  )
}
