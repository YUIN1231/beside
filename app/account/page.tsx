'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { getUser, getCapsules, signOut } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
import type { User, Capsule, Member } from '../lib/types'

export default function Account() {
  useRequireAuth()
  const router = useRouter()
  const [user, setUser]       = useState<User | null>(null)
  const [capsules, setCapsules] = useState<Capsule[]>([])

  useEffect(() => {
    setUser(getUser())
    setCapsules(getCapsules())
  }, [])

  const connections: (Member & { city: string; date: string })[] = []
  const seen = new Set<string>()
  capsules.forEach(c => {
    c.members.forEach(m => {
      const key = m.email ?? m.name
      if (!seen.has(key)) {
        seen.add(key)
        connections.push({
          ...m,
          city: c.city,
          date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })
      }
    })
  })

  const initial = user?.name?.[0]?.toUpperCase() ?? 'Y'

  return (
    <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="w-8" />
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-space)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      {/* ── Profile ── */}
      <div className="flex flex-col items-center px-6 pt-6 pb-8">
        <div className="story-ring mb-4" style={{ width: '88px', height: '88px' }}>
          <div className="story-ring-inner" style={{ width: '83px', height: '83px' }}>
            <div style={{
              width: '77px', height: '77px', borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontFamily: 'var(--font-space)',
              color: 'var(--gold)',
            }}>{initial}</div>
          </div>
        </div>

        <p className="text-base font-medium mb-0.5">{user?.name ?? 'Traveller'}</p>
        {user?.email && (
          <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>{user.email}</p>
        )}

        {/* stats */}
        <div className="flex gap-10 mt-2">
          {[
            { value: capsules.length,    label: 'capsules' },
            { value: connections.length, label: 'connections' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-10">
              {i > 0 && <div style={{ width: '1px', height: '28px', background: 'rgba(30,26,20,0.07)' }} />}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-medium" style={{ fontFamily: 'var(--font-space)' }}>{s.value}</span>
                <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-3)' }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Connections ── */}
      <div style={{ borderTop: '1px solid rgba(30,26,20,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: 'var(--text-2)' }}>Connections</p>
          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>met in person only</p>
        </div>

        {connections.length === 0 ? (
          <p className="px-6 pb-6 text-sm" style={{ color: 'var(--text-3)' }}>
            No connections yet. Take a capsule with someone.
          </p>
        ) : (
          <div className="px-5 pb-4 flex flex-col gap-2">
            {connections.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{
                background: 'linear-gradient(180deg, rgba(30,26,20,0.07) 0%, rgba(30,26,20,0.025) 100%)',
                border: '1px solid rgba(30,26,20,0.1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(30,26,20,0.06)',
              }}>
                <div className="story-ring-dim flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                  <div className="story-ring-dim-inner" style={{ width: '39px', height: '39px' }}>
                    <div style={{
                      width: '33px', height: '33px', borderRadius: '50%',
                      background: 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', color: 'var(--gold)', fontFamily: 'var(--font-space)',
                    }}>{c.initial}</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{c.city} · {c.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Settings ── */}
      <div className="px-5 mt-2" style={{ borderTop: '1px solid rgba(30,26,20,0.06)' }}>
        {[
          { label: 'Notifications', sub: 'When beside reaches you' },
          { label: 'Privacy', sub: 'Who can tag you in capsules' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-5" style={{ borderBottom: '1px solid rgba(30,26,20,0.05)' }}>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{item.sub}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="rgba(30,26,20,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
        <a
          href="https://beside-gules.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between py-5"
          style={{ borderBottom: '1px solid var(--border)', display: 'flex' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--gold)' }}>Share beside</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gold-dim)' }}>beside-gules.vercel.app</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <button className="w-full text-left py-5" style={{ borderBottom: '1px solid rgba(30,26,20,0.05)' }}
          onClick={() => { signOut(); router.replace('/auth') }}>
          <p className="text-sm font-medium" style={{ color: 'var(--gold)' }}>Sign out</p>
        </button>
        <div className="py-5">
          <p className="text-xs" style={{ color: 'rgba(30,26,20,0.18)' }}>Delete account</p>
        </div>
      </div>

      <Navbar active="account" />
    </main>
  )
}
