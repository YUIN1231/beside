'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './components/Navbar'
import Waveform from './components/Waveform'
import {
  isAuthenticated, isOnboarded, getActiveSealedCapsule, getReadyCapsule,
  hasCapsuledThisMonth, saveCapsule, getUser,
} from './lib/storage'
import { shareOrDownload } from './lib/shareImage'
import {
  reverseGeocode, saveCapsuleRemote, upsertProfile,
  createJoinSession, subscribeToSession, getJoinEntries,
} from './lib/supabase'
import type { Capsule, Member, GeoLocation } from './lib/types'

type AppState = 'loading' | 'create' | 'sealed' | 'ready'
type Step     = 'landing' | 'tutorial' | 'voice' | 'photo' | 'video' | 'tag' | 'seal' | 'sealed-anim' | 'done'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '10px',
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
}

export default function Home() {
  const router = useRouter()

  const [appState,    setAppState]    = useState<AppState>('loading')
  const [step,        setStep]        = useState<Step>('landing')
  const [sealedCap,   setSealedCap]   = useState<Capsule | null>(null)
  const [geo,         setGeo]         = useState<GeoLocation | null>(null)
  const [monthlyUsed, setMonthlyUsed] = useState(false)

  const [audioStream,   setAudioStream]   = useState<MediaStream | null>(null)
  const [recording,     setRecording]     = useState(false)
  const [audioBlob,     setAudioBlob]     = useState<Blob | null>(null)
  const [waveSnap,      setWaveSnap]      = useState<number[]>([])
  const [audioProgress, setAudioProgress] = useState(0)
  const mediaRecRef   = useRef<MediaRecorder | null>(null)
  const audioChunks   = useRef<Blob[]>([])
  const audioInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const [camStream,  setCamStream]  = useState<MediaStream | null>(null)
  const [photoUrl,   setPhotoUrl]   = useState<string | null>(null)
  const [developing, setDeveloping] = useState(false)
  const [camFacing,  setCamFacing]  = useState<'environment'|'user'>('environment')
  const videoRef   = useRef<HTMLVideoElement | null>(null)
  const canvasRef  = useRef<HTMLCanvasElement | null>(null)

  const [vidStream,    setVidStream]    = useState<MediaStream | null>(null)
  const [vidRecording, setVidRecording] = useState(false)
  const [videoBlob,    setVideoBlob]    = useState<Blob | null>(null)
  const [vidProgress,  setVidProgress]  = useState(0)
  const [vidFacing,    setVidFacing]    = useState<'environment'|'user'>('environment')
  const vidRef    = useRef<HTMLVideoElement | null>(null)
  const vidRecRef = useRef<MediaRecorder | null>(null)
  const vidChunks = useRef<Blob[]>([])
  const vidInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const [members,       setMembers]       = useState<Member[]>([])
  const [tagInput,      setTagInput]      = useState('')
  const [capsuleId,     setCapsuleId]     = useState(() => Math.random().toString(36).slice(2))
  const [joinSessionId, setJoinSessionId] = useState<string | null>(null)
  const [joinUrl,       setJoinUrl]       = useState<string>('')
  const [sealing,       setSealing]       = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const joinSubRef  = useRef<ReturnType<typeof subscribeToSession> | null>(null)

  const [holdPct,    setHoldPct]    = useState(0)
  const holdRaf      = useRef<number>(0)
  const holdStart    = useRef<number>(0)
  const [sealedData, setSealedData] = useState<Capsule | null>(null)

  /* ── init ── */
  useEffect(() => {
    if (!isOnboarded()) { router.replace('/onboarding'); return }
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
      if (typeof window !== 'undefined') {
        const QRCode = (await import('qrcode')).default
        if (qrCanvasRef.current) {
          QRCode.toCanvas(qrCanvasRef.current, url, {
            width: 180,
            color: { dark: '#1A1410', light: '#E8DDD0' },
            margin: 2,
          })
        }
      }
      const existing = await getJoinEntries(sid)
      existing.forEach(e => {
        setMembers(prev => {
          if (prev.some(m => m.email === e.email)) return prev
          return [...prev, { name: e.name, email: e.email, initial: e.name[0]?.toUpperCase() ?? '?' }]
        })
      })
      joinSubRef.current = subscribeToSession(sid, entry => {
        setMembers(prev => {
          if (prev.some(m => m.email === entry.email)) return prev
          return [...prev, { name: entry.name, email: entry.email, initial: entry.name[0]?.toUpperCase() ?? '?' }]
        })
      })
    })
    return () => { joinSubRef.current?.unsubscribe() }
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
  const handleWaveSnap = useCallback((d: number[]) => setWaveSnap(d), [])

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
    setTimeout(() => setDeveloping(false), 2000)
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
  const stopVideo = () => vidRecRef.current?.stop()

  /* ── seal long-press ── */
  const startHold = () => {
    holdStart.current = performance.now()
    const tick = () => {
      const pct = Math.min((performance.now() - holdStart.current) / 3000, 1)
      setHoldPct(pct)
      if (pct < 1) holdRaf.current = requestAnimationFrame(tick)
      else doSeal()
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
    if (user) {
      saveCapsuleRemote(cap, user.email, {
        audio: audioBlob ?? undefined,
        photoDataUrl: photoUrl ?? undefined,
        video: videoBlob ?? undefined,
      }).then(updatedCap => {
        saveCapsule(updatedCap)
        setSealedData(updatedCap)
      }).catch(err => console.error('Supabase save error', err))
    }
    setTimeout(() => setStep('done'), 2600)
    setSealing(false)
  }

  const share = async () => {
    if (!sealedData) return
    await shareOrDownload(sealedData)
  }

  const daysUntil = (iso?: string) => {
    if (!iso) return 0
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  }

  /* ── LOADING ── */
  if (appState === 'loading') {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
      </main>
    )
  }

  /* ── SEALED ── */
  if (appState === 'sealed' && sealedCap) {
    const days = daysUntil(sealedCap.opensAt)
    return (
      <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>
        <div style={{ padding: '3.5rem 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ ...LABEL }}>beside</span>
          <span style={{ ...LABEL }}>{sealedCap.city}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', textAlign: 'center', gap: '0' }}>
          <p className="fade-up" style={{ ...LABEL, marginBottom: '1.5rem' }}>sealed</p>
          <p className="fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(7rem, 28vw, 11rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.9,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>{days}</p>
          <p className="fade-up-2" style={{ ...LABEL, marginTop: '1.25rem' }}>days remaining</p>
          <p className="fade-up-3" style={{
            marginTop: '2.5rem',
            fontSize: '12px',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-space)',
          }}>
            {new Date(sealedCap.sealedAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Navbar active="home" />
      </main>
    )
  }

  /* ── READY TO OPEN ── */
  if (appState === 'ready' && sealedCap) {
    return (
      <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '96px' }}>
        <div style={{ padding: '3.5rem 2rem 0' }}>
          <span style={{ ...LABEL }}>beside</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', textAlign: 'center', gap: '0' }}>
          <p className="fade-up" style={{ ...LABEL, color: 'var(--gold)', marginBottom: '1.5rem' }}>ready</p>
          <h2 className="fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 10vw, 3.6rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}>Your capsule<br />has opened.</h2>
          <p className="fade-up-2" style={{ marginTop: '1rem', fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>
            {sealedCap.city}
          </p>
          <button className="fade-up-3"
            onClick={() => router.push(`/capsules/${sealedCap.id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginTop: '3rem' }}>
            Open it →
          </button>
        </div>
        <Navbar active="home" />
      </main>
    )
  }

  /* ── CREATE FLOW ── */
  const circumference = 2 * Math.PI * 40

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', position: 'relative', overflow: 'hidden' }}>

      {/* ── LANDING ── */}
      {step === 'landing' && (
        <>
          <div style={{ padding: '3.5rem 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...LABEL }}>beside</span>
            <a href="/account" style={{
              width: '30px', height: '30px', borderRadius: '50%',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'var(--text-2)',
              fontFamily: 'var(--font-space)',
              textDecoration: 'none',
            }}>
              {getUser()?.name?.[0]?.toUpperCase() ?? '?'}
            </a>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 2rem 6rem' }}>
            <p className="fade-up" style={{
              ...LABEL,
              color: 'var(--gold-dim)',
              marginBottom: '2rem',
            }}>
              {geo?.city ?? '···'} · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            <h1 className="fade-up" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 12vw, 4.2rem)',
              lineHeight: 1.06,
              fontStyle: 'italic',
              fontWeight: 400,
              marginBottom: '2rem',
              letterSpacing: '-0.015em',
            }}>
              Who's beside<br />you tonight?
            </h1>

            <p className="fade-up-2" style={{
              fontSize: '0.9375rem',
              lineHeight: 1.75,
              color: 'var(--text-2)',
              fontFamily: 'var(--font-space)',
              fontWeight: 300,
              marginBottom: '3.5rem',
              maxWidth: '260px',
            }}>
              One take. Sealed for 1 month.<br />Only people actually beside you.
            </p>

            {monthlyUsed ? (
              <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-space)' }}>
                You've already made a capsule this month.
              </p>
            ) : (
              <button className="fade-up-3"
                onClick={() => setStep('tutorial')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: 0, textAlign: 'left' }}>
                Take a capsule →
              </button>
            )}
          </div>
          <Navbar active="home" />
        </>
      )}

      {/* ── TUTORIAL ── */}
      {step === 'tutorial' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
          <StepHeader onBack={() => setStep('landing')} step={0} total={4} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 2rem 6rem', gap: '2.5rem' }}>
            <div className="fade-up">
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 8vw, 2.8rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.1,
                marginBottom: '0.75rem',
              }}>Here's the drill.</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>
                4 steps. One take each. Sealed for a month.
              </p>
            </div>

            {/* Polaroid-style cards */}
            <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Voice',  sub: '60 seconds', rot: '-1.8deg', icon: VoiceIcon },
                { label: 'Photo',  sub: 'One shot',   rot: '1.3deg',  icon: PhotoIcon },
                { label: 'Video',  sub: '10 seconds', rot: '0.9deg',  icon: VideoIcon },
                { label: 'Tag',    sub: 'Who was there', rot: '-0.7deg', icon: TagIcon },
              ].map(({ label, sub, rot, icon: Icon }) => (
                <div key={label} style={{
                  background: '#F8F2E8',
                  borderRadius: '2px',
                  padding: '18px 14px 16px',
                  transform: `rotate(${rot})`,
                  boxShadow: '0 4px 18px rgba(26,20,16,0.10), 0 1px 3px rgba(26,20,16,0.07)',
                }}>
                  <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Icon />
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1410', marginBottom: '2px', fontFamily: 'var(--font-space)' }}>{label}</p>
                  <p style={{ fontSize: '9px', color: 'rgba(26,20,16,0.40)', fontFamily: 'var(--font-space)', letterSpacing: '0.08em' }}>{sub}</p>
                </div>
              ))}
            </div>

            <button className="fade-up-3"
              onClick={() => setStep('voice')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: 0, textAlign: 'left' }}>
              Start →
            </button>
          </div>
        </div>
      )}

      {/* ── VOICE ── */}
      {step === 'voice' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
          <StepHeader onBack={() => setStep('landing')} step={1} total={4} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '3rem' }}>

            <div className="fade-up" style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.08,
                marginBottom: '0.75rem',
              }}>Say something.</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>One take. No edits.</p>
            </div>

            {/* waveform */}
            <div style={{ width: '100%', paddingLeft: '8px', paddingRight: '8px', height: '72px' }}>
              {(recording || audioBlob) ? (
                <Waveform
                  stream={recording ? audioStream : null}
                  frozen={!!audioBlob && !recording}
                  frozenData={waveSnap}
                  onFreezeData={handleWaveSnap}
                  color="#A86828"
                  height={72}
                />
              ) : (
                <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '1px', background: 'var(--border-2)' }} />
                </div>
              )}
            </div>

            {/* record button */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '110px', height: '110px' }}>
              {recording && <>
                <div className="pulse-ring absolute rounded-full" style={{ width: '72px', height: '72px', border: '1px solid var(--gold)' }} />
                <div className="pulse-ring-2 absolute rounded-full" style={{ width: '72px', height: '72px', border: '1px solid var(--gold)' }} />
                <div className="pulse-ring-3 absolute rounded-full" style={{ width: '72px', height: '72px', border: '1px solid var(--gold)' }} />
              </>}
              <button
                onClick={recording ? stopRecording : startRecording}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  border: recording ? '1px solid var(--gold)' : '1px solid var(--border-2)',
                  background: recording ? 'rgba(168,104,40,0.06)' : 'var(--surface)',
                  cursor: 'pointer',
                  position: 'relative', zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: recording ? '20px' : '12px',
                  height: recording ? '20px' : '12px',
                  borderRadius: recording ? '4px' : '50%',
                  background: 'var(--gold)',
                  transition: 'all 0.3s ease',
                }} />
              </button>
            </div>

            <p style={{ ...LABEL }}>
              {recording ? 'tap to stop' : audioBlob ? 'recorded' : 'tap to record'}
            </p>

            {audioBlob && !recording && (
              <button className="fade-up"
                onClick={() => setStep('photo')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: 0 }}>
                Continue →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── PHOTO ── */}
      {step === 'photo' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
          <StepHeader onBack={() => setStep('voice')} step={2} total={4} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '2rem' }}>

            <div className="fade-up" style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.08,
                marginBottom: '0.75rem',
              }}>Who's beside you?</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>One shot. Make it real.</p>
            </div>

            {!camStream && !photoUrl && (
              <button onClick={() => openCamera()} style={{
                width: '100%', maxWidth: '300px', aspectRatio: '1',
                border: '1px solid var(--border-2)',
                borderRadius: '4px',
                background: 'var(--surface)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <PhotoIcon />
                <span style={{ ...LABEL }}>Open camera</span>
              </button>
            )}

            {camStream && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div className="iris-open" style={{ width: '100%', maxWidth: '300px', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* crosshair overlay */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: '16px', bottom: '16px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />
                  </div>
                  <button onClick={flipCamera} style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                  </button>
                </div>
                <button onClick={takePhoto} style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '1.5px solid var(--gold)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
                </button>
              </div>
            )}

            {photoUrl && !camStream && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={photoUrl} className={developing ? 'developing' : ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                {!developing && (
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <button onClick={() => setPhotoUrl(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-space)' }}>Retake</button>
                    <button onClick={() => setStep('video')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Continue →</button>
                  </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* ── VIDEO ── */}
      {step === 'video' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
          <StepHeader onBack={() => setStep('photo')} step={3} total={4} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '2rem' }}>

            <div className="fade-up" style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.08,
                marginBottom: '0.75rem',
              }}>Last one.</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>10 seconds. Just be here.</p>
            </div>

            {!vidStream && !videoBlob && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <button onClick={startVideo} style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-2)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className="vid-pulse" style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--gold)' }} />
                </button>
                <button onClick={() => setVidFacing(f => f === 'environment' ? 'user' : 'environment')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', ...LABEL, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  {vidFacing === 'environment' ? 'Back' : 'Front'} camera
                </button>
              </div>
            )}

            {vidStream && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden' }}>
                  <video ref={vidRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ height: '100%', width: `${vidProgress * 100}%`, background: 'var(--gold)', transition: 'width 0.1s linear' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <div className="vid-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }} />
                  </div>
                </div>
                <button onClick={stopVideo} style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  border: '1px solid var(--gold)',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--gold)' }} />
                </button>
              </div>
            )}

            {videoBlob && !vidStream && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '100%', maxWidth: '300px', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden' }}>
                  <video src={URL.createObjectURL(videoBlob)} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <button onClick={() => { setVideoBlob(null); setVidProgress(0) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-3)', fontFamily: 'var(--font-space)' }}>Retake</button>
                  <button onClick={() => setStep('tag')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Continue →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAG ── */}
      {step === 'tag' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
          <StepHeader onBack={() => setStep('video')} step={4} total={4} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', paddingTop: '2rem', gap: '2rem', overflowY: 'auto', paddingBottom: '2rem' }}>

            <div className="fade-up">
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.08,
                marginBottom: '0.75rem',
              }}>Who was there?</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>
                Share the QR so people can join instantly.
              </p>
            </div>

            {/* QR */}
            {joinUrl && (
              <div className="fade-up-2" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                padding: '24px',
                background: 'var(--surface)',
                borderRadius: '4px',
              }}>
                <p style={{ ...LABEL }}>Scan to join</p>
                <canvas ref={qrCanvasRef} style={{ borderRadius: '4px' }} />
                <button
                  onClick={() => { if (joinUrl) navigator.clipboard?.writeText(joinUrl) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    ...LABEL, color: 'var(--gold)',
                  }}>
                  Copy link
                </button>
              </div>
            )}

            {/* Manual input */}
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
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-2)',
                padding: '12px 0',
                fontSize: '16px',
                color: 'var(--text)',
                fontFamily: 'var(--font-inter)',
                outline: 'none',
              }}
            />

            {members.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {members.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', color: 'var(--text-2)',
                        fontFamily: 'var(--font-space)',
                      }}>{m.initial}</div>
                      <div>
                        <p style={{ fontSize: '14px', fontFamily: 'var(--font-space)' }}>{m.name}</p>
                        {m.email && <p style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-space)' }}>{m.email}</p>}
                      </div>
                    </div>
                    <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px', lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep('seal')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--gold)', fontSize: '1.25rem',
              fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: 0, textAlign: 'left',
            }}>
              {members.length > 0 ? 'Continue to seal →' : 'Seal alone →'}
            </button>
          </div>
        </div>
      )}

      {/* ── SEAL ── */}
      {step === 'seal' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '3rem' }}>
          <div className="fade-up">
            <p style={{ ...LABEL, color: 'var(--gold-dim)', marginBottom: '1.5rem' }}>Seal</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              marginBottom: '1rem',
              lineHeight: 1.08,
            }}>Hold to seal.</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)', lineHeight: 1.65 }}>
              Hold for 3 seconds.<br />Cannot be undone.
            </p>
          </div>

          {/* long-press ring */}
          <div
            style={{ position: 'relative', width: '130px', height: '130px', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
            onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
            onTouchStart={startHold} onTouchEnd={endHold}
          >
            <svg width="130" height="130" viewBox="0 0 130 130" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="40" fill="none" stroke="var(--border-2)" strokeWidth="1.5" />
              <circle
                cx="65" cy="65" r="40" fill="none"
                stroke="var(--gold)" strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - holdPct)}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: holdPct > 0 ? `rgba(168,104,40,${0.05 + holdPct * 0.12})` : 'var(--surface)',
                border: '1px solid var(--border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s',
              }}>
                <FilmPill gold={holdPct > 0} />
              </div>
            </div>
          </div>

          <button onClick={() => setStep('tag')} style={{ background: 'none', border: 'none', cursor: 'pointer', ...LABEL }}>back</button>
        </div>
      )}

      {/* ── SEALED ANIMATION ── */}
      {step === 'sealed-anim' && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
          <div className="stamp">
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--bg)', fontWeight: 700, fontStyle: 'italic' }}>B</span>
            </div>
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && sealedData && (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '0' }}>
          <p className="sealed-text" style={{ ...LABEL, color: 'var(--gold)', marginBottom: '2rem' }}>Sealed</p>
          <h2 className="fade-up" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 12vw, 4rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.06,
            marginBottom: '2rem',
            letterSpacing: '-0.015em',
          }}>
            See you in<br />1 month.
          </h2>
          <div className="fade-up-2" style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)' }}>{sealedData.city}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '4px' }}>
              Opens {new Date(sealedData.opensAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
            {sealedData.members.length > 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginTop: '4px' }}>
                {sealedData.members.length + 1} people sealed inside
              </p>
            )}
          </div>
          <button className="fade-up-3" onClick={share} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--gold)', fontSize: '1.25rem',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            marginBottom: '1.5rem',
          }}>
            Share to Stories →
          </button>
          <button onClick={() => router.push('/capsules')} style={{ background: 'none', border: 'none', cursor: 'pointer', ...LABEL }}>
            View capsules
          </button>
        </div>
      )}
    </main>
  )
}

/* ── Sub-components ── */

function StepHeader({ onBack, step, total }: { onBack: () => void; step: number; total: number }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5rem 2rem 1.5rem' }}>
        <button onClick={onBack} style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(26,20,16,0.06)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="rgba(26,20,16,0.38)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-space)', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--text-3)' }}>beside</span>
        <span style={{ fontFamily: 'var(--font-space)', fontSize: '10px', color: 'var(--text-3)', width: '32px', textAlign: 'right' }}>{step}/{total}</span>
      </div>
      {/* progress bar */}
      <div style={{ display: 'flex', gap: '4px', paddingLeft: '2rem', paddingRight: '2rem' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '1px', borderRadius: '1px',
            background: i < step ? 'var(--gold)' : 'var(--border-2)',
            transition: 'background 0.4s',
          }} />
        ))}
      </div>
    </div>
  )
}

function FilmPill({ gold }: { gold?: boolean }) {
  return (
    <div style={{
      width: '16px', height: '28px', borderRadius: '9px',
      border: `1.5px solid ${gold ? 'var(--gold)' : 'var(--border-2)'}`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '46%', left: '2px', right: '2px',
        height: '1px',
        background: gold ? 'var(--gold-dim)' : 'var(--border-2)',
      }} />
    </div>
  )
}

function VoiceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
      <rect x="6"  y="20" width="4" height="8"  rx="2" fill="var(--gold)" opacity="0.30"/>
      <rect x="13" y="15" width="4" height="18" rx="2" fill="var(--gold)" opacity="0.55"/>
      <rect x="20" y="10" width="4" height="24" rx="2" fill="var(--gold)"/>
      <rect x="27" y="16" width="4" height="14" rx="2" fill="var(--gold)" opacity="0.60"/>
      <rect x="34" y="20" width="4" height="6"  rx="2" fill="var(--gold)" opacity="0.30"/>
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="11" width="32" height="22" rx="5" stroke="var(--gold)" strokeWidth="1.4" opacity="0.7"/>
      <circle cx="20" cy="22" r="7.5" stroke="var(--gold)" strokeWidth="1.4" opacity="0.7"/>
      <circle cx="20" cy="22" r="3" fill="var(--gold)" opacity="0.35"/>
      <path d="M14 11V9a2 2 0 012-2h8a2 2 0 012 2v2" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
      <rect x="4" y="11" width="26" height="22" rx="3" stroke="var(--gold)" strokeWidth="1.4" opacity="0.7"/>
      <path d="M16 18l10 4-10 5V18z" fill="var(--gold)" opacity="0.6"/>
      <path d="M30 17l9-4v18l-9-4V17z" stroke="var(--gold)" strokeWidth="1.4" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
      <circle cx="15" cy="14" r="5" stroke="var(--gold)" strokeWidth="1.4" opacity="0.7"/>
      <path d="M5 34c0-5.5 4.5-9 10-9" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <circle cx="29" cy="14" r="5" stroke="var(--gold)" strokeWidth="1.4" opacity="0.7"/>
      <path d="M39 34c0-5.5-4.5-9-10-9" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}
