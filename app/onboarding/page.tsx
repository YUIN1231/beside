'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDES = [
  {
    num: '01',
    heading: 'People you crossed\npaths with.',
    sub: 'Not followers. Not connections.\nPeople who were actually beside you.',
  },
  {
    num: '02',
    heading: 'Voice. Photo. Video.\nOne take. Sealed.',
    sub: 'No edits. No filters. Raw as the moment.\nCannot be touched until it opens.',
  },
  {
    num: '03',
    heading: '1 month later,\nit unlocks.',
    sub: "A notification arrives. You see who made it.\nAnd who's beside them now.",
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)

  const next = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(s => s + 1)
    } else {
      router.replace('/auth')
    }
  }

  const s = SLIDES[slide]

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

      <div style={{ padding: '3.5rem 2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
          fontFamily: 'var(--font-space)',
        }}>beside</span>

        {/* dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? '20px' : '4px',
              height: '4px',
              borderRadius: '2px',
              background: i === slide ? 'var(--gold)' : 'var(--border-2)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
      </div>

      <div key={slide} className="fade-up" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 2rem 6rem',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--gold-dim)',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-space)',
        }}>{s.num}</p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 10vw, 3rem)',
          lineHeight: 1.1,
          fontStyle: 'italic',
          fontWeight: 400,
          whiteSpace: 'pre-line',
          marginBottom: '1.5rem',
        }}>{s.heading}</h1>

        <p style={{
          color: 'var(--text-2)',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          whiteSpace: 'pre-line',
          marginBottom: '3.5rem',
        }}>{s.sub}</p>

        <button
          onClick={next}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--gold)',
            fontSize: '1.125rem',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            textAlign: 'left',
          }}
        >
          {slide < SLIDES.length - 1 ? 'Next →' : 'Begin →'}
        </button>
      </div>
    </main>
  )
}
