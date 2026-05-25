import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Guide() {
  return (
    <main className="min-h-screen flex flex-col pb-20" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        <div className="w-8" />
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="px-8 pt-10 pb-4">
        <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Guide</span>
        <h2 className="text-2xl font-extralight mt-2">How it works.</h2>
      </div>

      <div className="px-8 pt-6 flex flex-col gap-0">
        {[
          {
            n: '01',
            title: 'Meet someone in real life',
            body: 'At a hostel, a café, on a train. Scan the QR code at the venue, or share your beside link.',
          },
          {
            n: '02',
            title: 'Take a capsule together',
            body: 'Voice. Photo. Video. One take each. No edits, no filters. 60 seconds total.',
          },
          {
            n: '03',
            title: 'They confirm they were there',
            body: "Everyone tagged in the capsule needs to accept. You can't add someone who wasn't beside you.",
          },
          {
            n: '04',
            title: 'Seal it',
            body: 'Cannot be edited. Cannot be deleted. It lives exactly as it was.',
          },
          {
            n: '05',
            title: '1 month later',
            body: "A notification arrives: who's beside you now? Your capsule unlocks. You see theirs.",
          },
          {
            n: '06',
            title: 'Only real connections stay',
            body: "You can follow someone's journey only if you've physically been in the same capsule. No strangers. No algorithms.",
          },
        ].map((step, i, arr) => (
          <div key={step.n} className="flex gap-5 pb-8" style={{borderBottom: i < arr.length - 1 ? '1px solid #1e2438' : 'none', marginBottom: i < arr.length - 1 ? '0' : '0', paddingTop: i > 0 ? '28px' : '0'}}>
            <span className="text-xs flex-shrink-0 mt-0.5" style={{color:'#2a3050', width:'20px'}}>{step.n}</span>
            <div>
              <p className="font-light mb-1" style={{color:'#e8e4d9'}}>{step.title}</p>
              <p className="text-sm leading-relaxed" style={{color:'#4a5068'}}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-8 mt-8 p-5 rounded-lg" style={{background:'#0f1424', border:'1px solid #1e2438'}}>
        <p className="text-xs tracking-[0.15em] uppercase mb-2" style={{color:'#c9a96e'}}>The idea</p>
        <p className="text-sm font-extralight leading-relaxed" style={{color:'#e8e4d9'}}>
          Social media lets you follow anyone. beside lets you follow only the people who were actually beside you.
        </p>
      </div>

      <div className="px-8 mt-8">
        <Link
          href="/capsule"
          className="block text-center text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500"
          style={{border:'1px solid #c9a96e', color:'#c9a96e'}}
        >
          Take a Capsule
        </Link>
      </div>

      <Navbar active="guide" />
    </main>
  )
}
