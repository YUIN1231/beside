'use client'
import { useState, useRef, useEffect } from 'react'

type Step = 'voice' | 'photo' | 'video' | 'register' | 'tag' | 'seal'

export default function Capsule() {
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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
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
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        setVideoBlob(blob)
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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-8 pt-14 pb-8 border-b border-gray-900">
        <button onClick={() => window.location.href = '/'} className="text-xs text-gray-600 tracking-widest uppercase">back</button>
        <span className="text-lg font-light tracking-[0.3em]">beside</span>
        <div className="w-8" />
      </div>

      <div className="flex gap-px px-8 mt-6 mb-10">
        {steps.map((s, i) => (
          <div key={s} className={`h-px flex-1 transition-all duration-700 ${i <= steps.indexOf(step) ? 'bg-white' : 'bg-gray-900'}`} />
        ))}
      </div>

      {step === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Voice</span>
          <h2 className="text-3xl font-extralight">Say something.</h2>
          <p className="text-sm text-gray-700">One take. No edits.</p>
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full border flex items-center justify-center mt-4 transition-all duration-300 ${recording ? 'border-white' : 'border-gray-800 hover:border-gray-600'}`}
          >
            <div className={`bg-white transition-all duration-300 ${recording ? 'w-5 h-5 rounded-sm' : 'w-3 h-3 rounded-full'}`} />
          </button>
          <p className="text-xs text-gray-800">{recording ? 'tap to stop' : 'tap to record'}</p>
          {audioBlob && !recording && (
            <button onClick={() => setStep('photo')} className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500 mt-4">
              Continue
            </button>
          )}
        </div>
      )}

      {step === 'photo' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Photo</span>
          <h2 className="text-3xl font-extralight">{"Who's beside you?"}</h2>
          <p className="text-sm text-gray-700">One shot. Make it real.</p>
          {!cameraActive && !photoBlob && (
            <button onClick={startCamera} className="w-20 h-20 rounded-full border border-gray-800 flex items-center justify-center mt-4 hover:border-gray-600 transition-colors">
              <div className="w-6 h-6 rounded border border-gray-600" />
            </button>
          )}
          {cameraActive && (
            <div className="flex flex-col items-center gap-6">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '260px', height: '260px', objectFit: 'cover', borderRadius: '4px' }} />
              <button onClick={takePhoto} className="w-14 h-14 rounded-full border border-white flex items-center justify-center hover:bg-white transition-colors group">
                <div className="w-2 h-2 rounded-full bg-white group-hover:bg-black" />
              </button>
            </div>
          )}
          {photoBlob && (
            <div className="flex flex-col items-center gap-6">
              <img src={URL.createObjectURL(photoBlob)} style={{ width: '260px', height: '260px', objectFit: 'cover', borderRadius: '4px' }} alt="captured" />
              <button onClick={() => setStep('video')} className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500">
                Continue
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {step === 'video' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Video</span>
          <h2 className="text-3xl font-extralight">Last one.</h2>
          <p className="text-sm text-gray-700">10 seconds. Just be here.</p>
          {!videoPreviewActive && !videoBlob && (
            <button onClick={startVideoRecording} className="w-20 h-20 rounded-full border border-gray-800 flex items-center justify-center mt-4 hover:border-gray-600 transition-colors">
              <div className="w-3 h-3 rounded-full bg-white" />
            </button>
          )}
          {videoPreviewActive && (
            <div className="flex flex-col items-center gap-6">
              <video ref={videoRecordRef} autoPlay playsInline muted style={{ width: '260px', height: '260px', objectFit: 'cover', borderRadius: '4px' }} />
              <button onClick={stopVideoRecording} className="w-14 h-14 rounded-full border border-white flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-white" />
              </button>
              <p className="text-xs text-gray-800">tap to stop · auto stops at 10s</p>
            </div>
          )}
          {videoBlob && !videoPreviewActive && (
            <div className="flex flex-col items-center gap-6">
              <video src={URL.createObjectURL(videoBlob)} controls style={{ width: '260px', height: '260px', objectFit: 'cover', borderRadius: '4px' }} />
              <button onClick={() => setStep('register')} className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500">
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'register' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Almost there</span>
          <h2 className="text-3xl font-extralight">Who are you?</h2>
          <p className="text-sm text-gray-700">So we know where to send it.</p>
          <div className="flex flex-col gap-6 w-64 mt-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" className="bg-transparent border-b border-gray-800 text-white text-center text-base pb-3 outline-none placeholder-gray-800 focus:border-gray-600 transition-colors" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" className="bg-transparent border-b border-gray-800 text-white text-center text-base pb-3 outline-none placeholder-gray-800 focus:border-gray-600 transition-colors" />
          </div>
          <button onClick={() => (name.trim() && email.trim()) && setStep('tag')} className={`border text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full transition-all duration-500 mt-4 ${name.trim() && email.trim() ? 'border-gray-700 text-white hover:border-white' : 'border-gray-900 text-gray-800'}`}>
            Continue
          </button>
        </div>
      )}

      {step === 'tag' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Tag</span>
          <h2 className="text-3xl font-extralight">Anyone to add?</h2>
          <p className="text-sm text-gray-700">{"If they're on beside, tag them."}</p>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="name or email" className="bg-transparent border-b border-gray-800 text-white text-center text-base pb-3 w-64 outline-none placeholder-gray-800 focus:border-gray-600 transition-colors mt-4" />
          <button onClick={() => setStep('seal')} className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500 mt-4">
            {tag.trim() ? 'Add & Continue' : 'Skip'}
          </button>
        </div>
      )}

      {step === 'seal' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <span className="text-xs tracking-[0.2em] text-gray-600 uppercase">Ready</span>
          <h2 className="text-3xl font-extralight">Seal it.</h2>
          <p className="text-sm text-gray-700 leading-relaxed max-w-[260px]">In 1 month, everyone in this capsule will get a notification.</p>
          <p className="text-xs text-gray-800">Allow notifications to seal.</p>
          <button onClick={() => { Notification.requestPermission().then((permission) => { if (permission === 'granted') { window.location.href = '/' } }) }} className="border border-gray-700 text-white text-xs tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:border-white transition-all duration-500 mt-4">
            Seal the Capsule
          </button>
        </div>
      )}
    </main>
  )
}