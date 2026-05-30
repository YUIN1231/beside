'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getCapsules } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
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

export default function Map() {
  useRequireAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  useEffect(() => setCapsules(getCapsules()), [])

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>

      <div style={{ padding: '3.5rem 2rem 0' }}>
        <span style={{ ...LABEL }}>beside</span>
      </div>

      <div style={{ padding: '3rem 2rem 0' }}>
        <p style={{ ...LABEL, color: 'var(--gold-dim)', marginBottom: '1rem' }}>Map</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 2.8rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.08,
        }}>Where you've been.</h2>
      </div>

      <div style={{ padding: '2.5rem 2rem 0', flex: 1 }}>
        {capsules.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', fontWeight: 300 }}>
            No locations yet.
          </p>
        ) : (
          capsules.map((c, i) => {
            const days   = daysUntil(c.opensAt)
            const isOpen = !!c.sealedAt && days <= 0
            return (
              <Link key={c.id} href={`/capsules/${c.id}`} className="fade-up" style={{
                display: 'flex', alignItems: 'flex-start', gap: '20px',
                paddingBottom: '2.5rem',
                paddingTop: i > 0 ? '2.5rem' : 0,
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none', color: 'inherit',
                animationDelay: `${i * 0.05}s`,
              }}>
                {/* dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isOpen ? 'var(--gold)' : 'transparent',
                    border: `1px solid ${isOpen ? 'var(--gold)' : 'var(--border-2)'}`,
                  }} />
                  {i < capsules.length - 1 && (
                    <div style={{ width: '1px', flex: 1, minHeight: '28px', marginTop: '4px', background: 'var(--border)' }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '15px', fontFamily: 'var(--font-space)', fontWeight: 500 }}>{c.city}</p>
                    <span style={{ ...LABEL, color: isOpen ? 'var(--gold)' : undefined }}>
                      {isOpen ? 'open' : `${days}d`}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '4px' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {c.members.length > 0 && ` · ${c.members.length + 1} people`}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* The rule */}
      <div style={{ margin: '1rem 2rem 0', padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
        <p style={{ ...LABEL, marginBottom: '0.75rem' }}>The rule</p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'var(--text-2)',
        }}>
          You can only follow people you've physically been beside.
        </p>
      </div>

      <Navbar active="map" />
    </main>
  )
}
