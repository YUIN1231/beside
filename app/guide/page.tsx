export default function Guide() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-6 pt-12 pb-6">
        <h1 className="text-sm font-light tracking-widest text-gray-400">beside</h1>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-8">
        <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Guide</p>
        <h2 className="text-3xl font-light mb-12">How it works.</h2>
        <div className="space-y-8">
          <div className="border-b border-gray-900 pb-8">
            <p className="text-xs text-gray-600 mb-2">01</p>
            <p className="font-light mb-1">Scan the QR</p>
            <p className="text-sm text-gray-600">At your hostel. Takes 10 seconds.</p>
          </div>
          <div className="border-b border-gray-900 pb-8">
            <p className="text-xs text-gray-600 mb-2">02</p>
            <p className="font-light mb-1">Take a capsule</p>
            <p className="text-sm text-gray-600">Voice. Photo. Video. One take each.</p>
          </div>
          <div className="border-b border-gray-900 pb-8">
            <p className="text-xs text-gray-600 mb-2">03</p>
            <p className="font-light mb-1">Seal it</p>
            <p className="text-sm text-gray-600">Cannot be edited. Cannot be deleted.</p>
          </div>
          <div className="pb-8">
            <p className="text-xs text-gray-600 mb-2">04</p>
            <p className="font-light mb-1">1 month later</p>
            <p className="text-sm text-gray-600">{"A notification arrives. Who's beside you now?"}</p>
          </div>
        </div>
      </div>
    </main>
  )
}