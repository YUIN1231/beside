'use client'
import { useState } from 'react'

export default function Navbar({ active }: { active: 'home' | 'map' | 'capsules' | 'guide' | 'account' }) {
  const [pressed, setPressed] = useState<string | null>(null)

  const leftItems = [
    { key: 'map', label: 'Map', href: '/map' },
    { key: 'capsules', label: 'Capsules', href: '/capsules' },
  ]

  const rightItems = [
    { key: 'guide', label: 'Guide', href: '/guide' },
    { key: 'account', label: 'Account', href: '/account' },
  ]

  const NavItem = ({ item }: { item: { key: string, label: string, href: string } }) => {
    const isActive = active === item.key
    const isPressed = pressed === item.key
    return (
      <button
        onMouseDown={() => setPressed(item.key)}
        onMouseUp={() => setPressed(null)}
        onTouchStart={() => setPressed(item.key)}
        onTouchEnd={() => { setPressed(null); window.location.href = item.href }}
        onClick={() => window.location.href = item.href}
        className="flex flex-col items-center py-2 gap-1"
        style={{
          transform: isPressed ? 'scale(0.85)' : 'scale(1)',
          transition: 'transform 0.15s ease, opacity 0.15s ease',
          opacity: isPressed ? 0.6 : 1,
        }}
      >
        <span className="text-xs tracking-widest uppercase font-light" style={{
          color: isActive ? '#c9a96e' : '#4a5068',
          transition: 'color 0.2s ease',
          textShadow: isActive ? '0 0 12px rgba(201,169,110,0.4)' : 'none',
        }}>
          {item.label}
        </span>
        <span className="rounded-full" style={{
          width: isActive ? '4px' : '0px',
          height: isActive ? '4px' : '0px',
          background: '#c9a96e',
          transition: 'all 0.3s ease',
          opacity: isActive ? 1 : 0,
        }} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{borderTop:'1px solid #1e2438', background:'#0a0e1a'}}>
      <div className="grid grid-cols-5 text-center items-center">
        {leftItems.map(item => <NavItem key={item.key} item={item} />)}

        {/* 真ん中のカプセルボタン */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => window.location.href = '/'}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              border: '1px solid #c9a96e',
              background: active === 'home' ? '#c9a96e' : 'transparent',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{background: active === 'home' ? '#0a0e1a' : '#c9a96e'}} />
          </button>
        </div>

        {rightItems.map(item => <NavItem key={item.key} item={item} />)}
      </div>
    </div>
  )
}