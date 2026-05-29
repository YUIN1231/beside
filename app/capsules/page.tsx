'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getCapsules } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
import { fetchMyCapsules } from '../lib/supabase'
import type { Capsule } from '../lib/types'

function daysUntil(iso?: string) {
  if (!iso) return 0
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}
function fmtDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function byCity(capsules: Capsule[]) {
  const map: Record<string, Capsule[]> = {}
  capsules.forEach(c => {
    if (!map[c.city]) map[c.city] = []
    map[c.city].push(c)
  })
  return Object.entries(map)
}

function CapsuleStoryRing({ capsule, index }: { capsule: Capsule; index: number }) {
  const days   = daysUntil(capsule.opensAt)
  const isOpen = !!capsule.sealedAt && days <= 0
  const isSealed = !!capsule.sealedAt && days > 0

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="flex flex-col items-center gap-2 story-in flex-shrink-0"
      style={{ animationDelay: `${index * 0.05}s`, width: '72px' }}
    >
      {isOpen || isSealed ? (
        <div className={isOpen ? 'story-ring' : 'story-ring-dim'} style={{ width: '64px', height: '64px' }}>
          <div className={isOpen ? 'story-ring-inner' : 'story-ring-dim-inner'} style={{ width: '59px', height: '59px' }}>
            <div style={{
              width: '53px', height: '53px', borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* pill icon */}
              <div style={{
                width: '12px', height: '20px', borderRadius: '6px',
                border: `1px solid ${isOpen ? 'var(--gold)' : 'rgba(30,26,20,0.25)'}`,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '46%', left: 0, right: 0, height: '1px',
                  background: isOpen ? 'var(--gold-dim)' : 'rgba(30,26,20,0.15)',
                }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(30,26,20,0.04)',
          border: '1.5px dashed rgba(30,26,20,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '12px', height: '20px', borderRadius: '6px',
            border: '1px solid rgba(30,26,20,0.18)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: '46%', left: 0, right: 0, height: '1px',
              background: 'rgba(30,26,20,0.1)',
            }} />
          </div>
        </div>
      )}
      <span className="text-center leading-tight" style={{
        fontSize: '10px', color: isOpen ? 'var(--gold)' : 'var(--text-3)',
        maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {isOpen ? 'open' : isSealed ? `${days}d` : 'draft'}
      </span>
      <span className="text-center leading-tight" style={{
        fontSize: '9px', color: 'var(--text-3)',
        maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {capsule.city}
      </span>
    </Link>
  )
}

export default function Capsules() {
  useRequireAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])

  useEffect(() => {
    // Load from localStorage immediately
    setCapsules(getCapsules())
    // Then hydrate from Supabase
    const stored = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('beside_user') ?? 'null')
      : null
    if (stored?.email) {
      fetchMyCapsules(stored.email).then(remote => {
        if (remote.length > 0) setCapsules(remote)
      }).catch(() => {})
    }
  }, [])

  const groups = byCity(capsules)

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

      {capsules.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          {/* empty story ring placeholder */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(30,26,20,0.03)',
            border: '1.5px dashed rgba(30,26,20,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '16px', height: '26px', borderRadius: '9px',
              border: '1px solid rgba(30,26,20,0.15)',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: '46%', left: 0, right: 0, height: '1px', background: 'rgba(30,26,20,0.1)' }} />
            </div>
          </div>
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>No capsules yet.</p>
            <Link href="/" className="text-xs tracking-[0.08em] px-6 py-3 rounded-full" style={{
              background: 'rgba(184,200,240,0.1)',
              color: 'var(--gold)',
              border: '1px solid rgba(184,200,240,0.2)',
            }}>
              Take your first capsule
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stories row ── */}
          <div className="flex gap-4 px-6 pb-6 no-scrollbar overflow-x-auto" style={{ borderBottom: '1px solid rgba(30,26,20,0.06)' }}>
            {capsules.map((c, i) => (
              <CapsuleStoryRing key={c.id} capsule={c} index={i} />
            ))}
          </div>

          {/* ── Feed ── */}
          <div className="flex-1 px-5 pt-5 no-scrollbar overflow-auto">
            {groups.map(([city, caps], gi) => (
              <div key={city} className="mb-8 fade-up" style={{ animationDelay: `${gi * 0.06}s` }}>

                {/* city label */}
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px rgba(184,200,240,0.5)', flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-space)' }}>{city}</span>
                </div>

                {/* capsule cards */}
                <div className="flex flex-col gap-3">
                  {caps.map(c => {
                    const days   = daysUntil(c.opensAt)
                    const isOpen = !!c.sealedAt && days <= 0
                    const isSealed = !!c.sealedAt && days > 0

                    return (
                      <Link key={c.id} href={`/capsules/${c.id}`} className="block rounded-2xl overflow-hidden transition-all active:scale-[0.98]" style={{
                        background: isOpen
                          ? 'linear-gradient(180deg, rgba(184,200,240,0.09) 0%, rgba(184,200,240,0.03) 100%)'
                          : 'linear-gradient(180deg, rgba(30,26,20,0.07) 0%, rgba(30,26,20,0.025) 100%)',
                        border: `1px solid ${isOpen ? 'rgba(184,200,240,0.22)' : 'rgba(30,26,20,0.1)'}`,
                        boxShadow: isOpen
                          ? '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(184,200,240,0.1)'
                          : '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(30,26,20,0.06)',
                      }}>
                        <div className="flex items-center gap-4 p-4">
                          {/* mini story ring */}
                          <div className={isOpen ? 'story-ring' : 'story-ring-dim'} style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                            <div className={isOpen ? 'story-ring-inner' : 'story-ring-dim-inner'} style={{ width: '39px', height: '39px' }}>
                              <div style={{
                                width: '33px', height: '33px', borderRadius: '50%',
                                background: 'var(--surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <div style={{
                                  width: '8px', height: '14px', borderRadius: '4px',
                                  border: `1px solid ${isOpen ? 'var(--gold)' : 'rgba(30,26,20,0.2)'}`,
                                  position: 'relative',
                                }}>
                                  <div style={{
                                    position: 'absolute', top: '46%', left: 0, right: 0, height: '1px',
                                    background: isOpen ? 'var(--gold-dim)' : 'rgba(30,26,20,0.1)',
                                  }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{fmtDateLong(c.createdAt)}</p>
                            {c.members.length > 0 && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                                +{c.members.length} {c.members.length === 1 ? 'person' : 'people'}
                              </p>
                            )}
                          </div>

                          {/* status badge */}
                          {isSealed && (
                            <span style={{
                              fontSize: '11px', color: 'var(--text-3)',
                              background: 'rgba(30,26,20,0.05)',
                              padding: '4px 10px', borderRadius: '20px',
                              flexShrink: 0,
                            }}>{days}d</span>
                          )}
                          {isOpen && (
                            <span style={{
                              fontSize: '11px', color: 'var(--gold)',
                              background: 'rgba(184,200,240,0.08)',
                              padding: '4px 10px', borderRadius: '20px',
                              flexShrink: 0,
                            }}>Open</span>
                          )}
                          {!c.sealedAt && (
                            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Draft</span>
                          )}
                        </div>

                        {/* media strip — only shown if open */}
                        {isOpen && (
                          <div className="flex gap-2 px-4 pb-4">
                            {[{ icon: '◉', label: 'voice' }, { icon: '□', label: 'photo' }, { icon: '▶', label: 'video' }].map(({ icon, label }) => (
                              <div key={label} className="flex-1 rounded-xl flex items-center justify-center gap-1.5" style={{
                                height: '40px',
                                background: 'rgba(30,26,20,0.06)',
                                border: '1px solid rgba(30,26,20,0.1)',
                              }}>
                                <span style={{ fontSize: '11px', color: 'var(--gold)', opacity: 0.7 }}>{icon}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Navbar active="capsules" />
    </main>
  )
}
