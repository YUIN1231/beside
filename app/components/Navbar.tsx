'use client'
import Link from 'next/link'

type Page = 'home' | 'map' | 'capsules' | 'guide' | 'account'

const C_ON  = '#C4422A'
const C_OFF = 'rgba(30, 26, 20, 0.28)'
const SW = 1.8

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={active ? C_ON : 'none'}
        stroke={active ? 'none' : C_OFF}
        strokeWidth={SW} strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5"
        fill={active ? '#F5F0E8' : 'none'}
        stroke={active ? 'none' : C_OFF}
        strokeWidth={SW}
      />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {[
        [3, 3], [13, 3], [3, 13], [13, 13]
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="2.5"
          fill={active ? C_ON : 'none'}
          stroke={active ? 'none' : C_OFF}
          strokeWidth={SW}
        />
      ))}
    </svg>
  )
}

function CompassIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9"
        stroke={active ? C_ON : C_OFF} strokeWidth={SW} />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        fill={active ? C_ON : 'none'}
        stroke={active ? 'none' : C_OFF}
        strokeWidth={SW} strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5"
        fill={active ? '#F5F0E8' : C_OFF} />
    </svg>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4"
        fill={active ? C_ON : 'none'}
        stroke={active ? 'none' : C_OFF}
        strokeWidth={SW}
      />
      <path d="M4 20c0-4 3.58-6 8-6s8 2 8 6"
        stroke={active ? C_ON : C_OFF}
        strokeWidth={SW} strokeLinecap="round" fill="none"
      />
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

  const tabStyle = (isActive: boolean) => ({
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    padding: '10px 0', gap: '5px',
    filter: isActive ? 'drop-shadow(0 0 4px rgba(196,66,42,0.35))' : 'none',
    transition: 'filter 0.3s ease',
  })

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(245, 240, 232, 0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(30, 26, 20, 0.10)',
        boxShadow: '0 -1px 0 rgba(30,26,20,0.07), 0 -6px 24px rgba(30,26,20,0.04)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-5 items-center px-1">

        {left.map(({ key, href, Icon }) => (
          <Link key={key} href={href} style={tabStyle(active === key)}>
            <Icon active={active === key} />
            <div style={{
              width: '3px', height: '3px', borderRadius: '50%',
              background: active === key ? C_ON : 'transparent',
              boxShadow: active === key ? `0 0 5px ${C_ON}` : 'none',
              transition: 'all 0.3s',
            }} />
          </Link>
        ))}

        {/* centre capsule button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
          <Link
            href="/"
            style={{
              width: '52px', height: '52px',
              borderRadius: '50%',
              background: active === 'home'
                ? '#C4422A'
                : 'rgba(30, 26, 20, 0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active === 'home'
                ? '0 4px 20px rgba(196,66,42,0.28), 0 1px 4px rgba(0,0,0,0.08)'
                : '0 1px 4px rgba(30,26,20,0.07)',
              border: active === 'home' ? 'none' : '1px solid rgba(30,26,20,0.10)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{
              width: '14px', height: '24px', borderRadius: '8px',
              background: active === 'home'
                ? 'linear-gradient(180deg, rgba(245,240,232,0.22) 0%, rgba(245,240,232,0.08) 100%)'
                : 'linear-gradient(180deg, rgba(30,26,20,0.07) 0%, rgba(30,26,20,0.02) 100%)',
              border: `1.5px solid ${active === 'home' ? 'rgba(245,240,232,0.55)' : 'rgba(30,26,20,0.22)'}`,
              boxShadow: active === 'home'
                ? 'inset 0 1px 0 rgba(255,255,255,0.12)'
                : 'inset 0 1px 0 rgba(255,255,255,0.55)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '46%', left: '2px', right: '2px',
                height: '1px',
                background: active === 'home' ? 'rgba(245,240,232,0.35)' : 'rgba(30,26,20,0.16)',
              }} />
            </div>
          </Link>
        </div>

        {right.map(({ key, href, Icon }) => (
          <Link key={key} href={href} style={tabStyle(active === key)}>
            <Icon active={active === key} />
            <div style={{
              width: '3px', height: '3px', borderRadius: '50%',
              background: active === key ? C_ON : 'transparent',
              boxShadow: active === key ? `0 0 5px ${C_ON}` : 'none',
              transition: 'all 0.3s',
            }} />
          </Link>
        ))}

      </div>
    </div>
  )
}
