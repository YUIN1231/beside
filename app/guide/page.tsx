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
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-8" />
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-8 pb-2">
        <p className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>Guide</p>
        <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-fraunces)' }}>How it works.</h2>
      </div>

      <div className="px-8 pt-6 flex flex-col">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex gap-5 pb-7 fade-up" style={{
            borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
            marginBottom: i < STEPS.length - 1 ? '0' : '0',
            paddingTop: i > 0 ? '24px' : '0',
            animationDelay: `${i * 0.05}s`,
          }}>
            <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: 'var(--text-3)', width: '20px' }}>{s.n}</span>
            <div>
              <p className="font-light mb-1" style={{ fontFamily: 'var(--font-fraunces)' }}>{s.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-8 mt-8 p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--gold-dim)' }}>The idea</p>
        <p className="text-sm font-light leading-relaxed" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text)' }}>
          Social media lets you follow anyone. beside lets you follow only the people who were actually beside you.
        </p>
      </div>

      <div className="px-8 mt-8">
        <Link href="/" className="block text-center text-sm tracking-[0.08em] py-4 rounded-full transition-all active:scale-95" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
          Take a capsule
        </Link>
      </div>

      <Navbar active="guide" />
    </main>
  )
}
