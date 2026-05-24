'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <h1 className="text-2xl font-light tracking-widest">beside</h1>
        <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center">
          <span className="text-xs text-gray-400">D</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs text-gray-600 tracking-widest uppercase mb-6">Melbourne · May 2025</p>
        <h2 className="text-4xl font-light mb-3">1 month later,</h2>
        <h2 className="text-4xl font-light mb-10">who's beside you?</h2>
        <p className="text-sm text-gray-500 mb-16 leading-relaxed max-w-xs">
          A one-time capsule. Voice, photo, video.<br />
          No edits. No filters. Just the moment.
        </p>
        <button
          onClick={() => router.push('/capsule')}
          className="border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 mb-4"
        >
          Take a Capsule
        </button>
        <p className="text-xs text-gray-700">Scan QR at your hostel to begin</p>
      </div>

      <div className="border-t border-gray-900 px-6 py-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <button className="flex flex-col items-center gap-2 text-gray-600 hover:text-white transition-colors">
            <span className="text-lg">◎</span>
            <span className="text-xs">Map</span>
          </button>
          <button onClick={() => router.push('/capsule')} className="flex flex-col items-center gap-2 text-gray-600 hover:text-white transition-colors">
            <span className="text-lg">⊡</span>
            <span className="text-xs">Capsules</span>
          </button>
          <button className="flex flex-col items-center gap-2 text-gray-600 hover:text-white transition-colors">
            <span className="text-lg">◈</span>
            <span className="text-xs">Guide</span>
          </button>
          <button className="flex flex-col items-center gap-2 text-gray-600 hover:text-white transition-colors">
            <span className="text-lg">◯</span>
            <span className="text-xs">Account</span>
          </button>
        </div>
      </div>
    </main>
  )
}