import Link from 'next/link'
import Navbar from '../components/Navbar'

const CONNECTIONS = [
  { name: 'Sara K.', initial: 'S', met: 'Melbourne', when: 'Apr 25', latestCapsule: 'Berlin · 3 days ago', capsuleId: '1' },
  { name: 'Tom B.', initial: 'T', met: 'Melbourne', when: 'Apr 25', latestCapsule: 'Amsterdam · 1 week ago', capsuleId: '1' },
  { name: 'Mia C.', initial: 'M', met: 'Kyoto', when: 'Mar 10', latestCapsule: 'London · 2 weeks ago', capsuleId: '2' },
  { name: 'Leo W.', initial: 'L', met: 'Kyoto', when: 'Mar 10', latestCapsule: 'Paris · 5 days ago', capsuleId: '2' },
  { name: 'Yuki N.', initial: 'Y', met: 'Sydney', when: 'May 1', latestCapsule: null, capsuleId: '3' },
  { name: 'James K.', initial: 'J', met: 'Sydney', when: 'May 1', latestCapsule: null, capsuleId: '3' },
]

export default function Account() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <div className="w-8" />
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-10">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Account</span>
        <div className="flex items-center gap-4 mt-6 mb-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-light" style={{border:'1px solid #2a3050', color:'#c9a96e'}}>D</div>
          <div>
            <p className="font-light text-base">Daichi</p>
            <p className="text-xs mt-1" style={{color:'#4a5068'}}>daichi@email.com</p>
            <p className="text-xs mt-0.5" style={{color:'#2a3050'}}>3 capsules · 6 connections</p>
          </div>
        </div>

        <div style={{borderBottom:'1px solid #1e2438'}} className="mb-8" />

        <div className="mb-2 flex items-end justify-between">
          <p className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>Connections</p>
          <p className="text-xs" style={{color:'#2a3050'}}>met in person only</p>
        </div>
        <p className="text-xs mb-6 leading-relaxed" style={{color:'#2a3050'}}>
          {"You can only follow people you've physically met. These are yours."}
        </p>

        <div className="flex flex-col gap-2">
          {CONNECTIONS.map((c) => (
            <Link key={c.name} href={`/capsules/${c.capsuleId}`} className="flex items-center justify-between p-4 rounded-lg transition-all" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{background:'#1e2438', color:'#e8e4d9', border:'1px solid #2a3050'}}>
                  {c.initial}
                </div>
                <div>
                  <p className="text-sm font-light">{c.name}</p>
                  <p className="text-xs mt-0.5" style={{color:'#4a5068'}}>
                    Met in {c.met} · {c.when}
                  </p>
                  {c.latestCapsule && (
                    <p className="text-xs mt-0.5" style={{color:'#c9a96e'}}>{c.latestCapsule}</p>
                  )}
                  {!c.latestCapsule && (
                    <p className="text-xs mt-0.5" style={{color:'#2a3050'}}>No new capsule yet</p>
                  )}
                </div>
              </div>
              <span className="text-xs flex-shrink-0 ml-2" style={{color:'#2a3050'}}>→</span>
            </Link>
          ))}
        </div>

        <div style={{borderBottom:'1px solid #1e2438'}} className="mt-10 mb-6" />

        <div className="flex flex-col gap-0">
          {[
            { label: 'Notifications', sub: 'Manage when beside reaches you' },
            { label: 'Privacy', sub: 'Who can tag you in capsules' },
          ].map((item) => (
            <div key={item.label} className="py-4 flex items-center justify-between" style={{borderBottom:'1px solid #1e2438'}}>
              <div>
                <p className="text-sm font-light">{item.label}</p>
                <p className="text-xs mt-0.5" style={{color:'#4a5068'}}>{item.sub}</p>
              </div>
              <span className="text-xs" style={{color:'#2a3050'}}>→</span>
            </div>
          ))}
          <div className="py-4" style={{borderBottom:'1px solid #1e2438'}}>
            <p className="text-sm" style={{color:'#c9a96e'}}>Sign out</p>
          </div>
          <div className="py-4">
            <p className="text-xs" style={{color:'#2a3050'}}>Delete account</p>
          </div>
        </div>
      </div>

      <Navbar active="account" />
    </main>
  )
}
