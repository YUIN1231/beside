export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <h1 className="text-2xl font-light tracking-widest">beside</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-4xl font-light mb-10">{"who's beside you?"}</h2>
        <a href="/capsule" className="border border-white text-white text-sm px-10 py-4 rounded-full">
          Take a Capsule
        </a>
      </div>
    </main>
  )
}