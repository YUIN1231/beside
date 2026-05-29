'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Hand = 'グー' | 'チョキ' | 'パー'
type Result = '勝ち' | '負け' | 'あいこ'
type Phase = 'select' | 'idle' | 'jan' | 'ken' | 'pon'

const HANDS: Hand[] = ['グー', 'チョキ', 'パー']
const EMOJI: Record<Hand, string> = { グー: '✊', チョキ: '✌️', パー: '🖐️' }

const ANIMALS = [
  { id: 'bear',   emoji: '🐻', name: 'クマ'   },
  { id: 'fox',    emoji: '🦊', name: 'キツネ' },
  { id: 'frog',   emoji: '🐸', name: 'カエル' },
  { id: 'panda',  emoji: '🐼', name: 'パンダ' },
  { id: 'cat',    emoji: '🐱', name: 'ネコ'   },
  { id: 'rabbit', emoji: '🐰', name: 'ウサギ' },
]
type Animal = typeof ANIMALS[0]

const CONFETTI = ['#b8c8f0','#FFE566','#FF6B6B','#7EC8E3','#A8E6A3','#E8E4D9','#FF9F7F','#C9B1FF']

function judge(player: Hand, cpu: Hand): Result {
  if (player === cpu) return 'あいこ'
  if (
    (player === 'グー' && cpu === 'チョキ') ||
    (player === 'チョキ' && cpu === 'パー') ||
    (player === 'パー' && cpu === 'グー')
  ) return '勝ち'
  return '負け'
}

function ConfettiBurst() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const angle = (i / 60) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
      const dist = 100 + Math.random() * 240
      return {
        id: i,
        tx: Math.round(Math.cos(angle) * dist),
        ty: Math.round(Math.sin(angle) * dist),
        w: Math.round(Math.random() * 11 + 5),
        h: Math.round(Math.random() * 11 + 5),
        color: CONFETTI[i % CONFETTI.length],
        delay: Math.round(Math.random() * 350),
        rot: Math.round(Math.random() * 900 - 450),
        round: i % 4 === 0,
      }
    })
  , [])

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: '50%', top: '45%',
          width: p.w, height: p.round ? p.w : p.h,
          background: p.color,
          borderRadius: p.round ? '50%' : '3px',
          animation: `cfly 1.5s ease-out ${p.delay}ms both`,
          '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, '--rot': `${p.rot}deg`,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

