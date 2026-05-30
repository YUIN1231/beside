'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDES = [
  {
    num: '01',
    heading: 'People you crossed\npaths with.',
    sub: 'Not followers.\nNot connections.\nPeople who were actually beside you.',
  },
  {
    num: '02',
    heading: 'Voice. Photo.\nVideo. One take.',
    sub: 'No edits. No filters.\nRaw as the moment.\nCannot be touched until it opens.',
  },
  {
    num: '03',
    heading: '1 month later,\nit unlocks.',
    sub: "A notification arrives.\nYou see who made it.\nAnd who's beside them now.",
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else router.replace('/auth')
  }

  const s = SLIDES[slide]

  return (
    <main style={{
      minHeight: '100svh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* wordmark */}
      <div style={{ padding: '3.5rem 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-space)',
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}>beside</span>

        {/* step indicator */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? '24px' : '4px',
              height: '1px',
              background: i === slide ? 'var(--gold)' : 'var(--border-2)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
      </div>

      {/* content */}
      <div
        key={slide}
        className="fade-up"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 2rem 5rem',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-space)',
          fontSize: '10px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--gold-dim)',
          marginBottom: '2rem',
        }}>{s.num}</p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.6rem, 11vw, 3.8rem)',
          lineHeight: 1.08,
          fontStyle: 'italic',
          fontWeight: 400,
          whiteSpace: 'pre-line',
          marginBottom: '2.5rem',
          letterSpacing: '-0.01em',
        }}>{s.heading}</h1>

        <p style={{
          color: 'var(--text-2)',
          fontSize: '0.9375rem',
          lineHeight: 1.75,
          whiteSpace: 'pre-line',
          marginBottom: '4rem',
          fontFamily: 'var(--font-space)',
          fontWeight: 300,
        }}>{s.sub}</p>

        <button onClick={next} style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--gold)',
          fontSize: '1.25rem',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          textAlign: 'left',
          letterSpacing: '0.01em',
        }}>
          {slide < SLIDES.length - 1 ? 'Next →' : 'Begin →'}
        </button>
      </div>
    </main>
  )
}
