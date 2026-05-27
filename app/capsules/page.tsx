'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getCapsules } from '../lib/storage'
import type { Capsule } from '../lib/types'

function daysUntil(iso?: string) {
  if (!iso) return 0
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* group capsules by city */
function byCity(capsules: Capsule[]) {
  const map: Record<string, Capsule[]> = {}
  capsules.forEach(c => {
    if (!map[c.city]) map[c.city] = []
    map[c.city].push(c)
  })
  return Object.entries(map)
}

export default function Capsules() {
  const [capsules, setCapsules] = useState<Capsule[]>([])

  useEffect(() => { setCapsules(getCapsules()) }, [])

  const groups = byCity(capsules)

  return (
    <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* header */}
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8" />
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-8 pb-2">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Capsules</p>
        <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>
          Every place you've been.
        </h2>
      </div>

      {capsules.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div style={{ width: '14px', height: '24px', borderRadius: '8px', border: '1px solid var(--border-2)' }}>
            <div style={{ position: 'relative', top: '48%', height: '1px', background: 'var(--border)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No capsules yet.</p>
          <Link href="/" className="text-xs tracking-[0.1em] px-6 py-3 rounded-full mt-2" style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>
            Take your first capsule
          </Link>
        </div>
      ) : (
        <div className="flex-1 px-8 pt-6 no-scrollbar overflow-auto">
          {groups.map(([city, caps], gi) => (
            <div key={city} className="mb-10 fade-up" style={{ animationDelay: `${gi * 0.06}s` }}>
              {/* city header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)', flexShrink: 0, boxShadow: '0 0 8px rgba(201,169,110,0.5)' }} />
                <p className="text-base font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>{city}</p>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {/* timeline */}
              <div className="pl-4" style={{ borderLeft: '1px solid var(--border)', marginLeft: '3px' }}>
                {caps.map((c) => {
                  const days = daysUntil(c.opensAt)
                  const isOpen   = !!c.sealedAt && days <= 0
                  const isSealed = !!c.sealedAt && days > 0

                  return (
                    <Link
                      key={c.id}
                      href={`/capsules/${c.id}`}
                      className="flex gap-4 mb-6 last:mb-0 group"
                    >
                      {/* timeline dot */}
                      <div className="flex flex-col items-center" style={{ marginLeft: '-5px', marginTop: '4px' }}>
                        <div style={{
                          width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                          border: `1px solid ${isOpen ? 'var(--gold)' : 'var(--border-2)'}`,
                          background: isOpen ? 'var(--gold)' : 'var(--bg)',
                          boxShadow: isOpen ? '0 0 8px rgba(201,169,110,0.5)' : 'none',
                        }} />
                      </div>

                      {/* card */}
                      <div className="flex-1 rounded-xl p-4 transition-all duration-200" style={{
                        background: 'var(--surface)',
                        border: `1px solid ${isOpen ? 'var(--border-2)' : 'var(--border)'}`,
                      }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-light">{fmtDate(c.createdAt)}</p>
                            {c.members.length > 0 && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                                +{c.members.length} {c.members.length === 1 ? 'person' : 'people'}
                              </p>
                            )}
                          </div>
                          {isSealed && (
                            <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-full" style={{ border: '1px solid var(--border-2)', color: 'var(--text-3)' }}>
                              {days}d
                            </span>
                          )}
                          {isOpen && (
                            <span className="text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-full" style={{
                              border: '1px solid rgba(201,169,110,0.3)',
                              background: 'rgba(201,169,110,0.08)',
                              color: 'var(--gold)',
                            }}>Open</span>
                          )}
                          {!c.sealedAt && (
                            <span className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-3)' }}>Draft</span>
                          )}
                        </div>

                        {/* media preview strip */}
                        <div className="flex gap-2">
                          {['◉', '□', '▶'].map((icon, j) => (
                            <div key={j} className="rounded-lg flex items-center justify-center" style={{
                              width: '36px', height: '36px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              fontSize: '11px', color: 'var(--text-3)',
                              filter: isOpen ? 'none' : 'blur(0px)',
                            }}>
                              {isOpen ? icon : '·'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Navbar active="capsules" />
    </main>
  )
}