export default function JankenPage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [playerAnimal, setPlayerAnimal] = useState<Animal | null>(null)
  const [cpuAnimal, setCpuAnimal] = useState<Animal>(ANIMALS[1])
  const [playerHand, setPlayerHand] = useState<Hand | null>(null)
  const [cpuHand, setCpuHand] = useState<Hand | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 })
  const [confetti, setConfetti] = useState(false)
  const [flash, setFlash] = useState(false)

  function chooseAnimal(animal: Animal) {
    const others = ANIMALS.filter(a => a.id !== animal.id)
    setCpuAnimal(others[Math.floor(Math.random() * others.length)])
    setPlayerAnimal(animal)
    setPhase('idle')
  }

  function play(hand: Hand) {
    const cpu = HANDS[Math.floor(Math.random() * 3)]
    const r = judge(hand, cpu)
    setPlayerHand(hand)
    setCpuHand(cpu)
    setResult(r)
    setPhase('jan')
    setTimeout(() => setPhase('ken'), 700)
    setTimeout(() => {
      setPhase('pon')
      setScore(s => ({
        win:  s.win  + (r === '勝ち' ? 1 : 0),
        lose: s.lose + (r === '負け' ? 1 : 0),
        draw: s.draw + (r === 'あいこ' ? 1 : 0),
      }))
      if (r === '勝ち') {
        setFlash(true)
        setTimeout(() => setFlash(false), 500)
        setTimeout(() => setConfetti(true), 150)
        setTimeout(() => setConfetti(false), 2800)
      }
    }, 1400)
  }

  function replay() {
    setPhase('idle')
    setPlayerHand(null)
    setCpuHand(null)
    setResult(null)
  }

  const isShaking = phase === 'jan' || phase === 'ken'

  return (
    <main className="min-h-screen flex flex-col overflow-hidden" style={{ background: '#0a0e1a', color: '#e8e4d9' }}>
      <style>{`
        @keyframes bob-down {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(18px); }
        }
        @keyframes bob-up {
          0%,100% { transform: translateY(0) rotate(180deg); }
          50%      { transform: translateY(-18px) rotate(180deg); }
        }
        @keyframes pop {
          0%  { transform: scale(0.5); opacity: 0; }
          65% { transform: scale(1.12); }
          100%{ transform: scale(1);   opacity: 1; }
        }
        @keyframes pop-flip {
          0%  { transform: scale(0.5) rotate(180deg); opacity: 0; }
          65% { transform: scale(1.12) rotate(180deg); }
          100%{ transform: scale(1) rotate(180deg); opacity: 1; }
        }
        @keyframes stamp {
          0%  { transform: scale(1.7); opacity: 0; }
          60% { transform: scale(0.93); opacity: 1; }
          100%{ transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-up {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes winner-jump {
          0%  { transform: translateY(0)   scale(1)    rotate(0deg); }
          20% { transform: translateY(-28px) scale(1.25) rotate(-8deg); }
          40% { transform: translateY(-38px) scale(1.35) rotate(8deg); }
          60% { transform: translateY(-28px) scale(1.25) rotate(-4deg); }
          80% { transform: translateY(-8px)  scale(1.05) rotate(2deg); }
          100%{ transform: translateY(0)   scale(1)    rotate(0deg); }
        }
        @keyframes loser-slump {
          0%  { transform: scale(1)    rotate(0deg); opacity: 1; }
          100%{ transform: scale(0.78) rotate(-8deg); opacity: 0.35; }
        }
        @keyframes glow-pulse {
          0%,100%{ filter: drop-shadow(0 0 6px rgba(184,200,240,0.5)); }
          50%     { filter: drop-shadow(0 0 22px rgba(184,200,240,1)); }
        }
        @keyframes victory-pop {
          0%  { transform: scale(2.2); opacity: 0; }
          55% { transform: scale(0.88); opacity: 1; }
          78% { transform: scale(1.06); }
          100%{ transform: scale(1); opacity: 1; }
        }
        @keyframes screen-flash {
          0%  { opacity: 1; }
          100%{ opacity: 0; }
        }
        @keyframes cfly {
          0%  { transform: translate(-50%,-50%) rotate(0deg) scale(1);   opacity: 1; }
          80% { opacity: 1; }
          100%{ transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.3); opacity: 0; }
        }
        @keyframes slide-in {
          from { transform: translateX(-16px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>

      {/* Win flash overlay */}
      {flash && (
        <div className="fixed inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(184,200,240,0.25) 0%, transparent 70%)',
          animation: 'screen-flash 0.5s ease-out forwards',
          zIndex: 80,
        }} />
      )}

      {confetti && <ConfettiBurst />}

      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-14 pb-5" style={{ borderBottom: '1px solid #1e2438' }}>
        <Link href="/" className="text-xs tracking-widest" style={{ color: '#4a5068' }}>← back</Link>
        <span className="text-lg font-light tracking-[0.3em]">じゃんけん</span>
        {phase !== 'select' ? (
          <button onClick={() => { setPhase('select'); setResult(null); setPlayerHand(null); setCpuHand(null) }}
            className="text-xs tracking-wider" style={{ color: '#2a3050' }}>
            change
          </button>
        ) : <div className="w-14" />}
      </div>

      {/* Score */}
      {phase !== 'select' && (
        <div className="flex justify-center gap-10 py-3">
          {([['win','勝'],['draw','引'],['lose','負']] as [keyof typeof score, string][]).map(([k, label]) => (
            <div key={k} className="flex flex-col items-center gap-1">
              <span className="text-xl font-extralight tabular-nums" style={{ color: k === 'win' ? '#b8c8f0' : '#4a5068' }}>
                {score[k]}
              </span>
              <span className="text-xs tracking-widest" style={{ color: '#2a3050' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ANIMAL SELECT ── */}
      {phase === 'select' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 pb-10">
          <p className="text-xs tracking-[0.25em] uppercase" style={{ color: '#4a5068' }}>
            キャラクターを選んで
          </p>
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {ANIMALS.map((a, i) => (
              <button key={a.id} onClick={() => chooseAnimal(a)}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-100 active:scale-88"
                style={{ border: '1px solid #1e2438', animation: `fade-up 0.3s ease-out ${i * 55}ms both`, opacity: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8c8f0'; e.currentTarget.style.background = 'rgba(184,200,240,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2438'; e.currentTarget.style.background = 'transparent' }}
              >
                <span className="text-4xl leading-none">{a.emoji}</span>
                <span className="text-xs tracking-wider" style={{ color: '#4a5068' }}>{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── BATTLE ── */}
      {phase !== 'select' && playerAnimal && (
        <div className="flex-1 grid" style={{ gridTemplateRows: '1fr auto 1fr' }}>

          {/* CPU — top */}
          <div className="flex flex-col items-center justify-end pb-3 gap-1">
            <span className="text-xs tracking-[0.2em]" style={{ color: '#2a3050' }}>
              {cpuAnimal.name}
            </span>
            <span className="text-4xl leading-none" style={phase === 'pon' ? {
              animation: result === '負け'
                ? 'winner-jump 0.9s ease-out 0.25s both'
                : result === '勝ち'
                ? 'loser-slump 0.5s ease-out 0.3s both'
                : 'pop 0.4s ease-out 0.2s both',
              display: 'inline-block',
              opacity: phase === 'pon' ? undefined : 0,
            } : {}}>
              {cpuAnimal.emoji}
            </span>
            <span
              key={`cpu-fist-${phase}`}
              className="text-8xl leading-none select-none"
              style={isShaking ? {
                display: 'inline-block',
                animation: 'bob-up 0.38s ease-in-out infinite',
              } : phase === 'pon' ? {
                display: 'inline-block',
                animation: 'pop-flip 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards',
                opacity: 0,
              } : { display: 'none' }}
            >
              {isShaking ? '✊' : EMOJI[cpuHand!]}
            </span>
            {phase === 'pon' && cpuHand && (
              <span className="text-xs" style={{ color: '#2a3050', animation: 'fade-up 0.3s ease-out 0.4s both', opacity: 0 }}>
                {cpuHand}
              </span>
            )}
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-3 py-2">
            {/* Dots */}
            {isShaking && (
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#b8c8f0' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: phase === 'ken' ? '#b8c8f0' : '#1e2438', transition: 'background 0.1s' }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1e2438' }} />
              </div>
            )}

            {/* Countdown / result text */}
            {isShaking && (
              <span key={`c-${phase}`} className="text-3xl font-light tracking-[0.35em]"
                style={{ color: '#b8c8f0', animation: 'stamp 0.2s ease-out forwards', opacity: 0 }}>
                {phase === 'jan' ? 'じゃん' : 'けん'}
              </span>
            )}
            {phase === 'pon' && result && (
              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-extralight tracking-[0.2em]"
                  style={{
                    fontSize: result === '勝ち' ? '2.8rem' : '2.2rem',
                    color: result === '勝ち' ? '#b8c8f0' : result === '負け' ? '#4a5068' : '#2a4060',
                    animation: result === '勝ち'
                      ? 'victory-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, glow-pulse 2s ease-in-out 0.6s infinite'
                      : 'stamp 0.3s ease-out forwards',
                    opacity: 0,
                    display: 'inline-block',
                  }}
                >
                  {result === '勝ち' ? '✨ 勝ち！ ✨' : result === '負け' ? '負け...' : 'あいこ'}
                </span>
                {result === '勝ち' && (
                  <span className="text-xs tracking-widest" style={{
                    color: '#b8c8f0',
                    animation: 'fade-up 0.3s ease-out 0.5s both',
                    opacity: 0,
                  }}>
                    やったー！
                  </span>
                )}
              </div>
            )}

            {/* Hand selection */}
            {phase === 'idle' && (
              <div className="flex gap-4 mt-1">
                {HANDS.map((hand, i) => (
                  <button key={hand} onClick={() => play(hand)}
                    className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl transition-all duration-100 active:scale-90"
                    style={{
                      border: '1px solid #1e2438',
                      animation: `fade-up 0.3s ease-out ${i * 60}ms both`,
                      opacity: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8c8f0'; e.currentTarget.style.background = 'rgba(184,200,240,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2438'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <span className="text-4xl leading-none">{EMOJI[hand]}</span>
                    <span className="text-xs tracking-widest" style={{ color: '#4a5068' }}>{hand}</span>
                  </button>
                ))}
              </div>
            )}

            {/* もう一度 */}
            {phase === 'pon' && (
              <button onClick={replay}
                className="text-xs tracking-[0.2em] uppercase px-8 py-3 rounded-full mt-1 active:scale-95"
                style={{
                  border: '1px solid #1e2438',
                  color: '#4a5068',
                  animation: 'fade-up 0.3s ease-out 0.9s both',
                  opacity: 0,
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                もう一度
              </button>
            )}
          </div>

          {/* Player — bottom */}
          <div className="flex flex-col items-center justify-start pt-3 gap-1">
            {phase === 'pon' && playerHand && (
              <span className="text-xs" style={{ color: '#2a3050', animation: 'fade-up 0.3s ease-out 0.4s both', opacity: 0 }}>
                {playerHand}
              </span>
            )}
            <span
              key={`pl-fist-${phase}`}
              className="text-8xl leading-none select-none"
              style={isShaking ? {
                display: 'inline-block',
                animation: 'bob-down 0.38s ease-in-out infinite',
              } : phase === 'pon' ? {
                display: 'inline-block',
                animation: 'pop 0.38s cubic-bezier(0.34,1.56,0.64,1) 0.07s forwards',
                opacity: 0,
              } : { display: 'none' }}
            >
              {isShaking ? '✊' : EMOJI[playerHand!]}
            </span>
            <span className="text-4xl leading-none" style={phase === 'pon' ? {
              display: 'inline-block',
              animation: result === '勝ち'
                ? 'winner-jump 0.9s ease-out 0.35s both'
                : result === '負け'
                ? 'loser-slump 0.5s ease-out 0.3s both'
                : 'pop 0.4s ease-out 0.2s both',
              opacity: phase === 'pon' ? undefined : 0,
            } : {}}>
              {playerAnimal.emoji}
            </span>
            <span className="text-xs tracking-[0.2em]" style={{ color: '#2a3050' }}>
              {playerAnimal.name}
            </span>
          </div>

        </div>
      )}
    </main>
  )
}
