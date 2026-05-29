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
import {
  reverseGeocode, saveCapsuleRemote, upsertProfile,
  createJoinSession, subscribeToSession, getJoinEntries,
} from './lib/supabase'
import type { Capsule, Member, GeoLocation } from './lib/types'

type AppState  = 'loading' | 'create' | 'sealed' | 'ready'
type Step      = 'landing' | 'tutorial' | 'voice' | 'photo' | 'video' | 'tag' | 'seal' | 'sealed-anim' | 'done'

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
  const [audioProgress, setAudioProgress] = useState(0)
  const mediaRecRef   = useRef<MediaRecorder | null>(null)
  const audioChunks   = useRef<Blob[]>([])
  const audioInterval = useRef<ReturnType<typeof setInterval> | null>(null)

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

  /* tag + join session */
  const [members,       setMembers]       = useState<Member[]>([])
  const [tagInput,      setTagInput]      = useState('')
  const [capsuleId,     setCapsuleId]     = useState(() => Math.random().toString(36).slice(2))
  const [joinSessionId, setJoinSessionId] = useState<string | null>(null)
  const [joinUrl,       setJoinUrl]       = useState<string>('')
  const [sealing,       setSealing]       = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const joinSubRef  = useRef<ReturnType<typeof subscribeToSession> | null>(null)

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

  /* ── join session + QR ── */
  useEffect(() => {
    if (step !== 'tag') return
    const user = getUser()
    if (!user) return

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://beside-gules.vercel.app'

    createJoinSession(capsuleId, user.email, user.name, geo?.city ?? '').then(async sid => {
      if (!sid) return
      setJoinSessionId(sid)
      const url = `${baseUrl}/join/${sid}`
      setJoinUrl(url)

      // Draw QR
      if (typeof window !== 'undefined') {
        const QRCode = (await import('qrcode')).default
        if (qrCanvasRef.current) {
          QRCode.toCanvas(qrCanvasRef.current, url, {
            width: 200,
            color: { dark: '#1E1A14', light: '#F5F0E8' },
            margin: 2,
          })
        }
      }

      // Load existing entries
      const existing = await getJoinEntries(sid)
      existing.forEach(e => {
        setMembers(prev => {
          if (prev.some(m => m.email === e.email)) return prev
          return [...prev, { name: e.name, email: e.email, initial: e.name[0]?.toUpperCase() ?? '?' }]
        })
      })

      // Subscribe for new entries
      joinSubRef.current = subscribeToSession(sid, entry => {
        setMembers(prev => {
          if (prev.some(m => m.email === entry.email)) return prev
          return [...prev, { name: entry.name, email: entry.email, initial: entry.name[0]?.toUpperCase() ?? '?' }]
        })
      })
    })

    return () => {
      joinSubRef.current?.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  /* ── voice ── */
  const AUDIO_SECS = 60
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    setAudioStream(stream)
    const mr = new MediaRecorder(stream)
    mediaRecRef.current = mr
    audioChunks.current = []
    setAudioProgress(0)
    mr.ondataavailable = e => audioChunks.current.push(e.data)
    mr.onstop = () => {
      setAudioBlob(new Blob(audioChunks.current, { type: 'audio/webm' }))
      stream.getTracks().forEach(t => t.stop())
      setAudioStream(null)
      if (audioInterval.current) clearInterval(audioInterval.current)
    }
    mr.start()
    setRecording(true)
    audioInterval.current = setInterval(() => {
      setAudioProgress(p => {
        const next = p + 1 / (AUDIO_SECS * 10)
        if (next >= 1) { mr.stop(); return 1 }
        return next
      })
    }, 100)
    setTimeout(() => { if (mr.state === 'recording') mr.stop() }, AUDIO_SECS * 1000)
  }
  const stopRecording = () => {
    mediaRecRef.current?.stop()
    setRecording(false)
    if (audioInterval.current) clearInterval(audioInterval.current)
  }
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

  const doSeal = async () => {
    if (sealing) return
    setSealing(true)
    const now   = new Date()
    const opens = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const user  = getUser()

    // Save locally first with blob URLs for instant playback
    const cap: Capsule = {
      id:        capsuleId,
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

    // Upload to Supabase in background
    if (user) {
      saveCapsuleRemote(cap, user.email, {
        audio:       audioBlob  ?? undefined,
        photoDataUrl: photoUrl  ?? undefined,
        video:       videoBlob  ?? undefined,
      }).then(updatedCap => {
        // Update local storage with remote URLs
        saveCapsule(updatedCap)
        setSealedData(updatedCap)
      }).catch(err => console.error('Supabase save error', err))
    }

    setTimeout(() => setStep('done'), 2400)
    setSealing(false)
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
            <p className="text-[3.5rem] leading-none" style={{ fontFamily: 'var(--font-space)', color: 'var(--gold)' }}>{days}</p>
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
            <h2 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>Your capsule is open.</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{sealedCap.city}</p>
          </div>
          <button
            onClick={() => router.push(`/capsules/${sealedCap.id}`)}
            className="text-sm tracking-[0.06em] px-10 py-3.5 rounded-full transition-all duration-300 active:scale-95"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(196,66,42,0.22)',
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
              <h1 className="text-[2.2rem] leading-[1.2]" style={{ fontFamily: 'var(--font-space)' }}>
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
                onClick={() => setStep('tutorial')}
                className="fade-up-3 text-sm tracking-[0.06em] px-10 py-3.5 rounded-full transition-all duration-300 active:scale-95 btn-gold"
              >
                Take a capsule
              </button>
            )}
          </div>
          <Navbar active="home" />
        </>
      )}

      {/* ── TUTORIAL ── */}
      {step === 'tutorial' && (
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 gap-8">
            <div className="fade-up text-center">
              <h1 className="text-[1.9rem] leading-tight mb-2" style={{ fontFamily: 'var(--font-space)' }}>Here's the drill.</h1>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>4 steps. One take each. Sealed for a month.</p>
            </div>

            <div className="fade-up-2 grid grid-cols-2 gap-3 w-full max-w-xs">
              {/* Voice */}
              <div style={{
                background: '#fff', borderRadius: '4px',
                padding: '16px 12px 14px',
                boxShadow: '0 3px 14px rgba(30,26,20,0.10), 0 1px 3px rgba(30,26,20,0.06)',
                transform: 'rotate(-1.8deg)',
              }}>
                <div style={{ height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="6"  y="20" width="4" height="8"  rx="2" fill="#C4422A" opacity="0.35"/>
                    <rect x="13" y="15" width="4" height="18" rx="2" fill="#C4422A" opacity="0.6"/>
                    <rect x="20" y="10" width="4" height="24" rx="2" fill="#C4422A"/>
                    <rect x="27" y="16" width="4" height="14" rx="2" fill="#C4422A" opacity="0.65"/>
                    <rect x="34" y="20" width="4" height="6"  rx="2" fill="#C4422A" opacity="0.35"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#1E1A14', marginBottom: '2px' }}>Voice</p>
                <p style={{ fontSize: '10px', color: 'rgba(30,26,20,0.45)' }}>60 seconds</p>
              </div>

              {/* Photo */}
              <div style={{
                background: '#fff', borderRadius: '4px',
                padding: '16px 12px 14px',
                boxShadow: '0 3px 14px rgba(30,26,20,0.10), 0 1px 3px rgba(30,26,20,0.06)',
                transform: 'rotate(1.3deg)',
              }}>
                <div style={{ height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="5" y="13" width="34" height="23" rx="5" stroke="#C4422A" strokeWidth="1.5"/>
                    <circle cx="22" cy="24.5" r="7.5" stroke="#C4422A" strokeWidth="1.5"/>
                    <circle cx="22" cy="24.5" r="3" fill="#C4422A" opacity="0.35"/>
                    <path d="M16 13v-2a2 2 0 012-2h8a2 2 0 012 2v2" stroke="#C4422A" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="35" cy="19" r="2" fill="#C4422A" opacity="0.5"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#1E1A14', marginBottom: '2px' }}>Photo</p>
                <p style={{ fontSize: '10px', color: 'rgba(30,26,20,0.45)' }}>One shot</p>
              </div>

              {/* Video */}
              <div style={{
                background: '#fff', borderRadius: '4px',
                padding: '16px 12px 14px',
                boxShadow: '0 3px 14px rgba(30,26,20,0.10), 0 1px 3px rgba(30,26,20,0.06)',
                transform: 'rotate(0.9deg)',
              }}>
                <div style={{ height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="4" y="11" width="26" height="22" rx="3" stroke="#C4422A" strokeWidth="1.5"/>
                    <rect x="4" y="11" width="5" height="5" rx="1" fill="#C4422A" opacity="0.22"/>
                    <rect x="4" y="19" width="5" height="5" rx="1" fill="#C4422A" opacity="0.22"/>
                    <rect x="4" y="27" width="5" height="5" rx="1" fill="#C4422A" opacity="0.22"/>
                    <path d="M16 18l10 4-10 5V18z" fill="#C4422A"/>
                    <path d="M30 17l9-4v18l-9-4V17z" stroke="#C4422A" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#1E1A14', marginBottom: '2px' }}>Video</p>
                <p style={{ fontSize: '10px', color: 'rgba(30,26,20,0.45)' }}>10 seconds</p>
              </div>

              {/* Tag */}
              <div style={{
                background: '#fff', borderRadius: '4px',
                padding: '16px 12px 14px',
                boxShadow: '0 3px 14px rgba(30,26,20,0.10), 0 1px 3px rgba(30,26,20,0.06)',
                transform: 'rotate(-0.7deg)',
              }}>
                <div style={{ height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="15" cy="14" r="5" stroke="#C4422A" strokeWidth="1.5"/>
                    <path d="M5 34c0-5.5 4.5-9 10-9" stroke="#C4422A" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="29" cy="14" r="5" stroke="#C4422A" strokeWidth="1.5"/>
                    <path d="M39 34c0-5.5-4.5-9-10-9" stroke="#C4422A" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="18" y="27" width="3" height="3" rx="0.5" fill="#C4422A" opacity="0.45"/>
                    <rect x="23" y="27" width="3" height="3" rx="0.5" fill="#C4422A" opacity="0.45"/>
                    <rect x="18" y="32" width="3" height="3" rx="0.5" fill="#C4422A" opacity="0.45"/>
                    <rect x="23" y="32" width="3" height="3" rx="0.5" fill="#C4422A" opacity="0.45"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#1E1A14', marginBottom: '2px' }}>Tag</p>
                <p style={{ fontSize: '10px', color: 'rgba(30,26,20,0.45)' }}>Who was there</p>
              </div>
            </div>

            <div className="fade-up-3 flex flex-col items-center gap-3">
              <button
                onClick={() => setStep('voice')}
                className="text-sm tracking-[0.06em] px-12 py-4 rounded-full transition-all duration-300 active:scale-95 btn-gold"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VOICE ── */}
      {step === 'voice' && (
        <div className="min-h-screen flex flex-col">
          <StepHeader label="Voice" onBack={() => setStep('landing')} step={1} total={4} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            <div className="fade-up text-center">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-space)' }}>Say something.</h2>
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
                  color="#C4422A"
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
                  background: recording ? 'rgba(196,66,42,0.07)' : 'var(--surface)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{
                    width: recording ? '22px' : '14px',
                    height: recording ? '22px' : '14px',
                    borderRadius: recording ? '4px' : '50%',
                    background: 'var(--gold)',
                    boxShadow: recording ? '0 0 14px rgba(196,66,42,0.45)' : 'none',
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
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-space)' }}>Who's beside you?</h2>
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
                  <rect x="4" y="11" width="32" height="22" rx="5" stroke="var(--text-3)" strokeWidth="1.5"/>
                  <circle cx="20" cy="22" r="7.5" stroke="var(--text-3)" strokeWidth="1.5"/>
                  <path d="M14 11V9a2 2 0 012-2h8a2 2 0 012 2v2" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="32" cy="17" r="2" fill="var(--text-3)"/>
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
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
                  }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '1px', background: 'rgba(255,255,255,0.10)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: '16px', bottom: '16px', width: '1px', background: 'rgba(255,255,255,0.10)' }} />
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
                  background: 'linear-gradient(145deg, rgba(196,66,42,0.10) 0%, rgba(196,66,42,0.04) 100%)',
                  border: '1.5px solid var(--gold)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(30,26,20,0.10)',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px rgba(196,66,42,0.5)' }} />
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
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-space)' }}>Last one.</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>10 seconds. Just be here.</p>
            </div>

            {!vidStream && !videoBlob && (
              <div className="flex flex-col items-center gap-5">
                <button onClick={startVideo} className="rounded-full flex items-center justify-center transition-all active:scale-90" style={{
                  width: '90px', height: '90px',
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-2)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(30,26,20,0.08)',
                }}>
                  <div className="vid-pulse" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px rgba(196,66,42,0.45)' }} />
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
                      boxShadow: '0 0 8px rgba(196,66,42,0.45)',
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
          <div className="flex-1 flex flex-col px-8 pt-8 gap-6 overflow-y-auto pb-8">

            <div className="fade-up">
              <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-space)' }}>Who was there?</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Share the QR so people can join instantly.
              </p>
            </div>

            {/* QR section */}
            {joinUrl && (
              <div className="fade-up-2 flex flex-col items-center gap-4 py-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-3)' }}>Scan to join</p>
                <canvas ref={qrCanvasRef} style={{ borderRadius: '12px' }} />
                <button
                  onClick={() => { if (joinUrl) navigator.clipboard?.writeText(joinUrl) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all active:scale-95"
                  style={{ background: 'rgba(196,66,42,0.07)', color: 'var(--gold)', border: '1px solid rgba(196,66,42,0.2)' }}
                >
                  Copy link
                </button>
              </div>
            )}

            {/* Manual add */}
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
                placeholder="Or type a name — press Enter"
                style={{
                  width: '100%', background: 'rgba(30,26,20,0.04)',
                  border: '1px solid var(--border)', borderRadius: '16px',
                  padding: '14px 18px', color: 'var(--text)', fontSize: '14px',
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
                      <div>
                        <p className="text-sm">{m.name}</p>
                        {m.email && <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.email}</p>}
                      </div>
                    </div>
                    <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))} style={{ color: 'var(--text-3)', fontSize: '18px', lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
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
            <h2 className="text-3xl mb-3" style={{ fontFamily: 'var(--font-space)' }}>Hold to seal.</h2>
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
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: holdPct > 0 ? 'drop-shadow(0 0 5px rgba(196,66,42,0.5))' : 'none' }}
              />
            </svg>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: holdPct > 0 ? `rgba(196,66,42,${0.05 + holdPct * 0.10})` : 'var(--surface)',
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
              boxShadow: '0 0 60px rgba(196,66,42,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-space)', fontSize: '64px', color: 'var(--bg)', fontWeight: 700 }}>B</span>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && sealedData && (
        <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-8">
          <div className="sealed-text text-xs tracking-[0.35em] uppercase" style={{ color: 'var(--gold)' }}>Sealed</div>
          <div className="fade-up flex flex-col gap-2">
            <h2 className="text-4xl" style={{ fontFamily: 'var(--font-space)' }}>
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
              background: 'var(--gold)',
              color: 'var(--bg)', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(196,66,42,0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M4 5l4-4 4 4M2 11v3h12v-3" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        fontFamily: 'var(--font-space)',
        color: 'var(--text)',
      }}>beside</span>
      {showAccount
        ? <a href="/account" className="w-8 h-8 rounded-full flex items-center justify-center text-[10px]"
            style={{ background: 'rgba(196,66,42,0.08)', color: 'var(--gold)', border: '1px solid rgba(196,66,42,0.15)' }}>{initial}</a>
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
          background: 'rgba(30,26,20,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="rgba(30,26,20,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-space)',
          color: 'var(--text)',
        }}>beside</span>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-3)', width: '32px', textAlign: 'right' }}>{step}/{total}</span>
      </div>
      {/* step bar */}
      <div className="flex gap-1.5 px-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 rounded-full transition-all duration-500" style={{
            height: '2px',
            background: i < step ? 'var(--gold)' : 'rgba(30,26,20,0.12)',
            boxShadow: i === step - 1 ? '0 0 6px rgba(196,66,42,0.3)' : 'none',
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
      border: `1.5px solid ${gold ? '#C4422A' : 'rgba(30,26,20,0.20)'}`,
      background: gold
        ? 'linear-gradient(180deg, rgba(196,66,42,0.14) 0%, rgba(196,66,42,0.05) 100%)'
        : 'linear-gradient(180deg, rgba(30,26,20,0.06) 0%, rgba(30,26,20,0.02) 100%)',
      boxShadow: gold
        ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.06)'
        : 'inset 0 1px 0 rgba(255,255,255,0.6)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '46%', left: '2px', right: '2px',
        height: '1px',
        background: gold ? 'rgba(196,66,42,0.3)' : 'rgba(30,26,20,0.12)',
      }} />
    </div>
  )
}
