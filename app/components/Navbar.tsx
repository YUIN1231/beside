'use client'
import Link from 'next/link'

type Page = 'home' | 'map' | 'capsules' | 'guide' | 'account'

export default function Navbar({ active }: { active: Page }) {
  const left  = [{ key: 'map', label: 'Map', href: '/map' }, { key: 'capsules', label: 'Capsules', href: '/capsules' }]
  const right = [{ key: 'guide', label: 'Guide', href: '/guide' }, { key: 'account', label: 'Account', href: '/account' }]

  const Item = ({ item }: { item: { key: string; label: string; href: string } }) => {
    const on = active === item.key
    return (
      <Link href={item.href} className="nav-item flex flex-col items-center py-2 gap-1.5">
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: on ? 'var(--gold)' : 'var(--text-2)',
          textShadow: on ? '0 0 12px rgba(201,169,110,0.45)' : 'none',
          transition: 'all 0.2s',
        }}>{item.label}</span>
        <div style={{
          width: on ? '16px' : '3px',
          height: '1px',
          background: on ? 'var(--gold)' : 'transparent',
          boxShadow: on ? '0 0 6px rgba(201,169,110,0.5)' : 'none',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: '1px',
        }} />
      </Link>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{
      borderTop: '1px solid var(--border)',
      background: 'rgba(26,16,8,0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div className="grid grid-cols-5 items-center px-4 py-3">
        {left.map(item => <Item key={item.key} item={item} />)}

        {/* centre — always goes to home (capsule create) */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="nav-center flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: '46px', height: '46px',
              border: active === 'home' ? '1px solid var(--gold)' : '1px solid var(--border-2)',
              background: active === 'home'
                ? 'linear-gradient(145deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.06) 100%)'
                : 'var(--surface)',
              boxShadow: active === 'home' ? '0 0 18px rgba(201,169,110,0.14)' : 'none',
            }}
          >
            {/* pill icon */}
            <div style={{
              width: '13px', height: '22px',
              borderRadius: '7px',
              border: '1px solid ' + (active === 'home' ? 'var(--gold)' : 'var(--text-3)'),
              position: 'relative', overflow: 'hidden',
              background: active === 'home' ? 'rgba(201,169,110,0.1)' : 'transparent',
            }}>
              <div style={{
                position: 'absolute', top: '46%', left: 0, right: 0,
                height: '1px',
                background: active === 'home' ? 'var(--gold-dim)' : 'var(--border-2)',
              }} />
            </div>
          </Link>
        </div>

        {right.map(item => <Item key={item.key} item={item} />)}
      </div>
    </div>
  )
}
