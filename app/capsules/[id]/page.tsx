'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getCapsules, saveCapsule } from '../../lib/storage'
import { useRequireAuth } from '../../lib/auth'
import { shareOrDownload } from '../../lib/shareImage'
import type { Capsule } from '../../lib/types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

type UnlockStep = 'dark' | 'rising' | 'opening' | 'audio' | 'photo' | 'video' | 'people' | 'done'

export default function CapsuleDetail() {
  useRequireAuth()
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [cap, setCap]     = useState<Capsule | null>(null)
  const [uStep, setUStep] = useState<UnlockStep>('dark')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const found = getCapsules().find(c => c.id === id) ?? null
    setCap(found)
    if (found?.sealedAt && found.opensAt && new Date(found.opensAt) <= new Date() && !found.opened) {
      // mark opened
      saveCapsule({ ...found, opened: true })
      // begin reveal sequence
      const seq: [UnlockStep, number][] = [
        ['dark',    0],
        ['rising',  600],
        ['opening', 1800],
        ['audio',   2800],
        ['photo',   4200],
        ['video',   5800],
        ['people',  7200],
        ['done',    8400],
      ]
      seq.forEach(([s, delay]) => setTimeout(() => setUStep(s), delay))
    } else {
      setUStep('done')
    }
  }, [id])

  useEffect(() => {
    if (uStep === 'audio' && cap?.audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [uStep, cap])

  if (!cap) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>Not found.</p>
    </main>
  )

  const isOpen   = !!cap.sealedAt && !!cap.opensAt && new Date(cap.opensAt) <= new Date()
  const isSealed = !!cap.sealedAt && !!cap.opensAt && new Date(cap.opensAt) > new Date()
  const daysLeft = isSealed ? Math.ceil((new Date(cap.opensAt!).getTime() - Date.now()) / 86400000) : 0

  /* ── sealed view ── */
  if (isSealed) {
    return (
      <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => router.back()} className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-2)' }}>back</button>
          <span className="text-base font-light tracking-[0.4em]" style={{
            fontFamily: 'var(--font-fraunces)',
            background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>beside</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
          <div className="gold-glow rounded-full flex items-center justify-center" style={{
            width: '100px', height: '100px',
            border: '1px solid var(--gold)',
            background: 'var(--surface)',
          }}>
            <div style={{ width: '18px', height: '30px', borderRadius: '10px', border: '1px solid var(--gold)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '46%', left: 0, right: 0, height: '1px', background: 'var(--gold-dim)' }} />
            </div>
          </div>
          <div className="fade-up flex flex-col gap-3">
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--gold-dim)' }}>Sealed</p>
            <p className="text-[4rem] font-light leading-none" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--gold)' }}>{daysLeft}</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>days until it opens</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{cap.city} · {fmtDate(cap.createdAt)}</p>
          </div>
          {cap.members.length > 0 && (
            <div className="flex items-center gap-2">
              {cap.members.slice(0, 5).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)',
                }}>{m.initial}</div>
              ))}
              <p className="text-xs ml-1" style={{ color: 'var(--text-3)' }}>+you</p>
            </div>
          )}
          <button
            onClick={() => shareOrDownload(cap)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm tracking-[0.06em] transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
              color: '#0f0a05', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(201,169,110,0.22)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M4 5l4-4 4 4M2 11v3h12v-3" stroke="#0f0a05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share to Stories
          </button>
        </div>
      </main>
    )
  }

  /* ── unlock sequence ── */
  if (isOpen && uStep !== 'done') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{
        background: uStep === 'dark' ? '#000' : 'var(--bg)',
        transition: 'background 1.2s ease',
      }}>
        {uStep === 'rising' && (
          <div className="unlock-rise text-center flex flex-col gap-3">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>{cap.city}</p>
            <p className="text-lg font-light" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text)' }}>{fmtDate(cap.createdAt)}</p>
          </div>
        )}
        {uStep === 'opening' && (
          <div className="unlock-rise flex flex-col items-center gap-6">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>{cap.city}</p>
            {/* opening pill animation */}
            <div className="flex flex-col items-center" style={{ gap: '3px' }}>
              <div style={{
                width: '70px', height: '40px', borderRadius: '40px 40px 0 0',
                border: '1px solid var(--gold)',
                background: 'linear-gradient(180deg, rgba(201,169,110,0.1) 0%, transparent 100%)',
                animation: 'seal-top 0.8s cubic-bezier(0.4,0,0.2,1) forwards',
              }} />
              <div style={{
                width: '70px', height: '40px', borderRadius: '0 0 40px 40px',
                border: '1px solid var(--gold)',
                background: 'linear-gradient(0deg, rgba(201,169,110,0.1) 0%, transparent 100%)',
                animation: 'seal-bottom 0.8s cubic-bezier(0.4,0,0.2,1) forwards',
              }} />
            </div>
            <p className="text-sm font-light" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text)', opacity: 0.6 }}>Opening…</p>
          </div>
        )}
        {(uStep === 'audio') && (
          <div className="unlock-rise text-center flex flex-col gap-4">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>Voice</p>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ border: '1px solid var(--gold)', background: 'rgba(201,169,110,0.08)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
            </div>
            {cap.audioUrl && <audio ref={audioRef} src={cap.audioUrl} />}
          </div>
        )}
        {uStep === 'photo' && (
          <div className="unlock-rise flex flex-col items-center gap-4">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>Photo</p>
            {cap.photoUrl
              ? <img src={cap.photoUrl} className="developing rounded-2xl" style={{ width: '280px', height: '280px', objectFit: 'cover' }} alt="" />
              : <div className="rounded-2xl" style={{ width: '280px', height: '280px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>No photo</p>
                </div>
            }
          </div>
        )}
        {uStep === 'video' && (
          <div className="unlock-rise flex flex-col items-center gap-4">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>Video</p>
            {cap.videoUrl
              ? <video src={cap.videoUrl} autoPlay playsInline className="rounded-2xl" style={{ width: '280px', height: '280px', objectFit: 'cover' }} />
              : <div className="rounded-2xl" style={{ width: '280px', height: '280px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>No video</p>
                </div>
            }
          </div>
        )}
        {uStep === 'people' && cap.members.length > 0 && (
          <div className="unlock-rise flex flex-col items-center gap-6 px-8 text-center">
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--gold-dim)' }}>Who was there</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {cap.members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--border-2)', color: 'var(--gold)' }}>{m.initial}</div>
                  <p className="text-sm">{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  }

  /* ── done / already opened ── */
  return (
    <main className="min-h-screen flex flex-col pb-8" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()} className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-2)' }}>back</button>
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-8 pb-6">
        <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>{cap.city}</p>
        <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>{fmtDate(cap.createdAt)}</h2>
        {cap.members.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {cap.members.slice(0, 5).map((m, i) => (
              <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--gold)' }}>{m.initial}</div>
            ))}
          </div>
        )}
      </div>

      <div className="px-8 pb-6 flex justify-end">
        <button
          onClick={() => shareOrDownload(cap)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-[0.06em] transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
            color: '#0f0a05', fontWeight: 600,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v9M4 5l4-4 4 4M2 11v3h12v-3" stroke="#0f0a05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share to Stories
        </button>
      </div>

      <div className="px-8 flex flex-col gap-4">
        {cap.audioUrl && (
          <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-2)' }}>Voice</p>
            <audio ref={audioRef} src={cap.audioUrl} controls style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </div>
        )}
        {cap.photoUrl && (
          <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-2)' }}>Photo</p>
            <img src={cap.photoUrl} className="w-full rounded-xl" style={{ aspectRatio: '1', objectFit: 'cover' }} alt="" />
          </div>
        )}
        {cap.videoUrl && (
          <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-2)' }}>Video</p>
            <video src={cap.videoUrl} controls className="w-full rounded-xl" style={{ aspectRatio: '1', objectFit: 'cover' }} />
          </div>
        )}
        {cap.members.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-2)' }}>Who was there</p>
            <div className="flex flex-col gap-2">
              {cap.members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < cap.members.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--border-2)', color: 'var(--gold)' }}>{m.initial}</div>
                  <p className="text-sm">{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
