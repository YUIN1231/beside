'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const CAPSULES = [
  {
    id: '1',
    location: 'Melbourne',
    sublocation: 'Luna Park Hostel',
    created: '2026-04-25',
    opens: '2026-05-25',
    people: [
      { name: 'Sara K.', initial: 'S', latestCapsule: 'Berlin · 3 days ago' },
      { name: 'Tom B.', initial: 'T', latestCapsule: 'Amsterdam · 1 week ago' },
    ],
  },
  {
    id: '2',
    location: 'Kyoto',
    sublocation: 'Gion Hostel',
    created: '2026-03-10',
    opens: '2026-04-10',
    people: [
      { name: 'Mia C.', initial: 'M', latestCapsule: 'London · 2 weeks ago' },
      { name: 'Leo W.', initial: 'L', latestCapsule: 'Paris · 5 days ago' },
    ],
  },
  {
    id: '3',
    location: 'Sydney',
    sublocation: 'Bondi Beach Hostel',
    created: '2026-05-01',
    opens: '2026-06-01',
    people: [
      { name: 'Yuki N.', initial: 'Y', latestCapsule: null },
      { name: 'James K.', initial: 'J', latestCapsule: null },
    ],
  },
]

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function CapsuleDetail() {
  const params = useParams()
  const id = params.id as string
  const capsule = CAPSULES.find(c => c.id === id)

  if (!capsule) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center" style={{background:'#0a0e1a', color:'#4a5068'}}>
        <p className="text-sm">Capsule not found.</p>
        <Link href="/capsules" className="text-xs mt-4" style={{color:'#c9a96e'}}>← Back</Link>
      </main>
    )
  }

  const days = daysUntil(capsule.opens)
  const isOpen = days <= 0

  return (
    <main className="min-h-screen flex flex-col pb-12" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <Link href="/capsules" className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>back</Link>
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-10">
        <div className="flex items-center gap-2 mb-6">
          {isOpen ? (
            <span className="text-xs tracking-[0.1em] uppercase px-2 py-1 rounded-full" style={{background:'rgba(201,169,110,0.08)', color:'#c9a96e', border:'1px solid rgba(201,169,110,0.2)'}}>
              Open
            </span>
          ) : (
            <span className="text-xs tracking-[0.1em] uppercase px-2 py-1 rounded-full" style={{background:'rgba(42,48,80,0.4)', color:'#4a5068', border:'1px solid #1e2438'}}>
              Sealed
            </span>
          )}
        </div>

        <h2 className="text-2xl font-extralight">{capsule.location}</h2>
        <p className="text-xs mt-1" style={{color:'#4a5068'}}>{capsule.sublocation}</p>
        <p className="text-xs mt-0.5" style={{color:'#2a3050'}}>{formatDate(capsule.created)}</p>

        <div className="mt-8 mb-8" style={{borderBottom:'1px solid #1e2438'}} />

        <p className="text-xs tracking-[0.15em] uppercase mb-4" style={{color:'#4a5068'}}>With</p>
        <div className="flex gap-3 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs" style={{background:'#1e2438', color:'#c9a96e', border:'1px solid #2a3050'}}>D</div>
            <span className="text-xs" style={{color:'#4a5068'}}>You</span>
          </div>
          {capsule.people.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs" style={{background:'#1e2438', color:'#e8e4d9', border:'1px solid #1e2438'}}>
                {p.initial}
              </div>
              <span className="text-xs" style={{color:'#4a5068'}}>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {!isOpen && (
          <div className="flex flex-col items-center py-12 gap-4" style={{border:'1px solid #1e2438', borderRadius:'8px', background:'#0f1424'}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{border:'1px solid #2a3050'}}>
              <div className="w-2 h-2 rounded-full" style={{background:'#2a3050'}} />
            </div>
            <p className="text-2xl font-extralight" style={{color:'#e8e4d9'}}>{Math.abs(days)}d</p>
            <p className="text-xs" style={{color:'#4a5068'}}>until this opens</p>
            <p className="text-xs text-center max-w-[200px] leading-relaxed mt-2" style={{color:'#2a3050'}}>
              Voice, photo, and video are locked until {formatDate(capsule.opens)}.
            </p>
          </div>
        )}

        {isOpen && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
              <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{color:'#4a5068'}}>Voice</p>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{border:'1px solid #c9a96e'}}>
                  <div className="w-0 h-0" style={{borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderLeft:'8px solid #c9a96e', marginLeft:'2px'}} />
                </button>
                <div className="flex-1 h-px" style={{background:'#1e2438'}} />
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
              <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{color:'#4a5068'}}>Photo</p>
              <div className="w-full aspect-square rounded flex items-center justify-center" style={{background:'#1e2438'}}>
                <span className="text-xs" style={{color:'#2a3050'}}>photo from {formatDate(capsule.created)}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
              <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{color:'#4a5068'}}>Video</p>
              <div className="w-full aspect-square rounded flex items-center justify-center" style={{background:'#1e2438'}}>
                <button className="w-14 h-14 rounded-full flex items-center justify-center" style={{border:'1px solid #4a5068'}}>
                  <div className="w-0 h-0" style={{borderTop:'7px solid transparent', borderBottom:'7px solid transparent', borderLeft:'11px solid #4a5068', marginLeft:'3px'}} />
                </button>
              </div>
            </div>
          </div>
        )}

        {isOpen && (
          <>
            <div className="mt-8 mb-6" style={{borderBottom:'1px solid #1e2438'}} />
            <p className="text-xs tracking-[0.15em] uppercase mb-4" style={{color:'#4a5068'}}>{"Where are they now?"}</p>
            <p className="text-xs mb-5 leading-relaxed" style={{color:'#2a3050'}}>
              {"You met these people in person. You can follow their journey."}
            </p>
            <div className="flex flex-col gap-3">
              {capsule.people.map((p) => (
                <div key={p.name} className="flex items-center justify-between p-4 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{background:'#1e2438', color:'#e8e4d9', border:'1px solid #2a3050'}}>
                      {p.initial}
                    </div>
                    <div>
                      <p className="text-sm font-light">{p.name}</p>
                      {p.latestCapsule && (
                        <p className="text-xs mt-0.5" style={{color:'#4a5068'}}>{p.latestCapsule}</p>
                      )}
                      {!p.latestCapsule && (
                        <p className="text-xs mt-0.5" style={{color:'#2a3050'}}>No new capsule yet</p>
                      )}
                    </div>
                  </div>
                  {p.latestCapsule && (
                    <span className="text-xs" style={{color:'#c9a96e'}}>→</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
