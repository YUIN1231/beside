'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getCapsules } from '../lib/storage'
import { useRequireAuth } from '../lib/auth'
import type { Capsule } from '../lib/types'

function daysUntil(iso?: string) {
  if (!iso) return 0
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export default function Map() {
  useRequireAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  useEffect(() => { setCapsules(getCapsules()) }, [])

  return (
    <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="w-8" />
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-6 pt-6 pb-4">
        <p className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Map</p>
        <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>Where you've been.</h2>
      </div>

      <div className="px-6 pt-4 flex flex-col">
        {capsules.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No locations yet.</p>
        ) : (
          capsules.map((c, i) => {
            const days   = daysUntil(c.opensAt)
            const isOpen = !!c.sealedAt && days <= 0
            return (
              <Link key={c.id} href={`/capsules/${c.id}`} className="flex items-start gap-5 mb-7 fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '10px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isOpen ? 'var(--gold)' : 'rgba(240,230,208,0.15)',
                    boxShadow: isOpen ? '0 0 10px rgba(201,169,110,0.5)' : 'none',
                    marginTop: '3px', flexShrink: 0,
                  }} />
                  {i < capsules.length - 1 && (
                    <div style={{ width: '1px', flex: 1, background: 'rgba(240,230,208,0.07)', minHeight: '28px', marginTop: '4px' }} />
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

      <div className="mx-5 mt-4 p-5 rounded-2xl" style={{
        background: 'rgba(240,230,208,0.03)',
        border: '1px solid rgba(240,230,208,0.07)',
      }}>
        <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>The rule</p>
        <p className="text-sm font-light leading-relaxed" style={{ fontFamily: 'var(--font-fraunces)' }}>
          You can only follow people you've physically been beside.
        </p>
      </div>

      <Navbar active="map" />
    </main>
  )
}
