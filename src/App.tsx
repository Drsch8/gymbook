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

export function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showNav = SHELL_ROUTES.includes(pathname) || pathname.startsWith('/session/')
  const syncedRef = useRef(false)
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
    const reset = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => signOut(auth).catch(console.error), INACTIVITY_MS)
    }
    const events = ['touchstart', 'mousedown', 'keydown'] as const
    events.forEach(ev => document.addEventListener(ev, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timeout)
      events.forEach(ev => document.removeEventListener(ev, reset))
    }
  }, [authed])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
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
