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
          fontFamily: 'var(--font-space)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-6 pt-6 pb-4">
        <p className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Map</p>
        <h2 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-space)' }}>Where you've been.</h2>
      </div>

      <div className="px-6 pt-4 flex flex-col">
        {capsules.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No locations yet.</p>
        ) : (
          capsules.map((c, i) => {
            const days   = daysUntil(c.opensAt)
            const isOpen = !!c.sealedAt && days <= 0
            return (
              <Link key={c.id} href={`/capsules/${c.id}`} className="flex items-start gap-5 mb-6 fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '10px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isOpen ? 'var(--gold)' : 'rgba(30,26,20,0.15)',
                    boxShadow: isOpen ? '0 0 10px rgba(184,200,240,0.5)' : 'none',
                    marginTop: '3px', flexShrink: 0,
                  }} />
                  {i < capsules.length - 1 && (
                    <div style={{ width: '1px', flex: 1, background: 'rgba(30,26,20,0.07)', minHeight: '28px', marginTop: '4px' }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className="text-base font-medium">{c.city}</p>
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
        background: 'linear-gradient(180deg, rgba(30,26,20,0.07) 0%, rgba(30,26,20,0.03) 100%)',
        border: '1px solid rgba(30,26,20,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(30,26,20,0.07)',
      }}>
        <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>The rule</p>
        <p className="text-sm font-light leading-relaxed" style={{ fontFamily: 'var(--font-space)' }}>
          You can only follow people you've physically been beside.
        </p>
      </div>

      <Navbar active="map" />
    </main>
  )
}
