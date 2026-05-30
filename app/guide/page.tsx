import Link from 'next/link'
import Navbar from '../components/Navbar'

const STEPS = [
  { n: '01', title: 'Meet someone in real life',      body: 'At a hostel, a café, on a train. Open beside. Tap to start a capsule.' },
  { n: '02', title: 'Voice. Photo. Video.',            body: 'One take each. No edits. No filters. Raw as the moment. 60 seconds total.' },
  { n: '03', title: 'GPS confirms you were both there', body: 'Everyone you tag gets a location check. Same place, within 15 minutes. No faking it.' },
  { n: '04', title: 'Hold to seal',                   body: '3 seconds. Once sealed, it cannot be edited, deleted, or opened early.' },
  { n: '05', title: '1 month later',                  body: "A notification arrives. Your capsule unlocks. You see who made it — and who's beside them now." },
  { n: '06', title: 'One capsule per month',           body: "That's the limit. Make it count." },
]

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '10px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-3)',
}

export default function Guide() {
  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>

      <div style={{ padding: '3.5rem 2rem 0' }}>
        <span style={{ ...LABEL }}>beside</span>
      </div>

      <div style={{ padding: '3rem 2rem 0' }}>
        <p style={{ ...LABEL, color: 'var(--gold-dim)', marginBottom: '1rem' }}>Guide</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 8vw, 2.8rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.08,
        }}>How it works.</h2>
      </div>

      <div style={{ padding: '2.5rem 2rem 0', display: 'flex', flexDirection: 'column' }}>
        {STEPS.map((s, i) => (
          <div key={s.n} className="fade-up" style={{
            display: 'flex', gap: '20px',
            paddingTop: i > 0 ? '2rem' : 0,
            paddingBottom: '2rem',
            borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
            animationDelay: `${i * 0.05}s`,
          }}>
            <span style={{ ...LABEL, width: '20px', flexShrink: 0, paddingTop: '2px' }}>{s.n}</span>
            <div>
              <p style={{ fontFamily: 'var(--font-space)', fontWeight: 500, fontSize: '14px', marginBottom: '6px' }}>{s.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'var(--font-space)', fontWeight: 300 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Closing thought */}
      <div style={{ margin: '2rem 2rem 0', padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
        <p style={{ ...LABEL, marginBottom: '0.75rem' }}>The idea</p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.4,
          color: 'var(--text-2)',
        }}>
          Social media lets you follow anyone.<br />
          beside lets you follow only the people<br />
          who were actually beside you.
        </p>
      </div>

      <div style={{ padding: '2.5rem 2rem 0' }}>
        <Link href="/" style={{
          color: 'var(--gold)', fontSize: '1.125rem',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          textDecoration: 'none',
        }}>
          Take a capsule →
        </Link>
      </div>

      <Navbar active="guide" />
    </main>
  )
}
