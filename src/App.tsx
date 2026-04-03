import { Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { NewSession } from './pages/NewSession'
import { History } from './pages/History'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'

const SHELL_ROUTES = ['/', '/history', '/statistics', '/settings']

export function App() {
  const { pathname } = useLocation()
  const showNav = SHELL_ROUTES.includes(pathname) || (pathname.startsWith('/session/') && pathname !== '/session/new')

  return (
    <div className="min-h-screen bg-stone-50">
      <main className={showNav ? 'pb-20' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session/new" element={<NewSession />} />
          <Route path="/history" element={<History />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
