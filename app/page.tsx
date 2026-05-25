'use client'
import Link from 'next/link'
import Navbar from './components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <div className="w-8" />
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <Link href="/account" className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{border:'1px solid #2a3050', color:'#4a5068'}}>D</Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Melbourne · May 2026</span>
        <div className="flex flex-col gap-2">
          <h2 className="text-[2.5rem] font-extralight leading-tight">1 month later,</h2>
          <h2 className="text-[2.5rem] font-extralight leading-tight">{"who's beside you?"}</h2>
        </div>
        <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>
          Voice. Photo. Video.<br />One take. No edits.<br />Only people you actually met.
        </p>
        <Link
          href="/capsule"
          className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4 block"
          style={{border:'1px solid #c9a96e', color:'#c9a96e'}}
        >
          Take a Capsule
        </Link>
      </div>

      <div className="px-8 pb-4">
        <Link href="/capsules" className="flex items-center justify-between py-4" style={{borderTop:'1px solid #1e2438'}}>
          <span className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>Your capsules</span>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{color:'#c9a96e'}}>3</span>
            <span className="text-xs" style={{color:'#2a3050'}}>→</span>
          </div>
        </Link>
      </div>

      <Navbar active="home" />
    </main>
  )
}
