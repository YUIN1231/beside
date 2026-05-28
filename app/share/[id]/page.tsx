'use client'
import { Suspense, useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function Countdown({ opensIso }: { opensIso: string }) {
  const [days, setDays] = useState(0)
  useEffect(() => {
    const calc = () => {
      const d = Math.max(0, Math.ceil((new Date(opensIso).getTime() - Date.now()) / 86400000))
      setDays(d)
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [opensIso])
  return <>{days}</>
}

function ShareCard() {
  const { id }   = useParams<{ id: string }>()
  const sp       = useSearchParams()
  const city     = sp.get('city') ?? 'Somewhere'
  const opensIso = sp.get('opens') ?? ''
  const n        = parseInt(sp.get('n') ?? '1')

  const opensDate      = opensIso ? new Date(opensIso) : null
  const isPast         = opensDate ? opensDate <= new Date() : false
  const opensFormatted = opensDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) ?? ''
  const fakeInitials   = Array.from({ length: Math.min(n, 5) }, (_, i) => String.fromCharCode(65 + i))

  return (
    <main style={{
      minHeight: '100svh',
      background: 'radial-gradient(ellipse at 50% 38%, rgba(201,169,110,0.08) 0%, #0a0602 60%)',
      backgroundColor: '#0a0602',
      color: '#f0e6d0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'system-ui, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* top wordmark */}
      <div style={{ paddingTop: '52px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          letterSpacing: '0.42em',
          background: 'linear-gradient(135deg, #e8c98a, #c9a96e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 400,
        }}>beside</p>
      </div>

      {/* center illustration */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', flex: 1, justifyContent: 'center' }}>

        {/* ring + pill */}
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          {/* orbit ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid rgba(201,169,110,0.1)',
          }} />
          {/* gradient arc SVG */}
          <svg style={{ position: 'absolute', inset: 0 }} width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="96"
              stroke="url(#arcG)" strokeWidth="2"
              strokeDasharray="180 422" strokeLinecap="round"
              transform="rotate(-130 100 100)"
            />
            <defs>
              <linearGradient id="arcG" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e8c98a" />
                <stop offset="0.6" stopColor="#c9a96e" />
                <stop offset="1" stopColor="rgba(201,169,110,0)" />
              </linearGradient>
            </defs>
          </svg>
          {/* inner circle */}
          <div style={{
            position: 'absolute', inset: '8px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, #0a0602 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* pill */}
            <div style={{
              width: '28px', height: '48px', borderRadius: '14px',
              border: '1.5px solid #c9a96e',
              background: 'linear-gradient(180deg, rgba(201,169,110,0.1) 0%, rgba(201,169,110,0.04) 100%)',
              position: 'relative',
              boxShadow: '0 0 24px rgba(201,169,110,0.15)',
            }}>
              <div style={{
                position: 'absolute', top: '46%', left: '4px', right: '4px',
                height: '1px', background: 'rgba(201,169,110,0.35)',
              }} />
            </div>
          </div>
        </div>

        {/* text content */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.24em', color: 'rgba(201,169,110,0.5)', textTransform: 'uppercase' }}>
            captured in
          </p>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#f0e6d0',
            lineHeight: 1.1,
          }}>
            {city}
          </h1>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'rgba(240,230,208,0.38)',
            marginTop: '4px',
          }}>
            Something is sealed inside.
          </p>
        </div>

        {/* divider */}
        <div style={{ width: '100%', maxWidth: '280px', height: '1px', background: 'rgba(240,230,208,0.07)' }} />

        {/* status */}
        {!isPast && opensDate ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(240,230,208,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              opens in
            </p>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '4rem',
              fontWeight: 300,
              color: '#c9a96e',
              lineHeight: 1,
            }}>
              <Countdown opensIso={opensIso} />
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(240,230,208,0.35)' }}>
              days · {opensFormatted}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e' }}>
              Now open
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(240,230,208,0.4)', marginTop: '6px' }}>
              {opensFormatted}
            </p>
          </div>
        )}

        {/* people */}
        {n > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '-8px' }}>
              {fakeInitials.map((_, i) => (
                <div key={i} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#150e07',
                  border: '1.5px solid rgba(201,169,110,0.28)',
                  marginLeft: i > 0 ? '-10px' : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', color: 'rgba(201,169,110,0.7)',
                  fontFamily: 'Georgia, serif',
                }}>·</div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(240,230,208,0.25)', letterSpacing: '0.06em' }}>
              {n} {n === 1 ? 'person' : 'people'} sealed this
            </p>
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div style={{ paddingBottom: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}>
        <Link href="/" style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          padding: '16px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
          color: '#0f0a05',
          fontWeight: 600,
          fontSize: '14px',
          letterSpacing: '0.06em',
          textDecoration: 'none',
          boxShadow: '0 4px 28px rgba(201,169,110,0.22)',
        }}>
          Capture your own moment
        </Link>
        <p style={{ fontSize: '11px', color: 'rgba(240,230,208,0.2)', textAlign: 'center', letterSpacing: '0.04em' }}>
          beside — people who were actually there
        </p>
      </div>
    </main>
  )
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareCard />
    </Suspense>
  )
}
