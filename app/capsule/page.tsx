'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'voice' | 'photo' | 'video' | 'register' | 'tag' | 'seal' | 'done'

export default function Capsule() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('voice')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tag, setTag] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [videoPreviewActive, setVideoPreviewActive] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const videoChunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoRecordRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)

  const steps: Step[] = ['voice', 'photo', 'video', 'register', 'tag', 'seal']
  const currentIndex = steps.indexOf(step as 'voice' | 'photo' | 'video' | 'register' | 'tag' | 'seal')

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

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(console.error)
    }
  }, [cameraActive])

  useEffect(() => {
    if (videoPreviewActive && videoRecordRef.current && videoStreamRef.current) {
      videoRecordRef.current.srcObject = videoStreamRef.current
      videoRecordRef.current.play().catch(console.error)
    }
  }, [videoPreviewActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      setCameraActive(true)
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) setPhotoBlob(blob)
    }, 'image/jpeg')
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      videoStreamRef.current = stream
      setVideoPreviewActive(true)
      const mediaRecorder = new MediaRecorder(stream)
      videoMediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []
      mediaRecorder.ondataavailable = (e) => videoChunksRef.current.push(e.data)
      mediaRecorder.onstop = () => {
        setVideoBlob(new Blob(videoChunksRef.current, { type: 'video/webm' }))
        stream.getTracks().forEach(t => t.stop())
        setVideoPreviewActive(false)
      }
      mediaRecorder.start()
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop()
      }, 10000)
    } catch (err) {
      console.error('Video error:', err)
    }
  }

  const stopVideoRecording = () => {
    videoMediaRecorderRef.current?.stop()
  }

  const btn = (label: string, onClick: () => void, active = true) => (
    <button
      onClick={onClick}
      className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4"
      style={{
        border: active ? '1px solid #c9a96e' : '1px solid #1e2438',
        color: active ? '#c9a96e' : '#2a3050',
      }}
    >
      {label}
    </button>
  )

  return (
    <main className="min-h-screen flex flex-col" style={{background:'#0a0e1a', color:'#e8e4d9'}}>
      <div className="flex items-center justify-between px-8 pt-14 pb-8" style={{borderBottom:'1px solid #1e2438'}}>
        {step !== 'done' ? (
          <button onClick={() => router.back()} className="text-xs tracking-[0.15em] uppercase" style={{color:'#4a5068'}}>back</button>
        ) : (
          <div className="w-8" />
        )}
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      {step !== 'done' && (
        <div className="flex gap-px px-8 mt-6 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="h-px flex-1 transition-all duration-700"
              style={{background: i <= currentIndex ? '#c9a96e' : '#1e2438'}} />
          ))}
        </div>
      )}

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
              borderRadius: recording ? '3px' : '50%',
            }} />
          </button>
          <p className="text-xs" style={{color:'#2a3050'}}>{recording ? 'tap to stop' : 'tap to record'}</p>
          {audioBlob && !recording && btn('Continue', () => setStep('photo'))}
        </div>
      )}

      {step === 'photo' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Photo</span>
          <h2 className="text-3xl font-extralight">{"Who's beside you?"}</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>One shot. Make it real.</p>
          {!cameraActive && !photoBlob && (
            <button
              onClick={startCamera}
              className="w-20 h-20 rounded-full flex items-center justify-center mt-4 transition-all duration-300"
              style={{border:'1px solid #2a3050'}}
            >
              <div className="w-6 h-6 rounded" style={{border:'1px solid #4a5068'}} />
            </button>
          )}
          {cameraActive && (
            <div className="flex flex-col items-center gap-6">
              <video ref={videoRef} autoPlay playsInline muted style={{width:'260px', height:'260px', objectFit:'cover', borderRadius:'4px'}} />
              <button onClick={takePhoto} className="w-14 h-14 rounded-full flex items-center justify-center transition-all" style={{border:'1px solid #c9a96e'}}>
                <div className="w-2 h-2 rounded-full" style={{background:'#c9a96e'}} />
              </button>
            </div>
          )}
          {photoBlob && (
            <div className="flex flex-col items-center gap-6">
              <img src={URL.createObjectURL(photoBlob)} style={{width:'260px', height:'260px', objectFit:'cover', borderRadius:'4px'}} alt="captured" />
              {btn('Continue', () => setStep('video'))}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {step === 'video' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Video</span>
          <h2 className="text-3xl font-extralight">Last one.</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>10 seconds. Just be here.</p>
          {!videoPreviewActive && !videoBlob && (
            <button
              onClick={startVideoRecording}
              className="w-20 h-20 rounded-full flex items-center justify-center mt-4 transition-all duration-300"
              style={{border:'1px solid #2a3050'}}
            >
              <div className="w-3 h-3 rounded-full" style={{background:'#c9a96e'}} />
            </button>
          )}
          {videoPreviewActive && (
            <div className="flex flex-col items-center gap-6">
              <video ref={videoRecordRef} autoPlay playsInline muted style={{width:'260px', height:'260px', objectFit:'cover', borderRadius:'4px'}} />
              <button onClick={stopVideoRecording} className="w-14 h-14 rounded-full flex items-center justify-center" style={{border:'1px solid #c9a96e'}}>
                <div className="w-4 h-4 rounded-sm" style={{background:'#c9a96e'}} />
              </button>
              <p className="text-xs" style={{color:'#2a3050'}}>tap to stop · auto stops at 10s</p>
            </div>
          )}
          {videoBlob && !videoPreviewActive && (
            <div className="flex flex-col items-center gap-6">
              <video src={URL.createObjectURL(videoBlob)} controls style={{width:'260px', height:'260px', objectFit:'cover', borderRadius:'4px'}} />
              {btn('Continue', () => setStep('register'))}
            </div>
          )}
        </div>
      )}

      {step === 'register' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Almost there</span>
          <h2 className="text-3xl font-extralight">Who are you?</h2>
          <p className="text-sm" style={{color:'#4a5068'}}>So we know where to send it.</p>
          <div className="flex flex-col gap-6 w-64 mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              className="bg-transparent text-center text-base pb-3 outline-none transition-colors"
              style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              className="bg-transparent text-center text-base pb-3 outline-none transition-colors"
              style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}}
            />
          </div>
          {btn('Continue', () => setStep('tag'), !!(name.trim() && email.trim()))}
        </div>
      )}

      {step === 'tag' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Tag</span>
          <h2 className="text-3xl font-extralight">Anyone beside you?</h2>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>
            {"If they're already on beside, tag them. They need to confirm they were actually there."}
          </p>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="name or email"
            className="bg-transparent text-center text-base pb-3 w-64 outline-none transition-colors mt-4"
            style={{borderBottom:'1px solid #2a3050', color:'#e8e4d9'}}
          />
          {btn(tag.trim() ? 'Add & Continue' : 'Skip', () => setStep('seal'))}
        </div>
      )}

      {step === 'seal' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Ready</span>
          <h2 className="text-3xl font-extralight">Seal it.</h2>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>
            In 1 month, everyone in this capsule gets a notification. No edits. No deletes.
          </p>
          <p className="text-xs" style={{color:'#2a3050'}}>Allow notifications to seal.</p>
          {btn('Seal the Capsule', () => {
            Notification.requestPermission().then((p) => {
              if (p === 'granted') setStep('done')
            })
          })}
        </div>
      )}

      {step === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{border:'1px solid #c9a96e'}}>
            <div className="w-2 h-2 rounded-full" style={{background:'#c9a96e'}} />
          </div>
          <span className="text-xs tracking-[0.2em] uppercase" style={{color:'#c9a96e'}}>Sealed</span>
          <h2 className="text-3xl font-extralight">See you in 1 month.</h2>
          <p className="text-sm leading-relaxed max-w-[260px]" style={{color:'#4a5068'}}>
            Your capsule is sealed. A notification arrives in 1 month. Until then, it stays closed.
          </p>
          <button
            onClick={() => router.push('/capsules')}
            className="text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4"
            style={{border:'1px solid #2a3050', color:'#4a5068'}}
          >
            View your capsules
          </button>
        </div>
      )}
    </main>
  )
}
