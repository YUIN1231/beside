'use client'
import Navbar from './components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-8 pt-14 pb-8 border-b border-gray-900">
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <button onClick={() => window.location.href = '/account'} className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-xs text-gray-500">
          D
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Melbourne · May 2025</span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-[2.5rem] font-extralight leading-tight">1 month later,</h2>
          <h2 className="text-[2.5rem] font-extralight leading-tight">{"who's beside you?"}</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed max-w-[260px]">
          Voice. Photo. Video.<br />One take. No edits.
        </p>
        <div className="flex flex-col items-center gap-3 mt-4">
          <button
            onClick={() => window.location.href = '/capsule'}
            className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500"
          >
            Take a Capsule
          </button>
          <span className="text-xs text-gray-800">Scan QR at your hostel to begin</span>
        </div>
      </div>

      <Navbar active="home" />
    </main>
  )
}