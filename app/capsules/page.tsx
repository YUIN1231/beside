'use client'
import Navbar from '../components/Navbar'

export default function Capsules() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <button onClick={() => window.history.back()} className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>back</button>
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Capsules</span>
        <h2 className="text-3xl font-extralight">Your capsules.</h2>
        <p className="text-sm" style={{color:'#4a5068'}}>No capsules yet.</p>
      </div>
      <Navbar active="capsules" />
    </main>
  )
}