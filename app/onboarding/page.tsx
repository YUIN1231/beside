'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDES = [
  {
    label: '01',
    heading: 'People you crossed paths with\non your travels.',
    sub: 'Not followers. Not connections.\nPeople who were actually beside you.',
  },
  {
    label: '02',
    heading: 'Voice. Photo. Video.\nOne take. Sealed.',
    sub: 'No edits. No filters. Raw as the moment.\nCannot be touched until it opens.',
  },
  {
    label: '03',
    heading: '1 month later,\nit unlocks.',
    sub: "A notification arrives. You see who made it.\nAnd who's beside them now.",
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)

  const next = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(s => s + 1)
    } else {
      router.replace('/auth')
    }
  }

  const s = SLIDES[slide]

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* progress dots */}
      <div className="flex items-center justify-center gap-2 pt-16 pb-0">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              width: i === slide ? '24px' : '5px',
              height: '5px',
              borderRadius: '3px',
              background: i === slide ? 'var(--gold)' : 'var(--border-2)',
            }}
          />
        ))}
      </div>

      {/* content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">

        {/* capsule illustration */}
        <div className="relative mb-14" style={{ width: '90px', height: '90px' }}>
          <div
            className="absolute inset-0 rounded-full slow-spin"
            style={{ border: '1px solid var(--border-2)' }}
          />
          <svg
            className="absolute inset-0 slow-spin"
            width="90" height="90" viewBox="0 0 90 90" fill="none"
            style={{ animationDirection: 'reverse', animationDuration: '18s' }}
          >
            <circle
              cx="45" cy="45" r="41"
              stroke="url(#og)" strokeWidth="1"
              strokeDasharray="40 220" strokeLinecap="round"
            />
            <defs>
              <linearGradient id="og" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--gold)" />
                <stop offset="1" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          {/* pill */}
          <div
            className="absolute"
            style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '22px', height: '38px',
              borderRadius: '12px',
              border: '1px solid var(--gold)',
              background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute', top: '48%', left: 0, right: 0,
                height: '1px', background: 'var(--gold-dim)',
              }}
            />
          </div>
        </div>

        <div key={slide} className="fade-up flex flex-col gap-5">
          <p
            className="text-xs tracking-[0.25em] uppercase"
            style={{ color: 'var(--gold-dim)' }}
          >
            {s.label}
          </p>
          <h1
            className="text-[1.85rem] leading-snug whitespace-pre-line"
            style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text)' }}
          >
            {s.heading}
          </h1>
          <p
            className="text-sm leading-relaxed whitespace-pre-line"
            style={{ color: 'var(--text-2)' }}
          >
            {s.sub}
          </p>
        </div>
      </div>

      {/* cta */}
      <div className="px-8 pb-16 flex flex-col items-center gap-5">
        <button
          onClick={next}
          className="w-full py-4 rounded-full text-sm tracking-[0.12em] transition-all duration-300 active:scale-95"
          style={{
            background: 'var(--gold)',
            color: 'var(--bg)',
            fontWeight: 500,
          }}
        >
          {slide < SLIDES.length - 1 ? 'Next' : 'Get started'}
        </button>
      </div>
    </main>
  )
}
