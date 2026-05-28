'use client'
import Link from 'next/link'

type Page = 'home' | 'map' | 'capsules' | 'guide' | 'account'

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={active ? 'var(--gold)' : 'none'}
        stroke={active ? 'none' : 'rgba(240,230,208,0.35)'}
        strokeWidth="1.4"
      />
      <circle
        cx="12" cy="9" r="2.5"
        fill={active ? 'var(--bg)' : 'none'}
        stroke={active ? 'none' : 'rgba(240,230,208,0.35)'}
        strokeWidth="1.4"
      />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--gold)' : 'rgba(240,230,208,0.35)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" />
      <rect x="13" y="3" width="8" height="8" rx="2"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" />
      <rect x="3" y="13" width="8" height="8" rx="2"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" />
      <rect x="13" y="13" width="8" height="8" rx="2"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" />
    </svg>
  )
}

function CompassIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--gold)' : 'rgba(240,230,208,0.35)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.4" />
      <path
        d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill={active ? 'var(--bg)' : c} />
    </svg>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--gold)' : 'rgba(240,230,208,0.35)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4"
        fill={active ? 'var(--gold)' : 'none'} stroke={active ? 'none' : c} strokeWidth="1.4" />
      <path d="M4 20c0-4 3.58-6 8-6s8 2 8 6"
        stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Navbar({ active }: { active: Page }) {
  const items = [
    { key: 'map',     href: '/map',     Icon: MapIcon },
    { key: 'capsules',href: '/capsules',Icon: GridIcon },
  ] as const

  const itemsRight = [
    { key: 'guide',   href: '/guide',   Icon: CompassIcon },
    { key: 'account', href: '/account', Icon: PersonIcon },
  ] as const

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,10,5,0.85)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(240,230,208,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-5 items-center px-2 py-2">

        {items.map(({ key, href, Icon }) => (
          <Link key={key} href={href} className="flex flex-col items-center justify-center py-2 gap-1">
            <Icon active={active === key} />
            {active === key && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} />
            )}
          </Link>
        ))}

        {/* centre — always goes to capsule create */}
        <div className="flex items-center justify-center py-1">
          <Link
            href="/"
            style={{
              width: '50px', height: '50px',
              borderRadius: '50%',
              background: active === 'home'
                ? 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 50%, #7a5428 100%)'
                : 'rgba(240,230,208,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active === 'home' ? '0 0 20px rgba(201,169,110,0.25)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* pill icon */}
            <div style={{
              width: '14px', height: '24px', borderRadius: '8px',
              border: `1.5px solid ${active === 'home' ? 'rgba(15,10,5,0.7)' : 'rgba(240,230,208,0.4)'}`,
              position: 'relative', overflow: 'hidden',
              background: active === 'home' ? 'rgba(15,10,5,0.15)' : 'transparent',
            }}>
              <div style={{
                position: 'absolute', top: '46%', left: 0, right: 0,
                height: '1px',
                background: active === 'home' ? 'rgba(15,10,5,0.5)' : 'rgba(240,230,208,0.25)',
              }} />
            </div>
          </Link>
        </div>

        {itemsRight.map(({ key, href, Icon }) => (
          <Link key={key} href={href} className="flex flex-col items-center justify-center py-2 gap-1">
            <Icon active={active === key} />
            {active === key && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)' }} />
            )}
          </Link>
        ))}

      </div>
    </div>
  )
}
