import Navbar from '../components/Navbar'

export default function Map() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-8 pt-14 pb-8 border-b border-gray-900">
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Map</span>
        <h2 className="text-3xl font-extralight">Where is everyone?</h2>
        <p className="text-sm text-gray-700">Coming soon.</p>
      </div>
      <Navbar active="map" />
    </main>
  )
}