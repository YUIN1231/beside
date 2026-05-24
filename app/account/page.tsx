import Navbar from '../components/Navbar'

export default function Account() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-8 pt-14 pb-8 border-b border-gray-900">
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
      </div>
      <div className="flex-1 flex flex-col px-8 pt-10">
        <span className="text-xs tracking-[0.2em] text-gray-600 uppercase mb-8">Account</span>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 rounded-full border border-gray-800 flex items-center justify-center">
            <span className="text-lg text-gray-500">D</span>
          </div>
          <div>
            <p className="font-light">Your Name</p>
            <p className="text-xs text-gray-600 mt-1">your@email.com</p>
          </div>
        </div>
        <div>
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400 tracking-wide">Notifications</p>
          </div>
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400 tracking-wide">Privacy</p>
          </div>
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400 tracking-wide">Delete account</p>
          </div>
          <div className="py-4">
            <p className="text-sm text-red-800 tracking-wide">Sign out</p>
          </div>
        </div>
      </div>
      <Navbar active="account" />
    </main>
  )
}