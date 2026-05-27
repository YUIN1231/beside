'use client'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getUser, getCapsules } from '../lib/storage'
import type { User, Capsule, Member } from '../lib/types'

export default function Account() {
  const [user, setUser]       = useState<User | null>(null)
  const [capsules, setCapsules] = useState<Capsule[]>([])

  useEffect(() => {
    setUser(getUser())
    setCapsules(getCapsules())
  }, [])

  /* all unique members across all capsules */
  const connections: (Member & { city: string; date: string })[] = []
  const seen = new Set<string>()
  capsules.forEach(c => {
    c.members.forEach(m => {
      const key = m.email ?? m.name
      if (!seen.has(key)) {
        seen.add(key)
        connections.push({ ...m, city: c.city, date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })
      }
    })
  })

  return (
    <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8" />
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-8">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: 'var(--gold-dim)' }}>Account</p>

        {/* profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg" style={{
            border: '1px solid var(--border-2)', color: 'var(--gold)', fontFamily: 'var(--font-fraunces)',
          }}>
            {user?.name?.[0]?.toUpperCase() ?? 'Y'}
          </div>
          <div>
            <p className="font-light text-base">{user?.name ?? 'Traveller'}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{user?.email ?? '—'}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              {capsules.length} capsule{capsules.length !== 1 ? 's' : ''} · {connections.length} connection{connections.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }} />

        {/* connections */}
        <div className="mb-2 flex items-end justify-between">
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-2)' }}>Connections</p>
          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>met in person only</p>
        </div>

        {connections.length === 0 ? (
          <p className="text-sm mt-4 mb-8" style={{ color: 'var(--text-3)' }}>No connections yet. Take a capsule with someone.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-8">
            {connections.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'var(--border-2)', color: 'var(--gold)' }}>
                  {c.initial}
                </div>
                <div>
                  <p className="text-sm font-light">{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Met in {c.city} · {c.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '8px' }} />

        {[
          { label: 'Notifications', sub: 'When beside reaches you' },
          { label: 'Privacy', sub: 'Who can tag you in capsules' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-light">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{item.sub}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="var(--text-3)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
        ))}

        <div className="py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--gold)' }}>Sign out</p>
        </div>
        <div className="py-4">
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Delete account</p>
        </div>
      </div>

      <Navbar active="account" />
    </main>
  )
}
