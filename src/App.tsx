import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Classes } from './pages/Classes'
import { NewSession } from './pages/NewSession'
import { SessionDetail } from './pages/SessionDetail'
import { History } from './pages/History'
import { Recent } from './pages/Recent'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { auth } from './lib/firebase'
import { syncFromFirebase } from './db'

const SHELL_ROUTES = ['/', '/classes', '/recent', '/history', '/statistics', '/settings']
const INACTIVITY_MS = 60 * 60 * 1000 // 60 minutes
const LAST_ACTIVE_KEY = 'gymbook_last_active'
// sessionStorage survives reloads + backgrounding but is wiped when the app is
// fully closed, so its absence on a cold start means "reopened after a close".
const SESSION_KEY = 'gymbook_session_alive'

export function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showNav = SHELL_ROUTES.includes(pathname) || pathname.startsWith('/session/')
  const syncedRef = useRef(false)
  const firstAuthRef = useRef(true)
  const [authReady, setAuthReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [wellDone, setWellDone] = useState(false)
  const [wellDoneFade, setWellDoneFade] = useState(false)

  useEffect(() => {
    const handler = () => {
      setWellDone(true)
      setWellDoneFade(false)
      setTimeout(() => setWellDoneFade(true), 900)
      setTimeout(() => setWellDone(false), 1700)
    }
    window.addEventListener('wellDone', handler)
    return () => window.removeEventListener('wellDone', handler)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      const verified = !!user && user.emailVerified
      const firstResolve = firstAuthRef.current
      firstAuthRef.current = false

      // Log out on app close: on the first (cold-start) callback, a restored
      // session with no live marker means the app was reopened after a full
      // close — sign out. Reloads and backgrounding keep the marker, so they
      // stay signed in (subject to the idle window below).
      if (verified && firstResolve && !sessionStorage.getItem(SESSION_KEY)) {
        signOut(auth).catch(console.error)
        setAuthReady(true)
        return
      }

      if (verified) {
        sessionStorage.setItem(SESSION_KEY, '1')
        // A fresh sign-in (not the cold-start restore) starts a new idle window.
        // On restore we keep the persisted deadline so an idle period that
        // elapsed while the app was open still triggers an auto sign-out.
        if (!firstResolve) localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
      }

      setAuthed(verified)
      setAuthReady(true)

      if (verified && !syncedRef.current) {
        syncedRef.current = true
        // Only wipe local data when a DIFFERENT account logs in. For the same
        // account we merge instead, so sessions that never reached the cloud
        // (e.g. saved offline before an auto sign-out) are pushed up, not lost.
        const lastUid = localStorage.getItem('gymbook_last_uid')
        const sameUser = lastUid === user!.uid
        localStorage.setItem('gymbook_last_uid', user!.uid)
        syncFromFirebase(user!.uid, !sameUser).catch(console.error)
        if (pathname === '/login') navigate('/')
      }
      if (!verified) {
        syncedRef.current = false
        // Keep local data on sign-out — it belongs to the last signed-in user
        // and is merged back to the cloud on next login. Wiping here destroyed
        // any session whose cloud write hadn't completed yet.
        if (pathname !== '/login') navigate('/login')
      }
    })
    return unsubscribe
  }, [navigate, pathname])

  useEffect(() => {
    if (!authed) return
    let timeout: ReturnType<typeof setTimeout>

    const doSignOut = () => signOut(auth).catch(console.error)

    // Schedule sign-out for whatever remains of the inactivity window, derived
    // from the persisted last-active time. On (re)mount we do NOT reset the
    // clock, so a deadline that already elapsed while the app was closed signs
    // the user out immediately.
    const schedule = () => {
      clearTimeout(timeout)
      const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) ?? Date.now())
      const remaining = INACTIVITY_MS - (Date.now() - last)
      if (remaining <= 0) {
        doSignOut()
        return
      }
      timeout = setTimeout(doSignOut, remaining)
    }

    const reset = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()))
      schedule()
    }

    const events = ['touchstart', 'mousedown', 'keydown'] as const
    events.forEach(ev => document.addEventListener(ev, reset, { passive: true }))
    schedule()

    return () => {
      clearTimeout(timeout)
      events.forEach(ev => document.removeEventListener(ev, reset))
    }
  }, [authed])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Check inactivity first — setTimeout may have been frozen while backgrounded
        const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) ?? Date.now())
        if (Date.now() - last >= INACTIVITY_MS) {
          signOut(auth).catch(console.error)
          return
        }
        const user = auth.currentUser
        if (user) syncFromFirebase(user.uid).catch(console.error)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (!authReady) {
    return <div className="min-h-screen bg-stone-50 dark:bg-stone-900" />
  }

  return (
    <div className="h-dvh flex flex-col bg-stone-50 dark:bg-stone-900">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          {authed && <>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/session/new" element={<NewSession />} />
            <Route path="/session/:id" element={<SessionDetail />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
          </>}
        </Routes>
      </main>
      {showNav && authed && <BottomNav />}
      {wellDone && (
        <div className={`fixed inset-0 z-[300] flex items-center justify-center bg-stone-950 transition-opacity duration-700 pointer-events-none ${wellDoneFade ? 'opacity-0' : 'opacity-100'}`}>
          <div className="text-center animate-scaleIn">
            <p className="text-5xl font-black text-stone-100 mb-2">Well done!</p>
          </div>
        </div>
      )}
    </div>
  )
}
