'use client'
import { useState } from 'react'
import Navbar from './components/Navbar'

type Step = 'home' | 'voice' | 'photo' | 'video' | 'register' | 'tag' | 'seal' | 'done'

export default function Home() {
  const [step, setStep] = useState<Step>('home')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [videoPreviewActive, setVideoPreviewActive] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tag, setTag] = useState('')

  const mediaRecorderRef = { current: null as MediaRecorder | null }
  const videoMediaRecorderRef = { current: null as MediaRecorder | null }
  const chunksRef = { current: [] as Blob[] }
  const videoChunksRef = { current: [] as Blob[] }

  const capsuleSteps = ['voice', 'photo', 'video', 'register', 'tag', 'seal']
  const currentIndex = capsuleSteps.indexOf(step)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = () => {
      setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
      stream.getTracks().forEach(t => t.stop())
    }
    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{background:'#0a0e1a', color:'#e8e4d9'}}>

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        {step !== 'home' && step !== 'done' ? (
          <button onClick={() => setStep('home')} className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>back</button>
        ) : (
          <div className="w-8" />
        )}
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <button onClick={() => window.location.href = '/account'} className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{border:'1px solid #2a3050', color:'#4a5068'}}>D</button>
      </div>

      {/* プログレスバー */}
      {step !== 'home' && step !== 'done' && (
        <div className="flex gap-px px-8 mt-6 mb-2">
          {capsuleSteps.map((s, i) => (
            <div key={s} className="h-px flex-1 transition-all duration-700" style={{background: i <= currentIndex ? '#c9a96e' : '#1e2438'}} />
          ))}
        </div>
      )}

      {/* ホーム */}
      {step === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Melbourne · May 2025</span>
          <div className="flex flex-col gap-2">
            <h2 className="text-[2.5rem] font-extralight leading-tight">1 month later,</h2>
            <h2 className="text-[2.5rem] font-extralight leading-tight">{"who's beside you?"}</h2>
          </div>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>
            Voice. Photo. Video.<br />One take. No edits.
          </p>
          <button
            onClick={() => setStep('voice')}
            className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4"
            style={{border:'1px solid #c9a96e', color:'#c9a96e'}}
          >
            Take a Capsule
          </button>
        </div>
      )}

      {/* Voice */}
      {step === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Voice</span>
          <h2 className="text-3xl font-extralight">Say something.</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>One take. No edits.</p>
          <button
            onClick={recording ? stopRecording : startRecording}
            className="w-20 h-20 rounded-full flex items-center justify-center mt-4 transition-all duration-300"
            style={{border: recording ? '1px solid #c9a96e' : '1px solid #2a3050'}}
          >
            <div className="transition-all duration-300" style={{
              background:'#c9a96e',
              width: recording ? '20px' : '12px',
              height: recording ? '20px' : '12px',
              borderRadius: recording ? '3px' : '50%'
            }} />
          </button>
          <p className="text-xs" style={{color:'#2a3050'}}>{recording ? 'tap to stop' : 'tap to record'}</p>
          {audioBlob && !recording && (
            <button onClick={() => setStep('photo')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #c9a96e', color:'#c9a96e'}}>
              Continue
            </button>
          )}
        </div>
      )}

      {/* Photo */}
      {step === 'photo' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Photo</span>
          <h2 className="text-3xl font-extralight">{"Who's beside you?"}</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>One shot. Make it real.</p>
          {!photoBlob && (
            <button onClick={() => setStep('video')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #2a3050', color:'#4a5068'}}>
              tap to shoot
            </button>
          )}
          {photoBlob && (
            <button onClick={() => setStep('video')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #c9a96e', color:'#c9a96e'}}>
              Continue
            </button>
          )}
        </div>
      )}

      {/* Video */}
      {step === 'video' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Video</span>
          <h2 className="text-3xl font-extralight">Last one.</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>10 seconds. Just be here.</p>
          {!videoBlob && (
            <button onClick={() => setStep('register')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #2a3050', color:'#4a5068'}}>
              tap to record
            </button>
          )}
          {videoBlob && (
            <button onClick={() => setStep('register')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #c9a96e', color:'#c9a96e'}}>
              Continue
            </button>
          )}
        </div>
      )}

      {/* Register */}
      {step === 'register' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Almost there</span>
          <h2 className="text-3xl font-extralight">Who are you?</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>So we know where to send it.</p>
          <div className="flex flex-col gap-6 w-64 mt-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" className="bg-transparent text-center text-base pb-3 outline-none transition-colors" style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" className="bg-transparent text-center text-base pb-3 outline-none transition-colors" style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}} />
          </div>
          <button onClick={() => (name.trim() && email.trim()) && setStep('tag')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border: name.trim() && email.trim() ? '1px solid #c9a96e' : '1px solid #1e2438', color: name.trim() && email.trim() ? '#c9a96e' : '#2a3050'}}>
            Continue
          </button>
        </div>
      )}

      {/* Tag */}
      {step === 'tag' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Tag</span>
          <h2 className="text-3xl font-extralight">Anyone to add?</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>{"If they're on beside, tag them."}</p>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="name or email" className="bg-transparent text-center text-base pb-3 w-64 outline-none transition-colors mt-4" style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}} />
          <button onClick={() => setStep('seal')} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #c9a96e', color:'#c9a96e'}}>
            {tag.trim() ? 'Add & Continue' : 'Skip'}
          </button>
        </div>
      )}

      {/* Seal */}
      {step === 'seal' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Ready</span>
          <h2 className="text-3xl font-extralight">Seal it.</h2>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>In 1 month, everyone in this capsule will get a notification.</p>
          <button onClick={() => { Notification.requestPermission().then((p) => { if (p === 'granted') setStep('done') }) }} className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4" style={{border:'1px solid #c9a96e', color:'#c9a96e'}}>
            Seal the Capsule
          </button>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Sealed</span>
          <h2 className="text-3xl font-extralight">See you in 1 month.</h2>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>Your capsule is sealed. A notification will arrive in 1 month.</p>
        </div>
      )}

      <Navbar active="home" />
    </main>
  )
}