import { NavLink } from 'react-router-dom'

// Primary navigation. Renders as a bottom tab bar on phones and as a left side
// rail from `md` up, so the app doesn't stretch a 4-item bar across a desktop
// window. Both forms share this one tab list and the same active styling.

const ICON = 'w-6 h-6 md:w-[18px] md:h-[18px] shrink-0'

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={ICON}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'Calendar',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={ICON}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/statistics',
    label: 'Stats',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={ICON}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className={ICON}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function AppNav() {
  return (
    <nav
      className="shrink-0 bg-surface border-t border-line pb-safe
                 md:order-first md:w-[230px] md:flex md:flex-col md:border-t-0 md:border-r md:pb-0 md:pt-safe"
    >
      <div className="hidden md:block px-5 pt-6 pb-5">
        <p className="font-display text-[19px] font-bold text-ink -tracking-wide">GymBook</p>
      </div>

      <div className="flex md:flex-col md:gap-0.5 md:px-3">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex items-center transition-colors
               flex-1 flex-col justify-center py-2 gap-0.5 text-[10px] font-bold font-body uppercase tracking-wide
               md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2.5 md:rounded-card
               md:text-[13px] md:normal-case md:tracking-normal md:font-semibold ${
                 isActive
                   ? 'text-brand md:bg-elevated'
                   : 'text-faint hover:text-muted md:hover:bg-elevated'
               }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
