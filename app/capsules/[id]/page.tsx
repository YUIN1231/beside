'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getCapsules, saveCapsule } from '../../lib/storage'
import { useRequireAuth } from '../../lib/auth'
import { shareOrDownload } from '../../lib/shareImage'
import { markCapsuleOpened } from '../../lib/supabase'
import type { Capsule } from '../../lib/types'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '10px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-3)',
}

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
      saveCapsule({ ...found, opened: true })
      markCapsuleOpened(found.id).catch(() => {})
      const seq: [UnlockStep, number][] = [
        ['dark',    0],
        ['rising',  700],
        ['opening', 1900],
        ['audio',   3000],
        ['photo',   4400],
        ['video',   6000],
        ['people',  7500],
        ['done',    8800],
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
    <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
    </main>
  )

  const isOpen   = !!cap.sealedAt && !!cap.opensAt && new Date(cap.opensAt) <= new Date()
  const isSealed = !!cap.sealedAt && !!cap.opensAt && new Date(cap.opensAt) > new Date()
  const daysLeft = isSealed ? Math.ceil((new Date(cap.opensAt!).getTime() - Date.now()) / 86400000) : 0

  /* ── sealed view ── */
  if (isSealed) {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5rem 2rem 0' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', ...LABEL }}>back</button>
          <span style={{ ...LABEL }}>beside</span>
          <div style={{ width: '32px' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <p className="fade-up" style={{ ...LABEL, marginBottom: '1.5rem' }}>sealed</p>
          <p className="fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(7rem, 28vw, 11rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}>{daysLeft}</p>
          <p className="fade-up-2" style={{ ...LABEL, marginTop: '1.25rem' }}>days remaining</p>
          <p className="fade-up-3" style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '1.5rem' }}>
            {cap.city} · {fmtDate(cap.createdAt)}
          </p>
          {cap.members.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '2rem', justifyContent: 'center' }}>
              {cap.members.slice(0, 5).map((m, i) => (
                <div key={i} style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', color: 'var(--text-2)',
                  fontFamily: 'var(--font-space)',
                }}>{m.initial}</div>
              ))}
            </div>
          )}
          <button
            onClick={() => shareOrDownload(cap)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              marginTop: '3rem',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--gold)', fontSize: '1.125rem',
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
            }}
          >
            Share to Stories →
          </button>
        </div>
      </main>
    )
  }

  /* ── unlock sequence ── */
  if (isOpen && uStep !== 'done') {
    return (
      <main style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: uStep === 'dark' ? '#0E0B08' : 'var(--bg)',
        transition: 'background 1.4s ease',
      }}>
        {uStep === 'rising' && (
          <div className="unlock-rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>{cap.city}</p>
            <p style={{ fontFamily: 'var(--font-space)', fontSize: '16px', fontWeight: 300, color: 'var(--text)' }}>
              {fmtDate(cap.createdAt)}
            </p>
          </div>
        )}

        {uStep === 'opening' && (
          <div className="unlock-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>{cap.city}</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                width: '64px', height: '38px', borderRadius: '40px 40px 0 0',
                border: '1px solid var(--gold)',
                animation: 'seal-top 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
              }} />
              <div style={{
                width: '64px', height: '38px', borderRadius: '0 0 40px 40px',
                border: '1px solid var(--gold)',
                animation: 'seal-bottom 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
              }} />
            </div>
            <p style={{ fontFamily: 'var(--font-space)', fontSize: '12px', color: 'var(--text-2)', fontWeight: 300 }}>Opening…</p>
          </div>
        )}

        {uStep === 'audio' && (
          <div className="unlock-rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>Voice</p>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="gold-glow" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
            </div>
            {cap.audioUrl && <audio ref={audioRef} src={cap.audioUrl} />}
          </div>
        )}

        {uStep === 'photo' && (
          <div className="unlock-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '2rem', width: '100%' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>Photo</p>
            {cap.photoUrl
              ? <img src={cap.photoUrl} className="developing" style={{ width: '100%', maxWidth: '320px', aspectRatio: '1', objectFit: 'cover', borderRadius: '2px' }} alt="" />
              : <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '1', background: 'var(--surface)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ ...LABEL }}>No photo</p>
                </div>
            }
          </div>
        )}

        {uStep === 'video' && (
          <div className="unlock-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '2rem', width: '100%' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>Video</p>
            {cap.videoUrl
              ? <video src={cap.videoUrl} autoPlay playsInline style={{ width: '100%', maxWidth: '320px', aspectRatio: '1', objectFit: 'cover', borderRadius: '2px' }} />
              : <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '1', background: 'var(--surface)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ ...LABEL }}>No video</p>
                </div>
            }
          </div>
        )}

        {uStep === 'people' && cap.members.length > 0 && (
          <div className="unlock-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '2rem', width: '100%', textAlign: 'center' }}>
            <p style={{ ...LABEL, color: 'var(--gold-dim)' }}>Who was there</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', maxWidth: '280px' }}>
              {cap.members.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 0',
                  borderBottom: i < cap.members.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: 'var(--text-2)',
                    fontFamily: 'var(--font-space)',
                  }}>{m.initial}</div>
                  <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)' }}>{m.name}</p>
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
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '2rem' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5rem 2rem 0' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', ...LABEL }}>back</button>
        <span style={{ ...LABEL }}>beside</span>
        <div style={{ width: '32px' }} />
      </div>

      {/* meta */}
      <div style={{ padding: '3rem 2rem 0' }}>
        <p style={{ ...LABEL, color: 'var(--gold-dim)', marginBottom: '8px' }}>{cap.city}</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>{fmtDate(cap.createdAt)}</h2>
        {cap.members.length > 0 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {cap.members.slice(0, 5).map((m, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: 'var(--text-3)',
                fontFamily: 'var(--font-space)',
              }}>{m.initial}</div>
            ))}
          </div>
        )}
      </div>

      {/* share */}
      <div style={{ padding: '1.5rem 2rem 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => shareOrDownload(cap)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--gold)', fontSize: '13px',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
          }}
        >
          Share to Stories →
        </button>
      </div>

      {/* content */}
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {cap.audioUrl && (
          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ ...LABEL, marginBottom: '14px' }}>Voice</p>
            <audio ref={audioRef} src={cap.audioUrl} controls style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </div>
        )}
        {cap.photoUrl && (
          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ ...LABEL, marginBottom: '14px' }}>Photo</p>
            <img src={cap.photoUrl} style={{ width: '100%', borderRadius: '2px', aspectRatio: '1', objectFit: 'cover' }} alt="" />
          </div>
        )}
        {cap.videoUrl && (
          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ ...LABEL, marginBottom: '14px' }}>Video</p>
            <video src={cap.videoUrl} controls style={{ width: '100%', borderRadius: '2px', aspectRatio: '1', objectFit: 'cover' }} />
          </div>
        )}
        {cap.members.length > 0 && (
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ ...LABEL, marginBottom: '14px' }}>Who was there</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cap.members.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < cap.members.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', color: 'var(--text-2)',
                    fontFamily: 'var(--font-space)',
                  }}>{m.initial}</div>
                  <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)' }}>{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
