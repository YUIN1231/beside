'use client'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const LOCATIONS = [
  { id: '1', city: 'Melbourne', country: 'Australia', date: 'Apr 25, 2026', people: 2, isOpen: true },
  { id: '3', city: 'Sydney', country: 'Australia', date: 'May 1, 2026', people: 2, isOpen: false },
  { id: '2', city: 'Kyoto', country: 'Japan', date: 'Mar 10, 2026', people: 2, isOpen: true },
]

export default function Map() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <div className="w-8" />
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-10 pb-4">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Map</span>
        <h2 className="text-2xl font-extralight mt-2">Where you{"'ve"} been.</h2>
      </div>

      <div className="px-8 pt-4">
        <div className="relative py-6">
          {LOCATIONS.map((loc, i) => (
            <Link key={loc.id} href={`/capsules/${loc.id}`} className="flex items-start gap-5 mb-8 last:mb-0">
              <div className="flex flex-col items-center flex-shrink-0" style={{width:'20px'}}>
                <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{
                  background: loc.isOpen ? '#c9a96e' : 'transparent',
                  border: loc.isOpen ? '1px solid #c9a96e' : '1px solid #2a3050',
                }} />
                {i < LOCATIONS.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{background:'#1e2438', minHeight:'32px'}} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-baseline justify-between">
                  <p className="font-light">{loc.city}</p>
                  <span className="text-xs" style={{color: loc.isOpen ? '#c9a96e' : '#2a3050'}}>
                    {loc.isOpen ? 'open' : 'sealed'}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{color:'#4a5068'}}>{loc.country}</p>
                <p className="text-xs mt-1" style={{color:'#2a3050'}}>{loc.date} · {loc.people + 1} people</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-8 mt-4 p-5 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
        <p className="text-xs tracking-[0.15em] uppercase mb-2" style={{color:'#4a5068'}}>The rule</p>
        <p className="text-sm font-extralight leading-relaxed" style={{color:'#e8e4d9'}}>
          {"You can only stay connected with people you've physically met. One shared capsule, one real connection."}
        </p>
      </div>

      <Navbar active="map" />
    </main>
  )
}
