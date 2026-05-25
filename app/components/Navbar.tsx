'use client'
import Link from 'next/link'

type Page = 'home' | 'map' | 'capsules' | 'guide' | 'account'

export default function Navbar({ active }: { active: Page }) {
  const leftItems = [
    { key: 'map', label: 'Map', href: '/map' },
    { key: 'capsules', label: 'Capsules', href: '/capsules' },
  ]
  const rightItems = [
    { key: 'guide', label: 'Guide', href: '/guide' },
    { key: 'account', label: 'Account', href: '/account' },
  ]

  const NavItem = ({ item }: { item: { key: string; label: string; href: string } }) => {
    const isActive = active === item.key
    return (
      <Link
        href={item.href}
        className="nav-item flex flex-col items-center py-2 gap-1"
      >
        <span style={{
          color: isActive ? '#c9a96e' : '#4a5068',
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 300,
          textShadow: isActive ? '0 0 12px rgba(201,169,110,0.4)' : 'none',
          transition: 'color 0.2s ease',
        }}>
          {item.label}
        </span>
        <span style={{
          width: isActive ? '4px' : '0px',
          height: isActive ? '4px' : '0px',
          background: '#c9a96e',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          opacity: isActive ? 1 : 0,
          display: 'block',
        }} />
      </Link>
    )
  }

  return (
    <>
      <style>{`
        .nav-item { transition: opacity 0.15s ease, transform 0.15s ease; }
        .nav-item:active { opacity: 0.5; transform: scale(0.88); }
        .nav-center:active { transform: scale(0.88); }
      `}</style>
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{borderTop:'1px solid #1e2438', background:'#0a0e1a'}}>
        <div className="grid grid-cols-5 text-center items-center">
          {leftItems.map(item => <NavItem key={item.key} item={item} />)}

          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="nav-center w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200"
              style={{
                border: '1px solid #c9a96e',
                background: active === 'home' ? '#c9a96e' : 'transparent',
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{background: active === 'home' ? '#0a0e1a' : '#c9a96e'}} />
            </Link>
          </div>

          {rightItems.map(item => <NavItem key={item.key} item={item} />)}
        </div>
      </div>
    </>
  )
}
