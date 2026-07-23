import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

type Mode = 'signin' | 'signup' | 'reset' | 'verify'

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':    return 'Incorrect email or password.'
    case 'auth/email-already-in-use': return 'This email is already registered.'
    case 'auth/weak-password':     return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':     return 'Invalid email address.'
    case 'auth/too-many-requests': return 'Too many attempts. Please wait and try again.'
    case 'auth/unverified-email':  return 'Email not yet verified. Please check your inbox.'
    default:                       return `Error: ${code}`
  }
}

const FIELD = 'w-full bg-elevated border border-line rounded-card px-4 h-12 text-sm text-ink outline-none focus:border-brand placeholder:text-faint transition-colors'
const LABEL = 'block text-[11px] font-bold font-body text-muted uppercase tracking-wider mb-1.5'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
        if (!user.emailVerified) {
          await signOut(auth)
          setError(errorMessage('auth/unverified-email'))
          return
        }
        navigate('/')
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await sendEmailVerification(user)
        await signOut(auth)
        switchMode('verify')
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(errorMessage(code))
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send link'

  return (
    <div className="dark min-h-screen bg-bg flex flex-col px-6 pt-safe">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center pb-16 pt-24">
        <h1 className="font-display text-[26px] font-bold text-ink -tracking-wide mb-1">GymBook</h1>
        <p className="text-muted text-[13px] mb-9">Sign in to sync your training.</p>

        {mode === 'verify' || resetSent ? (
          <div className="bg-surface border border-line rounded-panel p-6">
            <p className="text-[11px] font-bold font-body text-pr uppercase tracking-wider mb-1.5">
              {mode === 'verify' ? 'Verify your email' : 'Reset link sent'}
            </p>
            <p className="text-muted text-[13px] leading-relaxed mb-4">
              We sent a link to <span className="text-ink font-medium">{email}</span>.{' '}
              {mode === 'verify'
                ? "Once verified you'll drop straight into your program — nothing to redo."
                : 'Follow the link to set a new password.'}
            </p>
            <button onClick={() => switchMode('signin')} className="text-brand text-[13px] font-semibold">
              ← Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={LABEL}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com" required autoCapitalize="none" autoCorrect="off"
                style={{ fontSize: '16px' }} className={FIELD}
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className={LABEL}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    style={{ fontSize: '16px' }} className={`${FIELD} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-danger text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-brand text-brand-ink font-bold rounded-card text-[14.5px] disabled:opacity-50 transition-opacity">
              {loading ? '…' : title}
            </button>
          </form>
        )}

        {!resetSent && mode !== 'verify' && (
          <p className="text-center text-[12.5px] text-muted mt-6">
            {mode === 'signin' && <>
              No account? <button onClick={() => switchMode('signup')} className="text-brand font-semibold">Create one</button>
              {' · '}
              <button onClick={() => switchMode('reset')} className="text-faint">Forgot password</button>
            </>}
            {mode === 'signup' && <>
              Already registered? <button onClick={() => switchMode('signin')} className="text-brand font-semibold">Sign in</button>
            </>}
            {mode === 'reset' && (
              <button onClick={() => switchMode('signin')} className="text-brand font-semibold">← Back to sign in</button>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
