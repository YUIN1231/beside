'use client'
import Link from 'next/link'

type Page = 'home' | 'map' | 'capsules' | 'guide' | 'account'

const ON  = 'var(--gold)'
const OFF = 'rgba(26, 20, 16, 0.25)'
const SW  = 1.4

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke={active ? ON : OFF} strokeWidth={SW} strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="9" r="2.2" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
    </svg>
  )
}

function CompassIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={active ? ON : OFF} strokeWidth={SW} />
      <path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5 5.5-2z"
        stroke={active ? ON : OFF} strokeWidth={SW} strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7.5" r="3.5" stroke={active ? ON : OFF} strokeWidth={SW} fill="none" />
      <path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5"
        stroke={active ? ON : OFF} strokeWidth={SW} strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Navbar({ active }: { active: Page }) {
  const left  = [
    { key: 'map',      href: '/map',      Icon: MapIcon },
    { key: 'capsules', href: '/capsules', Icon: GridIcon },
  ] as const
  const right = [
    { key: 'guide',   href: '/guide',   Icon: CompassIcon },
    { key: 'account', href: '/account', Icon: PersonIcon },
  ] as const

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(232, 221, 208, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(26, 20, 16, 0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-5 items-center">

        {left.map(({ key, href, Icon }) => (
          <Link key={key} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: '14px', paddingBottom: '12px', gap: '5px',
          }}>
            <Icon active={active === key} />
            {active === key && (
              <div style={{ width: '16px', height: '1px', background: 'var(--gold)', opacity: 0.7 }} />
            )}
          </Link>
        ))}

        {/* centre — pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
          <Link href="/" style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: active === 'home' ? 'var(--gold)' : 'rgba(26, 20, 16, 0.06)',
            border: active === 'home' ? 'none' : '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.25s ease',
          }}>
            <div style={{
              width: '12px', height: '20px', borderRadius: '7px',
              border: `1.5px solid ${active === 'home' ? 'rgba(232,221,208,0.6)' : 'var(--border-2)'}`,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '46%', left: '1px', right: '1px',
                height: '1px',
                background: active === 'home' ? 'rgba(232,221,208,0.4)' : 'var(--border-2)',
              }} />
            </div>
          </Link>
        </div>

        {right.map(({ key, href, Icon }) => (
          <Link key={key} href={href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: '14px', paddingBottom: '12px', gap: '5px',
          }}>
            <Icon active={active === key} />
            {active === key && (
              <div style={{ width: '16px', height: '1px', background: 'var(--gold)', opacity: 0.7 }} />
            )}
          </Link>
        ))}

      </div>
    </nav>
  )
}
