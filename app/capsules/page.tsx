'use client'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const CAPSULES = [
  {
    id: '1',
    location: 'Melbourne',
    sublocation: 'Luna Park Hostel',
    created: '2026-04-25',
    opens: '2026-05-25',
    people: [{ name: 'Sara K.', initial: 'S' }, { name: 'Tom B.', initial: 'T' }],
  },
  {
    id: '2',
    location: 'Kyoto',
    sublocation: 'Gion Hostel',
    created: '2026-03-10',
    opens: '2026-04-10',
    people: [{ name: 'Mia C.', initial: 'M' }, { name: 'Leo W.', initial: 'L' }],
  },
  {
    id: '3',
    location: 'Sydney',
    sublocation: 'Bondi Beach Hostel',
    created: '2026-05-01',
    opens: '2026-06-01',
    people: [{ name: 'Yuki N.', initial: 'Y' }, { name: 'James K.', initial: 'J' }],
  },
]

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Capsules() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <Link href="/" className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>back</Link>
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-10 pb-4">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Capsules</span>
        <h2 className="text-2xl font-extralight mt-2">Your memories.</h2>
      </div>

      <div className="flex-1 px-8 flex flex-col gap-3 pt-4">
        {CAPSULES.map((capsule) => {
          const days = daysUntil(capsule.opens)
          const isOpen = days <= 0
          const opensToday = days === 0

          return (
            <Link
              key={capsule.id}
              href={`/capsules/${capsule.id}`}
              className="block p-5 rounded-lg transition-all duration-300"
              style={{
                background: '#0f1424',
                border: isOpen ? '1px solid #2a3050' : '1px solid #1e2438',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-light text-base" style={{color:'#e8e4d9'}}>{capsule.location}</p>
                  <p className="text-xs mt-0.5" style={{color:'#4a5068'}}>{capsule.sublocation}</p>
                </div>
                <div>
                  {opensToday && (
                    <span className="text-xs tracking-[0.1em] uppercase px-2 py-1 rounded-full" style={{background:'rgba(201,169,110,0.1)', color:'#c9a96e', border:'1px solid rgba(201,169,110,0.2)'}}>
                      Opens today
                    </span>
                  )}
                  {!isOpen && !opensToday && (
                    <span className="text-xs" style={{color:'#4a5068'}}>
                      {days}d
                    </span>
                  )}
                  {isOpen && !opensToday && (
                    <span className="text-xs tracking-[0.1em] uppercase" style={{color:'#2a3050'}}>
                      Open
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-light" style={{background:'#1e2438', color:'#c9a96e', border:'1px solid #2a3050'}}>D</div>
                  {capsule.people.map((p) => (
                    <div key={p.name} className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-light" style={{background:'#1e2438', color:'#4a5068', border:'1px solid #1e2438'}}>
                      {p.initial}
                    </div>
                  ))}
                </div>
                <span className="text-xs" style={{color:'#2a3050'}}>{formatDate(capsule.created)}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <Navbar active="capsules" />
    </main>
  )
}
