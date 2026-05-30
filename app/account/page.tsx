'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { getUser, getCapsules, signOut } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
import type { User, Capsule, Member } from '../lib/types'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '10px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-3)',
}

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

  const initial = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>

      <div style={{ padding: '3.5rem 2rem 0' }}>
        <span style={{ ...LABEL }}>beside</span>
      </div>

      {/* Profile */}
      <div style={{ padding: '3rem 2rem 0', display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontFamily: 'var(--font-display)', fontStyle: 'italic',
          color: 'var(--text-2)',
          marginBottom: '1.25rem',
        }}>{initial}</div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.1,
          marginBottom: '4px',
        }}>{user?.name ?? 'Traveller'}</h2>
        {user?.email && (
          <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-space)' }}>{user.email}</p>
        )}

        {/* stats */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '1.75rem' }}>
          {[
            { value: capsules.length,    label: 'capsules' },
            { value: connections.length, label: 'connections' },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: 'var(--font-space)', fontSize: '22px', fontWeight: 500, lineHeight: 1 }}>{s.value}</p>
              <p style={{ ...LABEL, marginTop: '4px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div style={{ padding: '3rem 2rem 0', borderTop: '1px solid var(--border)', marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <p style={{ ...LABEL }}>Connections</p>
          <p style={{ ...LABEL, fontSize: '9px' }}>met in person only</p>
        </div>

        {connections.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', fontWeight: 300 }}>
            No connections yet. Take a capsule with someone.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {connections.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 0',
                borderBottom: i < connections.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: 'var(--text-2)',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  flexShrink: 0,
                }}>{c.initial}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)', fontWeight: 500 }}>{c.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '2px' }}>{c.city} · {c.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div style={{ padding: '0 2rem', marginTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
        {[
          { label: 'Notifications', sub: 'When beside reaches you' },
          { label: 'Privacy',       sub: 'Who can tag you in capsules' },
        ].map((item, i) => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '2px' }}>{item.sub}</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="var(--border-2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}

        <a
          href="https://beside-gules.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 0',
            borderBottom: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          <div>
            <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)', fontWeight: 500, color: 'var(--gold)' }}>Share beside</p>
            <p style={{ fontSize: '11px', color: 'var(--gold-dim)', fontFamily: 'var(--font-space)', marginTop: '2px' }}>beside-gules.vercel.app</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <button
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', padding: '1.25rem 0',
            borderBottom: '1px solid var(--border)',
          }}
          onClick={() => { signOut(); router.replace('/auth') }}
        >
          <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)', fontWeight: 500, color: 'var(--gold)' }}>Sign out</p>
        </button>

        <div style={{ padding: '1.25rem 0' }}>
          <p style={{ fontSize: '12px', color: 'rgba(26,20,16,0.15)', fontFamily: 'var(--font-space)' }}>Delete account</p>
        </div>
      </div>

      <Navbar active="account" />
    </main>
  )
}
