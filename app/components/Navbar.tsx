'use client'

export default function Navbar({ active }: { active: 'home' | 'map' | 'capsules' | 'guide' | 'account' }) {
  const items = [
    { key: 'map', label: 'Map', href: '/map' },
    { key: 'capsules', label: 'Capsules', href: '/capsules' },
    { key: 'guide', label: 'Guide', href: '/guide' },
    { key: 'account', label: 'Account', href: '/account' },
  ]

  return (
    <div className="border-t border-gray-900 px-8 py-5">
      <div className="grid grid-cols-4 text-center">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => window.location.href = item.href}
            className={`flex flex-col items-center py-1 transition-colors ${
              active === item.key 
                ? 'text-white' 
                : 'text-gray-700 hover:text-gray-400'
            }`}
          >
            <span className={`text-[10px] tracking-[0.15em] uppercase ${active === item.key ? 'text-white' : 'text-gray-700'}`}>
              {item.label}
            </span>
            {active === item.key && (
              <span className="w-1 h-1 rounded-full bg-white mt-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}