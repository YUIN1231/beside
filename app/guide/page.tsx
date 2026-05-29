import Link from 'next/link'
import Navbar from '../components/Navbar'

const STEPS = [
  { n: '01', title: 'Meet someone in real life', body: 'At a hostel, a café, on a train. Open beside. Tap to start a capsule.' },
  { n: '02', title: 'Voice. Photo. Video.', body: 'One take each. No edits. No filters. Raw as the moment. 60 seconds total.' },
  { n: '03', title: 'GPS confirms you were both there', body: 'Everyone you tag gets a location check. Same place, within 15 minutes. No faking it.' },
  { n: '04', title: 'Hold to seal', body: '3 seconds. Once sealed, it cannot be edited, deleted, or opened early.' },
  { n: '05', title: '1 month later', body: 'A notification arrives. Your capsule unlocks. You see who made it — and who\'s beside them now.' },
  { n: '06', title: 'One capsule per month', body: 'That\'s the limit. Make it count.' },
]

export default function Guide() {
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

      <div className="px-6 pt-6 pb-2">
        <p className="text-[11px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Guide</p>
        <h2 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-space)' }}>How it works.</h2>
      </div>

      <div className="px-6 pt-6 flex flex-col">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex gap-5 pb-7 fade-up" style={{
            borderBottom: i < STEPS.length - 1 ? '1px solid rgba(30,26,20,0.06)' : 'none',
            paddingTop: i > 0 ? '24px' : '0',
            animationDelay: `${i * 0.05}s`,
          }}>
            <span style={{ color: 'var(--text-3)', width: '20px', fontSize: '10px', flexShrink: 0, marginTop: '2px' }}>{s.n}</span>
            <div>
              <p className="font-medium mb-1" style={{ fontFamily: 'var(--font-space)' }}>{s.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-5 mt-8 p-5 rounded-2xl" style={{
        background: 'linear-gradient(180deg, rgba(30,26,20,0.07) 0%, rgba(30,26,20,0.03) 100%)',
        border: '1px solid rgba(30,26,20,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(30,26,20,0.07)',
      }}>
        <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>The idea</p>
        <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-space)' }}>
          Social media lets you follow anyone. beside lets you follow only the people who were actually beside you.
        </p>
      </div>

      <div className="px-5 mt-8">
        <Link href="/" className="block text-center text-sm tracking-[0.06em] py-3.5 rounded-full transition-all active:scale-95" style={{
          background: 'linear-gradient(135deg, #d4e0ff 0%, #b8c8f0 100%)',
          color: '#06070d', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(184,200,240,0.2)',
        }}>
          Take a capsule
        </Link>
      </div>

      <Navbar active="guide" />
    </main>
  )
}
