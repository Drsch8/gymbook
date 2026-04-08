import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
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
import { syncFromFirebase, clearLocalData } from './db'

const SHELL_ROUTES = ['/', '/classes', '/recent', '/history', '/statistics', '/settings']

export function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showNav = SHELL_ROUTES.includes(pathname) || pathname.startsWith('/session/')
  const syncedRef = useRef(false)
  const [authReady, setAuthReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthed(!!user)
      setAuthReady(true)

      if (user && !syncedRef.current) {
        syncedRef.current = true
        syncFromFirebase(user.uid, true).catch(console.error)
        if (pathname === '/login') navigate('/')
      }
      if (!user) {
        syncedRef.current = false
        clearLocalData().catch(console.error)
        if (pathname !== '/login') navigate('/login')
      }
    })
    return unsubscribe
  }, [navigate, pathname])

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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <main className={showNav ? 'pb-20' : ''}>
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
    </div>
  )
}
