'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getCapsules } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
import { fetchMyCapsules } from '../lib/supabase'
import type { Capsule } from '../lib/types'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '10px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-3)',
}

function daysUntil(iso?: string) {
  if (!iso) return 0
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Capsules() {
  useRequireAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])

  useEffect(() => {
    setCapsules(getCapsules())
    const stored = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('beside_user') ?? 'null')
      : null
    if (stored?.email) {
      fetchMyCapsules(stored.email).then(remote => {
        if (remote.length > 0) setCapsules(remote)
      }).catch(() => {})
    }
  }, [])

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5rem 2rem 0' }}>
        <span style={{ ...LABEL }}>beside</span>
        <span style={{ ...LABEL }}>{capsules.length} {capsules.length === 1 ? 'capsule' : 'capsules'}</span>
      </div>

      {capsules.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '2rem' }}>
          <div style={{ width: '1px', height: '80px', background: 'var(--border-2)', margin: '0 auto' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'var(--font-space)', fontWeight: 300 }}>
            No capsules yet.
          </p>
          <Link href="/" style={{
            color: 'var(--gold)', fontSize: '1.125rem',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            textDecoration: 'none',
          }}>
            Take your first →
          </Link>
        </div>
      ) : (
        <div style={{ flex: 1, padding: '3rem 2rem 0' }}>
          {capsules.map((c, i) => {
            const days   = daysUntil(c.opensAt)
            const isOpen = !!c.sealedAt && days <= 0
            const isSealed = !!c.sealedAt && days > 0

            return (
              <Link key={c.id} href={`/capsules/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="fade-up" style={{
                  display: 'flex', gap: '24px',
                  paddingBottom: '2.5rem',
                  paddingTop: i > 0 ? '2.5rem' : 0,
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  animationDelay: `${i * 0.05}s`,
                }}>
                  {/* timeline dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '3px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: isOpen ? 'var(--gold)' : 'transparent',
                      border: `1px solid ${isOpen ? 'var(--gold)' : 'var(--border-2)'}`,
                      flexShrink: 0,
                    }} />
                  </div>

                  {/* content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <p style={{
                          fontFamily: 'var(--font-space)',
                          fontSize: '15px',
                          fontWeight: 500,
                          marginBottom: '3px',
                        }}>{c.city}</p>
                        <p style={{ ...LABEL }}>{fmtDate(c.createdAt)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {isOpen && (
                          <span style={{ ...LABEL, color: 'var(--gold)' }}>open</span>
                        )}
                        {isSealed && (
                          <span style={{ ...LABEL }}>{days}d</span>
                        )}
                        {!c.sealedAt && (
                          <span style={{ ...LABEL }}>draft</span>
                        )}
                      </div>
                    </div>

                    {c.members.length > 0 && (
                      <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '6px' }}>
                        +{c.members.length} {c.members.length === 1 ? 'person' : 'people'}
                      </p>
                    )}

                    {/* photo preview if open */}
                    {isOpen && c.photoUrl && (
                      <div style={{ marginTop: '14px', borderRadius: '2px', overflow: 'hidden', height: '120px' }}>
                        <img src={c.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Navbar active="capsules" />
    </main>
  )
}
