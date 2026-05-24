export default function Account() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-6 pt-12 pb-6">
        <h1 className="text-sm font-light tracking-widest text-gray-400">beside</h1>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-8">
        <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Account</p>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center">
            <span className="text-xl text-gray-400">D</span>
          </div>
          <div>
            <p className="font-light">Your Name</p>
            <p className="text-sm text-gray-600">your@email.com</p>
          </div>
        </div>
        <div className="space-y-0">
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400">Notifications</p>
          </div>
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400">Privacy</p>
          </div>
          <div className="border-b border-gray-900 py-4">
            <p className="text-sm text-gray-400">Delete account</p>
          </div>
          <div className="py-4">
            <p className="text-sm text-red-900">Sign out</p>
          </div>
        </div>
      </div>
    </main>
  )
}