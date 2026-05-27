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

export default function Map() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  useEffect(() => { setCapsules(getCapsules()) }, [])

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

      <div className="px-8 pt-8 pb-2">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Map</p>
        <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>Where you've been.</h2>
      </div>

      <div className="px-8 pt-6 flex flex-col gap-0">
        {capsules.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No locations yet.</p>
        ) : (
          capsules.map((c, i) => {
            const days   = daysUntil(c.opensAt)
            const isOpen = !!c.sealedAt && days <= 0
            return (
              <Link key={c.id} href={`/capsules/${c.id}`} className="flex items-start gap-5 mb-8 fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '10px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    border: `1px solid ${isOpen ? 'var(--gold)' : 'var(--border-2)'}`,
                    background: isOpen ? 'var(--gold)' : 'transparent',
                    boxShadow: isOpen ? '0 0 8px rgba(201,169,110,0.5)' : 'none',
                    marginTop: '3px',
                  }} />
                  {i < capsules.length - 1 && (
                    <div style={{ width: '1px', flex: 1, background: 'var(--border)', minHeight: '32px', marginTop: '4px' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className="font-light text-base">{c.city}</p>
                    <span className="text-[10px]" style={{ color: isOpen ? 'var(--gold)' : 'var(--text-3)' }}>
                      {isOpen ? 'open' : `${days}d`}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {c.members.length > 0 && ` · ${c.members.length + 1} people`}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <div className="mx-8 mt-4 p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>The rule</p>
        <p className="text-sm font-light leading-relaxed" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text)' }}>
          You can only follow people you've physically been beside.
        </p>
      </div>

      <Navbar active="map" />
    </main>
  )
}
