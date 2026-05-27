'use client'
import { useEffect, useRef } from 'react'

interface Props {
  stream: MediaStream | null
  frozen?: boolean
  frozenData?: number[]
  onFreezeData?: (data: number[]) => void
  color?: string
  height?: number
}

export default function Waveform({
  stream,
  frozen = false,
  frozenData,
  onFreezeData,
  color = 'var(--gold)',
  height = 72,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const ctxAudio  = useRef<AudioContext | null>(null)

  /* live waveform */
  useEffect(() => {
    if (!stream || frozen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const audioCtx  = new AudioContext()
    ctxAudio.current = audioCtx
    const source    = audioCtx.createMediaStreamSource(stream)
    const analyser  = audioCtx.createAnalyser()
    analyser.fftSize = 128
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(data)

      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      /* gradient line */
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0,   'transparent')
      grad.addColorStop(0.1, color)
      grad.addColorStop(0.9, color)
      grad.addColorStop(1,   'transparent')
      ctx.strokeStyle = grad
      ctx.lineWidth   = 1.5
      ctx.lineJoin    = 'round'
      ctx.lineCap     = 'round'

      ctx.beginPath()
      const step = w / (data.length - 1)
      for (let i = 0; i < data.length; i++) {
        const x = i * step
        const y = ((data[i] - 128) / 128) * (h * 0.45) + h / 2
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      /* hand off snapshot when about to freeze */
      if (onFreezeData) onFreezeData(Array.from(data))
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      audioCtx.close()
    }
  }, [stream, frozen, color, onFreezeData])

  /* frozen frame */
  useEffect(() => {
    if (!frozen || !frozenData) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0,   'transparent')
    grad.addColorStop(0.1, color)
    grad.addColorStop(0.9, color)
    grad.addColorStop(1,   'transparent')
    ctx.strokeStyle = grad
    ctx.globalAlpha = 0.55
    ctx.lineWidth   = 1.5
    ctx.lineJoin    = 'round'

    ctx.beginPath()
    const step = w / (frozenData.length - 1)
    frozenData.forEach((v, i) => {
      const x = i * step
      const y = ((v - 128) / 128) * (h * 0.45) + h / 2
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.globalAlpha = 1
  }, [frozen, frozenData, color])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={height}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  )
}
