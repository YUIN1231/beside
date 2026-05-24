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
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
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
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <button onClick={() => window.location.href = '/'} className="text-gray-600 text-sm">back</button>
        <h1 className="text-sm font-light tracking-widest text-gray-400">beside</h1>
        <div className="w-8" />
      </div>

      <div className="flex gap-1.5 px-6 mb-10">
        {steps.map((s, i) => (
          <div key={s} className={`h-px flex-1 transition-all duration-500 ${i <= steps.indexOf(step) ? 'bg-white' : 'bg-gray-800'}`} />
        ))}
      </div>

      {step === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Voice</p>
          <h2 className="text-3xl font-light mb-3">Say something.</h2>
          <p className="text-sm text-gray-500 mb-16">One take. No edits.</p>
          <button onClick={recording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full border flex items-center justify-center mb-12 transition-colors ${recording ? 'border-red-500' : 'border-gray-700 hover:border-white'}`}>
            <div className={`bg-red-500 transition-all ${recording ? 'w-6 h-6 rounded-sm' : 'w-4 h-4 rounded-full'}`} />
          </button>
          <p className="text-xs text-gray-700 mb-8">{recording ? 'tap to stop' : 'tap to record'}</p>
          {audioBlob && !recording && (
            <button onClick={() => setStep('photo')} className="border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
              Continue
            </button>
          )}
        </div>
      )}

      {step === 'photo' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Photo</p>
          <h2 className="text-3xl font-light mb-3">{"Who's beside you?"}</h2>
          <p className="text-sm text-gray-500 mb-8">One shot. Make it real.</p>
          {!cameraActive && !photoBlob && (
            <>
              <button onClick={startCamera} className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center mb-6 hover:border-white transition-colors">
                <div className="w-6 h-6 rounded border-2 border-gray-400" />
              </button>
              <p className="text-xs text-gray-700">tap to open camera</p>
            </>
          )}
          {cameraActive && (
            <div className="flex flex-col items-center mb-8">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '256px', height: '256px', objectFit: 'cover', borderRadius: '12px' }} />
              <button onClick={takePhoto} className="mt-6 w-16 h-16 rounded-full border border-white flex items-center justify-center hover:bg-white transition-colors group">
                <div className="w-3 h-3 rounded-full bg-white group-hover:bg-black" />
              </button>
            </div>
          )}
          {photoBlob && (
            <div className="flex flex-col items-center mb-8">
              <img src={URL.createObjectURL(photoBlob)} style={{ width: '256px', height: '256px', objectFit: 'cover', borderRadius: '12px' }} alt="captured" />
              <button onClick={() => setStep('video')} className="mt-6 border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                Continue
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {step === 'video' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Video</p>
          <h2 className="text-3xl font-light mb-3">Last one.</h2>
          <p className="text-sm text-gray-500 mb-8">10 seconds. Just be here.</p>
          {!videoPreviewActive && !videoBlob && (
            <>
              <button onClick={startVideoRecording} className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center mb-6 hover:border-white transition-colors">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </button>
              <p className="text-xs text-gray-700">tap to record</p>
            </>
          )}
          {videoPreviewActive && (
            <div className="flex flex-col items-center mb-8">
              <video ref={videoRecordRef} autoPlay playsInline muted style={{ width: '256px', height: '256px', objectFit: 'cover', borderRadius: '12px' }} />
              <button onClick={stopVideoRecording} className="mt-6 w-16 h-16 rounded-full border border-red-500 flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-sm" />
              </button>
              <p className="text-xs text-gray-700 mt-3">tap to stop · auto stops at 10s</p>
            </div>
          )}
          {videoBlob && !videoPreviewActive && (
            <div className="flex flex-col items-center mb-8">
              <video src={URL.createObjectURL(videoBlob)} controls style={{ width: '256px', height: '256px', objectFit: 'cover', borderRadius: '12px' }} />
              <button onClick={() => setStep('register')} className="mt-6 border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'register' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Almost there</p>
          <h2 className="text-3xl font-light mb-3">Who are you?</h2>
          <p className="text-sm text-gray-500 mb-12">So we know where to send it.</p>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" className="bg-transparent border-b border-gray-700 text-white text-center text-lg pb-3 mb-6 w-64 outline-none placeholder-gray-700 focus:border-gray-400 transition-colors" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" className="bg-transparent border-b border-gray-700 text-white text-center text-lg pb-3 mb-12 w-64 outline-none placeholder-gray-700 focus:border-gray-400 transition-colors" />
          <button onClick={() => (name.trim() && email.trim()) && setStep('tag')} className={`border text-sm px-10 py-4 rounded-full transition-all duration-300 ${name.trim() && email.trim() ? 'border-white text-white hover:bg-white hover:text-black' : 'border-gray-800 text-gray-700'}`}>
            Continue
          </button>
        </div>
      )}

      {step === 'tag' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Tag</p>
          <h2 className="text-3xl font-light mb-3">Anyone to add?</h2>
          <p className="text-sm text-gray-500 mb-12">{"If they're on beside, tag them."}</p>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="name or email" className="bg-transparent border-b border-gray-700 text-white text-center text-lg pb-3 mb-12 w-64 outline-none placeholder-gray-700 focus:border-gray-400 transition-colors" />
          <button onClick={() => setStep('seal')} className="border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
            {tag.trim() ? 'Add & Continue' : 'Skip'}
          </button>
        </div>
      )}

      {step === 'seal' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Ready</p>
          <h2 className="text-3xl font-light mb-3">Seal it.</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-xs">In 1 month, everyone in this capsule will get a notification.</p>
          <p className="text-xs text-gray-600 mb-16">Allow notifications to seal.</p>
          <button onClick={() => { Notification.requestPermission().then((permission) => { if (permission === 'granted') { window.location.href = '/' } }) }} className="border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
            Seal the Capsule
          </button>
        </div>
      )}
    </main>
  )
}