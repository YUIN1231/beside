'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './components/Navbar'
import Waveform from './components/Waveform'
import {
  isAuthenticated, getActiveSealedCapsule, getReadyCapsule,
  hasCapsuledThisMonth, saveCapsule, getUser,
} from './lib/storage'
import { shareOrDownload } from './lib/shareImage'
import { reverseGeocode } from './lib/supabase'
import type { Capsule, Member, GeoLocation } from './lib/types'

type AppState  = 'loading' | 'create' | 'sealed' | 'ready'
type Step      = 'landing' | 'voice' | 'photo' | 'video' | 'tag' | 'seal' | 'sealed-anim' | 'done'

function uid() { return Math.random().toString(36).slice(2) }

/* ─────────────────────────────── Component ─────────────────────────── */
export default function Home() {
  const router = useRouter()

  /* app-level */
  const [appState,    setAppState]    = useState<AppState>('loading')
  const [step,        setStep]        = useState<Step>('landing')
  const [sealedCap,   setSealedCap]   = useState<Capsule | null>(null)
  const [geo,         setGeo]         = useState<GeoLocation | null>(null)
  const [monthlyUsed, setMonthlyUsed] = useState(false)

  /* voice */
  const [audioStream,  setAudioStream]  = useState<MediaStream | null>(null)
  const [recording,    setRecording]    = useState(false)
  const [audioBlob,    setAudioBlob]    = useState<Blob | null>(null)
  const [waveSnap,     setWaveSnap]     = useState<number[]>([])
  const mediaRecRef  = useRef<MediaRecorder | null>(null)
  const audioChunks  = useRef<Blob[]>([])

  /* photo */
  const [camStream,    setCamStream]    = useState<MediaStream | null>(null)
  const [photoUrl,     setPhotoUrl]     = useState<string | null>(null)
  const [developing,   setDeveloping]   = useState(false)
  const [camFacing,    setCamFacing]    = useState<'environment'|'user'>('environment')
  const videoRef     = useRef<HTMLVideoElement | null>(null)
  const canvasRef    = useRef<HTMLCanvasElement | null>(null)

  /* video */
  const [vidStream,    setVidStream]    = useState<MediaStream | null>(null)
  const [vidRecording, setVidRecording] = useState(false)
  const [videoBlob,    setVideoBlob]    = useState<Blob | null>(null)
  const [vidProgress,  setVidProgress]  = useState(0)
  const [vidFacing,    setVidFacing]    = useState<'environment'|'user'>('environment')
  const vidRef       = useRef<HTMLVideoElement | null>(null)
  const vidRecRef    = useRef<MediaRecorder | null>(null)
  const vidChunks    = useRef<Blob[]>([])
  const vidInterval  = useRef<ReturnType<typeof setInterval> | null>(null)

  /* tag */
  const [members, setMembers] = useState<Member[]>([])
  const [tagInput, setTagInput] = useState('')

  /* seal */
  const [holdPct,    setHoldPct]    = useState(0)
  const holdRaf      = useRef<number>(0)
  const holdStart    = useRef<number>(0)
  const [sealedData, setSealedData] = useState<Capsule | null>(null)

  /* ── init ── */
  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth'); return }
    setMonthlyUsed(hasCapsuledThisMonth())
    const ready  = getReadyCapsule()
    const sealed = getActiveSealedCapsule()
    if (ready)  { setSealedCap(ready);  setAppState('ready');  return }
    if (sealed) { setSealedCap(sealed); setAppState('sealed'); return }
    setAppState('create')

    navigator.geolocation?.getCurrentPosition(async pos => {
      const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      setGeo({ city, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
    })
  }, [router])

  /* ── camera setup ── */
  useEffect(() => {
    if (camStream && videoRef.current) {
      videoRef.current.srcObject = camStream
      videoRef.current.play().catch(() => {})
    }
  }, [camStream])

  useEffect(() => {
    if (vidStream && vidRef.current) {
      vidRef.current.srcObject = vidStream
      vidRef.current.play().catch(() => {})
    }
  }, [vidStream])

  /* ── voice ── */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    setAudioStream(stream)
    const mr = new MediaRecorder(stream)
    mediaRecRef.current = mr
    audioChunks.current = []
    mr.ondataavailable = e => audioChunks.current.push(e.data)
    mr.onstop = () => {
      setAudioBlob(new Blob(audioChunks.current, { type: 'audio/webm' }))
      stream.getTracks().forEach(t => t.stop())
      setAudioStream(null)
    }
    mr.start()
    setRecording(true)
  }
  const stopRecording = () => { mediaRecRef.current?.stop(); setRecording(false) }
  const handleWaveSnap = useCallback((d: number[]) => { setWaveSnap(d) }, [])

  /* ── photo ── */
  const openCamera = async (facing: 'environment'|'user' = camFacing) => {
    camStream?.getTracks().forEach(t => t.stop())
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
    setCamStream(stream)
    setCamFacing(facing)
  }
  const flipCamera = () => openCamera(camFacing === 'environment' ? 'user' : 'environment')
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const cv = canvasRef.current
    cv.width  = videoRef.current.videoWidth
    cv.height = videoRef.current.videoHeight
    cv.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const url = cv.toDataURL('image/jpeg', 0.88)
    camStream?.getTracks().forEach(t => t.stop())
    setCamStream(null)
    setDeveloping(true)
    setPhotoUrl(url)
    setTimeout(() => setDeveloping(false), 1800)
  }

  /* ── video ── */
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: vidFacing }, audio: true })
    setVidStream(stream)
    const mr = new MediaRecorder(stream)
    vidRecRef.current = mr
    vidChunks.current = []
    mr.ondataavailable = e => vidChunks.current.push(e.data)
    mr.onstop = () => {
      setVideoBlob(new Blob(vidChunks.current, { type: 'video/webm' }))
      stream.getTracks().forEach(t => t.stop())
      setVidStream(null)
      setVidRecording(false)
      if (vidInterval.current) clearInterval(vidInterval.current)
    }
    mr.start()
    setVidRecording(true)
    setVidProgress(0)
    vidInterval.current = setInterval(() => {
      setVidProgress(p => {
        if (p >= 1) { mr.stop(); return 1 }
        return p + 1 / 100
      })
    }, 100)
    setTimeout(() => { if (mr.state === 'recording') mr.stop() }, 10000)
  }
  const stopVideo = () => { vidRecRef.current?.stop() }

  /* ── seal long-press ── */
  const startHold = () => {
    holdStart.current = performance.now()
    const tick = () => {
      const pct = Math.min((performance.now() - holdStart.current) / 3000, 1)
      setHoldPct(pct)
      if (pct < 1) { holdRaf.current = requestAnimationFrame(tick) }
      else          { doSeal() }
    }
    holdRaf.current = requestAnimationFrame(tick)
  }
  const endHold = () => {
    cancelAnimationFrame(holdRaf.current)
    setHoldPct(0)
  }

  const doSeal = () => {
    const now   = new Date()
    const opens = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const user  = getUser()
    const cap: Capsule = {
      id:        uid(),
      location:  geo?.city ?? 'Unknown',
      city:      geo?.city ?? 'Unknown',
      latitude:  geo?.latitude,
      longitude: geo?.longitude,
      createdAt: now.toISOString(),
      sealedAt:  now.toISOString(),
      opensAt:   opens.toISOString(),
      audioUrl:  audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      photoUrl:  photoUrl  ?? undefined,
      videoUrl:  videoBlob ? URL.createObjectURL(videoBlob) : undefined,
      members,
    }
    saveCapsule(cap)
    setSealedData(cap)
    setStep('sealed-anim')
    setTimeout(() => setStep('done'), 2400)
  }

  /* ── share card ── */
  const share = async () => {
    if (!sealedData) return
    await shareOrDownload(sealedData)
  }

  /* ── days until ── */
  const daysUntil = (iso?: string) => {
    if (!iso) return 0
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  }

  /* ── LOADING ── */
  if (appState === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
      </main>
    )
  }

  /* ── SEALED ── */
  if (appState === 'sealed' && sealedCap) {
    const days = daysUntil(sealedCap.opensAt)
    return (
      <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-10">
          <div className="story-ring gold-glow" style={{ width: '110px', height: '110px' }}>
            <div className="story-ring-inner" style={{ width: '104px', height: '104px' }}>
              <div style={{
                width: '98px', height: '98px', borderRadius: '50%',
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Pill gold />
              </div>
            </div>
          </div>
          <div className="fade-up flex flex-col gap-3">
            <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--gold-dim)' }}>Sealed</p>
            <p className="text-[3.5rem] leading-none" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--gold)' }}>{days}</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>days until it opens</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{sealedCap.city}</p>
          </div>
        </div>
        <Navbar active="home" />
      </main>
    )
  }

  /* ── READY TO OPEN ── */
  if (appState === 'ready' && sealedCap) {
    return (
      <main className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-10">
          <div className="story-ring gold-glow" style={{ width: '110px', height: '110px' }}>
            <div className="story-ring-inner" style={{ width: '104px', height: '104px' }}>
              <div style={{
                width: '98px', height: '98px', borderRadius: '50%',
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Pill gold />
              </div>
            </div>
          </div>
          <div className="fade-up flex flex-col gap-3">
            <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--gold)' }}>Ready</p>
            <h2 className="text-3xl" style={{ fontFamily: 'var(--font-fraunces)' }}>Your capsule is open.</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{sealedCap.city}</p>
          </div>
          <button
            onClick={() => router.push(`/capsules/${sealedCap.id}`)}
            className="text-sm tracking-[0.06em] px-10 py-3.5 rounded-full transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
              color: '#0f0a05', fontWeight: 600,
              boxShadow: '0 4px 24px rgba(201,169,110,0.25)',
            }}
          >
            Open it
          </button>
        </div>
        <Navbar active="home" />
      </main>
    )
  }

  /* ── CREATE FLOW ── */
  const circumference = 2 * Math.PI * 38

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── LANDING ── */}
      {step === 'landing' && (
        <>
          <Header showAccount />
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-10 pb-24">
            {/* story ring hero */}
            <div className="relative flex items-center justify-center">
              <div className="story-ring slow-spin" style={{ width: '120px', height: '120px' }}>
                <div className="story-ring-inner" style={{ width: '114px', height: '114px' }}>
                  <div style={{
                    width: '108px', height: '108px', borderRadius: '50%',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Pill gold />
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-up flex flex-col gap-3">
              <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color: 'var(--gold-dim)' }}>
                {geo?.city ?? '···'} · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-[2.2rem] leading-[1.2]" style={{ fontFamily: 'var(--font-fraunces)' }}>
                Who's beside you<br />tonight?
              </h1>
            </div>

            <p className="fade-up-2 text-sm leading-relaxed" style={{ color: 'var(--text-2)', maxWidth: '240px' }}>
              One take. Sealed for 1 month.<br />Only people actually beside you.
            </p>

            {monthlyUsed ? (
              <p className="fade-up-3 text-xs" style={{ color: 'var(--text-3)' }}>You've already made a capsule this month.</p>
            ) : (
              <button
                onClick={() => setStep('voice')}
                className="fade-up-3 text-sm tracking-[0.06em] px-10 py-3.5 rounded-full transition-all duration-300 active:scale-95 btn-gold"
              >
                Take a capsule
              </button>
            )}
          </div>
          <Navbar active="home" />
        </>
      )}

      {/* ── VOICE ── */}
      {step === 'voice' && (
        <div className="min-h-screen flex flex-col">
          <StepHeader label="Voice" onBack={() => setStep('landing')} step={1} total={4} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            <div className="fade-up text-center">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>Say something.</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>One take. No edits.</p>
            </div>

            {/* waveform area */}
            <div className="w-full px-2" style={{ height: '80px' }}>
              {(recording || audioBlob) ? (
                <Waveform
                  stream={recording ? audioStream : null}
                  frozen={!!audioBlob && !recording}
                  frozenData={waveSnap}
                  onFreezeData={handleWaveSnap}
                  color="#c9a96e"
                  height={80}
                />
              ) : (
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />
                </div>
              )}
            </div>

            {/* record button */}
            <div className="relative flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
              {recording && <>
                <div className="pulse-ring   absolute rounded-full" style={{ width: '80px', height: '80px', border: '1px solid var(--gold)' }} />
                <div className="pulse-ring-2 absolute rounded-full" style={{ width: '80px', height: '80px', border: '1px solid var(--gold)' }} />
                <div className="pulse-ring-3 absolute rounded-full" style={{ width: '80px', height: '80px', border: '1px solid var(--gold)' }} />
              </>}
              <button
                onClick={recording ? stopRecording : startRecording}
                className="relative z-10 rounded-full transition-all duration-300 active:scale-90"
                style={{
                  width: '80px', height: '80px',
                  border: recording ? '1px solid var(--gold)' : '1px solid var(--border-2)',
                  background: recording ? 'rgba(201,169,110,0.1)' : 'var(--surface)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{
                    width: recording ? '22px' : '14px',
                    height: recording ? '22px' : '14px',
                    borderRadius: recording ? '4px' : '50%',
                    background: 'var(--gold)',
                    boxShadow: recording ? '0 0 16px rgba(201,169,110,0.6)' : 'none',
                    transition: 'all 0.3s ease',
                  }} />
                </div>
              </button>
            </div>

            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-3)' }}>
              {recording ? 'tap to stop' : audioBlob ? 'recorded' : 'tap to record'}
            </p>

            {audioBlob && !recording && (
              <button onClick={() => setStep('photo')} className="fade-up text-sm tracking-[0.08em] px-10 py-3.5 rounded-full transition-all duration-300 active:scale-95" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── PHOTO ── */}
      {step === 'photo' && (
        <div className="min-h-screen flex flex-col">
          <StepHeader label="Photo" onBack={() => setStep('voice')} step={2} total={4} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            <div className="fade-up text-center">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>Who's beside you?</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>One shot. Make it real.</p>
            </div>

            {!camStream && !photoUrl && (
              <button onClick={() => openCamera()} className="relative rounded-2xl overflow-hidden active:scale-95 transition-all" style={{
                width: '260px', height: '260px',
                border: '1px solid var(--border-2)',
                background: 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px',
              }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="17" stroke="var(--text-3)" strokeWidth="1" />
                  <circle cx="20" cy="20" r="8" stroke="var(--text-3)" strokeWidth="1" />
                  <line x1="20" y1="3" x2="20" y2="8" stroke="var(--text-3)" />
                  <line x1="20" y1="32" x2="20" y2="37" stroke="var(--text-3)" />
                  <line x1="3" y1="20" x2="8" y2="20" stroke="var(--text-3)" />
                  <line x1="32" y1="20" x2="37" y2="20" stroke="var(--text-3)" />
                </svg>
                <span className="text-xs tracking-[0.12em]" style={{ color: 'var(--text-3)' }}>Open camera</span>
              </button>
            )}

            {camStream && (
              <div className="flex flex-col items-center gap-6">
                <div className="iris-open rounded-2xl overflow-hidden relative" style={{ width: '260px', height: '260px' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    border: '1px solid rgba(201,169,110,0.15)', borderRadius: '16px',
                  }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '1px', background: 'rgba(201,169,110,0.08)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: '16px', bottom: '16px', width: '1px', background: 'rgba(201,169,110,0.08)' }} />
                  </div>
                  {/* flip button */}
                  <button onClick={flipCamera} style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                  </button>
                </div>
                <button onClick={takePhoto} className="rounded-full flex items-center justify-center transition-all active:scale-90" style={{
                  width: '60px', height: '60px',
                  background: 'linear-gradient(145deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.06) 100%)',
                  border: '1.5px solid var(--gold)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 12px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px rgba(201,169,110,0.6)' }} />
                </button>
              </div>
            )}

            {photoUrl && !camStream && (
              <div className="flex flex-col items-center gap-6">
                <div className="rounded-2xl overflow-hidden" style={{ width: '260px', height: '260px' }}>
                  <img src={photoUrl} className={developing ? 'developing' : ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                {!developing && (
                  <div className="flex gap-3">
                    <button onClick={() => { setPhotoUrl(null) }} className="text-xs tracking-[0.1em] px-6 py-3 rounded-full" style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>Retake</button>
                    <button onClick={() => setStep('video')} className="text-sm tracking-[0.08em] px-10 py-3 rounded-full active:scale-95" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>Continue</button>
                  </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* ── VIDEO ── */}
      {step === 'video' && (
        <div className="min-h-screen flex flex-col">
          <StepHeader label="Video" onBack={() => setStep('photo')} step={3} total={4} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            <div className="fade-up text-center">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>Last one.</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>10 seconds. Just be here.</p>
            </div>

            {!vidStream && !videoBlob && (
              <div className="flex flex-col items-center gap-5">
                <button onClick={startVideo} className="rounded-full flex items-center justify-center transition-all active:scale-90" style={{
                  width: '90px', height: '90px',
                  background: 'linear-gradient(145deg, rgba(240,230,208,0.08) 0%, rgba(240,230,208,0.03) 100%)',
                  border: '1.5px solid rgba(240,230,208,0.18)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)',
                }}>
                  <div className="vid-pulse" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px rgba(201,169,110,0.5)' }} />
                </button>
                {/* camera flip */}
                <button onClick={() => setVidFacing(f => f === 'environment' ? 'user' : 'environment')}
                  className="flex items-center gap-2 transition-all active:scale-95"
                  style={{ color: 'var(--text-3)', fontSize: '12px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  {vidFacing === 'environment' ? 'Back' : 'Front'} camera
                </button>
              </div>
            )}

            {vidStream && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative rounded-2xl overflow-hidden" style={{ width: '260px', height: '260px' }}>
                  <video ref={vidRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* timebar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{
                      height: '100%',
                      width: `${vidProgress * 100}%`,
                      background: 'var(--gold)',
                      transition: 'width 0.1s linear',
                      boxShadow: '0 0 8px rgba(201,169,110,0.6)',
                    }} />
                  </div>
                  {/* pulse dot */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="vid-pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)' }} />
                  </div>
                </div>
                <button onClick={stopVideo} className="rounded-full flex items-center justify-center" style={{ width: '52px', height: '52px', border: '1px solid var(--gold)' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--gold)' }} />
                </button>
              </div>
            )}

            {videoBlob && !vidStream && (
              <div className="flex flex-col items-center gap-6">
                <div className="rounded-2xl overflow-hidden" style={{ width: '260px', height: '260px' }}>
                  <video src={URL.createObjectURL(videoBlob)} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setVideoBlob(null); setVidProgress(0) }} className="text-xs tracking-[0.1em] px-6 py-3 rounded-full" style={{ border: '1px solid var(--border-2)', color: 'var(--text-2)' }}>Retake</button>
                  <button onClick={() => setStep('tag')} className="text-sm tracking-[0.08em] px-10 py-3 rounded-full active:scale-95" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>Continue</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAG ── */}
      {step === 'tag' && (
        <div className="min-h-screen flex flex-col">
          <StepHeader label="Tag" onBack={() => setStep('video')} step={4} total={4} />
          <div className="flex-1 flex flex-col px-8 pt-10 gap-8">
            <div className="fade-up">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>Who was there?</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Only people at the same place, within 15 minutes.<br />They'll get a location check to confirm.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    const n = tagInput.trim()
                    setMembers(m => [...m, { name: n, initial: n[0].toUpperCase() }])
                    setTagInput('')
                  }
                }}
                placeholder="Name or email — press Enter"
                style={{
                  width: '100%', background: 'rgba(240,230,208,0.05)',
                  border: '1px solid rgba(240,230,208,0.1)', borderRadius: '16px',
                  padding: '16px 18px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {members.length > 0 && (
              <div className="flex flex-col gap-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--border-2)', color: 'var(--gold)' }}>{m.initial}</div>
                      <span className="text-sm">{m.name}</span>
                    </div>
                    <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))} style={{ color: 'var(--text-3)', fontSize: '18px', lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pb-12 flex flex-col gap-3">
              <button onClick={() => setStep('seal')} className="w-full py-4 rounded-full text-sm tracking-[0.08em] active:scale-95" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                {members.length > 0 ? 'Continue to seal' : 'Skip — seal alone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEAL ── */}
      {step === 'seal' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-10">
          <div className="fade-up">
            <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold-dim)' }}>Seal</p>
            <h2 className="text-3xl mb-3" style={{ fontFamily: 'var(--font-fraunces)' }}>Hold to seal.</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Hold for 3 seconds.<br />Cannot be undone.
            </p>
          </div>

          {/* long-press ring */}
          <div
            className="relative flex items-center justify-center select-none"
            style={{ width: '120px', height: '120px', cursor: 'pointer', WebkitUserSelect: 'none' }}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
          >
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border-2)" strokeWidth="2" />
              <circle
                cx="60" cy="60" r="38" fill="none"
                stroke="var(--gold)" strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - holdPct)}
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: holdPct > 0 ? 'drop-shadow(0 0 6px rgba(201,169,110,0.6))' : 'none' }}
              />
            </svg>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: holdPct > 0 ? `rgba(201,169,110,${0.06 + holdPct * 0.14})` : 'var(--surface)',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.1s',
            }}>
              <Pill gold={holdPct > 0} />
            </div>
          </div>

          <button onClick={() => setStep('tag')} className="text-xs tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>back</button>
        </div>
      )}

      {/* ── SEALED ANIMATION ── */}
      {step === 'sealed-anim' && (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="stamp">
            <div className="w-36 h-36 rounded-full flex items-center justify-center" style={{
              background: 'var(--gold)',
              boxShadow: '0 0 60px rgba(201,169,110,0.4)',
            }}>
              <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: '64px', color: 'var(--bg)', fontWeight: 700 }}>B</span>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && sealedData && (
        <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-8">
          <div className="sealed-text text-xs tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Sealed</div>
          <div className="fade-up flex flex-col gap-2">
            <h2 className="text-4xl" style={{ fontFamily: 'var(--font-fraunces)' }}>
              See you in<br />1 month.
            </h2>
          </div>
          <div className="fade-up-2 flex flex-col items-center gap-1">
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{sealedData.city}</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Opens {new Date(sealedData.opensAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
            {sealedData.members.length > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {sealedData.members.length + 1} people sealed inside
              </p>
            )}
          </div>
          <button
            onClick={share}
            className="fade-up-3 w-full flex items-center justify-center gap-3 py-4 rounded-full transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
              color: '#0f0a05', fontWeight: 600,
              boxShadow: '0 4px 28px rgba(201,169,110,0.28)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M4 5l4-4 4 4M2 11v3h12v-3" stroke="#0f0a05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share to Stories
          </button>
          <button onClick={() => router.push('/capsules')} className="text-xs tracking-[0.12em]" style={{ color: 'var(--text-3)' }}>
            View capsules
          </button>
        </div>
      )}
    </main>
  )
}

/* ── Shared sub-components ─────────────────────────────────────────── */
function Header({ showAccount }: { showAccount?: boolean }) {
  const initial = getUser()?.name?.[0]?.toUpperCase() ?? '?'
  return (
    <div className="flex items-center justify-between px-6 pt-14 pb-6">
      <div className="w-8" />
      <span className="text-base font-light tracking-[0.4em]" style={{
        fontFamily: 'var(--font-fraunces)',
        background: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--gold) 60%, var(--gold-bright) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>beside</span>
      {showAccount
        ? <a href="/account" className="w-8 h-8 rounded-full flex items-center justify-center text-[10px]"
            style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--gold)' }}>{initial}</a>
        : <div className="w-8" />}
    </div>
  )
}

function StepHeader({ label, onBack, step, total }: { label: string; onBack: () => void; step: number; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-14 pb-5">
        <button onClick={onBack} style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(240,230,208,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="rgba(240,230,208,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-3)', width: '32px', textAlign: 'right' }}>{step}/{total}</span>
      </div>
      {/* step bar */}
      <div className="flex gap-1.5 px-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 rounded-full transition-all duration-500" style={{
            height: '2px',
            background: i < step ? 'var(--gold)' : 'rgba(240,230,208,0.1)',
            boxShadow: i === step - 1 ? '0 0 8px rgba(201,169,110,0.4)' : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}

function Pill({ gold }: { gold?: boolean }) {
  return (
    <div style={{
      width: '18px', height: '30px', borderRadius: '10px',
      border: `1.5px solid ${gold ? '#c9a96e' : 'rgba(240,230,208,0.28)'}`,
      background: gold
        ? 'linear-gradient(180deg, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.07) 100%)'
        : 'linear-gradient(180deg, rgba(240,230,208,0.07) 0%, rgba(240,230,208,0.02) 100%)',
      boxShadow: gold
        ? 'inset 0 1px 0 rgba(255,255,255,0.22), 0 3px 10px rgba(0,0,0,0.35)'
        : 'inset 0 1px 0 rgba(255,255,255,0.06)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '46%', left: '2px', right: '2px',
        height: '1px',
        background: gold ? 'rgba(201,169,110,0.4)' : 'rgba(240,230,208,0.12)',
      }} />
    </div>
  )
}
