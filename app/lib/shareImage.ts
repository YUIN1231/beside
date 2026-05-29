import type { Capsule } from './types'
import { getUser } from './storage'

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function spacedText(
  ctx: CanvasRenderingContext2D,
  text: string, cx: number, y: number, spacing: number
) {
  const letters = text.split('')
  const widths = letters.map(l => ctx.measureText(l).width)
  const total = widths.reduce((s, w) => s + w, 0) + spacing * (letters.length - 1)
  let x = cx - total / 2
  letters.forEach((l, i) => {
    ctx.fillText(l, x + widths[i] / 2, y)
    x += widths[i] + spacing
  })
}

export async function buildShareImage(cap: Capsule): Promise<Blob> {
  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // ── Background ────────────────────────────────────────────────
  ctx.fillStyle = '#06070d'
  ctx.fillRect(0, 0, W, H)

  // dark atmospheric gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0,   'rgba(10, 12, 28, 0.8)')
  bg.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  bg.addColorStop(1,   'rgba(4, 4, 12, 0.9)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const CX = W / 2
  const CY = H * 0.40

  // subtle crystal glow at center
  const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 500)
  glow.addColorStop(0, 'rgba(184, 200, 240, 0.1)')
  glow.addColorStop(1, 'rgba(184, 200, 240, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // ── Film grain ────────────────────────────────────────────────
  const grain = document.createElement('canvas')
  grain.width = W; grain.height = H
  const gc = grain.getContext('2d')!
  const gd = gc.createImageData(W, H)
  for (let i = 0; i < gd.data.length; i += 4) {
    const v = Math.random() * 255
    gd.data[i] = gd.data[i+1] = gd.data[i+2] = v
    gd.data[i+3] = 9
  }
  gc.putImageData(gd, 0, 0)
  ctx.drawImage(grain, 0, 0)

  // ── "beside" wordmark ─────────────────────────────────────────
  ctx.font = '500 54px Georgia, serif'
  ctx.fillStyle = '#d4e0ff'
  ctx.textAlign = 'center'
  spacedText(ctx, 'beside', CX, 222, 20)

  ctx.beginPath()
  ctx.moveTo(CX - 100, 258); ctx.lineTo(CX + 100, 258)
  ctx.strokeStyle = 'rgba(184,200,240,0.14)'
  ctx.lineWidth = 1; ctx.stroke()

  // ── Ring illustration ─────────────────────────────────────────
  const R = 315

  // outer orbit dashes
  ctx.save()
  ctx.setLineDash([5, 26])
  ctx.beginPath()
  ctx.arc(CX, CY, R + 30, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(200,210,255,0.06)'
  ctx.lineWidth = 1.5; ctx.stroke()
  ctx.restore()

  // mid ring
  ctx.beginPath()
  ctx.arc(CX, CY, R + 10, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(200,210,255,0.04)'
  ctx.lineWidth = 1; ctx.stroke()

  // iridescent gradient arc
  ctx.save()
  const arcG = ctx.createLinearGradient(CX-R, CY-R, CX+R, CY+R)
  arcG.addColorStop(0,    'rgba(255,255,255,0.85)')
  arcG.addColorStop(0.35, 'rgba(184,200,240,0.75)')
  arcG.addColorStop(0.7,  'rgba(160,225,210,0.6)')
  arcG.addColorStop(1,    'rgba(200,210,255,0)')
  ctx.beginPath()
  ctx.arc(CX, CY, R, -Math.PI * 0.38, Math.PI * 0.72)
  ctx.strokeStyle = arcG; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.restore()

  // inner dark disk
  ctx.beginPath()
  ctx.arc(CX, CY, R - 18, 0, Math.PI * 2)
  ctx.fillStyle = '#07080f'; ctx.fill()

  // inner crystal glow
  const ig = ctx.createRadialGradient(CX, CY, 0, CX, CY, R - 18)
  ig.addColorStop(0, 'rgba(184,200,240,0.08)')
  ig.addColorStop(0.65, 'rgba(184,200,240,0.02)')
  ig.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ig
  ctx.beginPath(); ctx.arc(CX, CY, R - 18, 0, Math.PI * 2); ctx.fill()

  // ── Glass pill icon ───────────────────────────────────────────
  const PW = 52, PH = 88, PR = 26

  // glass body
  const pg = ctx.createLinearGradient(CX - PW/2, CY - PH/2, CX - PW/2, CY + PH/2)
  pg.addColorStop(0, 'rgba(255,255,255,0.18)')
  pg.addColorStop(0.5, 'rgba(184,200,240,0.08)')
  pg.addColorStop(1, 'rgba(184,200,240,0.04)')
  roundRect(ctx, CX - PW/2+1, CY - PH/2+1, PW-2, PH-2, PR-1)
  ctx.fillStyle = pg; ctx.fill()

  // glass border (iridescent)
  const pb = ctx.createLinearGradient(CX - PW/2, CY - PH/2, CX + PW/2, CY + PH/2)
  pb.addColorStop(0, 'rgba(255,255,255,0.7)')
  pb.addColorStop(0.5, 'rgba(184,200,240,0.55)')
  pb.addColorStop(1, 'rgba(160,225,210,0.4)')
  roundRect(ctx, CX - PW/2, CY - PH/2, PW, PH, PR)
  ctx.strokeStyle = pb; ctx.lineWidth = 2.5; ctx.stroke()

  // inner highlight
  ctx.beginPath()
  ctx.moveTo(CX - PW/2 + 8, CY - PH/2 + 8)
  ctx.lineTo(CX + PW/2 - 8, CY - PH/2 + 8)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()

  // seam line
  ctx.beginPath()
  ctx.moveTo(CX - PW/2+6, CY); ctx.lineTo(CX + PW/2-6, CY)
  ctx.strokeStyle = 'rgba(200,215,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke()

  // ── City ──────────────────────────────────────────────────────
  const baseY = CY + R + 100

  ctx.font = '26px sans-serif'
  ctx.fillStyle = 'rgba(184,200,240,0.4)'
  ctx.textAlign = 'center'
  spacedText(ctx, 'captured in', CX, baseY - 4, 4)

  // auto-scale city name
  ctx.font = 'bold 96px Georgia, serif'
  const cityUp = cap.city.toUpperCase()
  const cw = ctx.measureText(cityUp).width
  if (cw > W - 100) {
    ctx.font = `bold ${Math.floor(96 * (W - 100) / cw)}px Georgia, serif`
  }
  ctx.fillStyle = '#e8eaf6'
  ctx.fillText(cityUp, CX, baseY + 108)

  // ── Tagline ───────────────────────────────────────────────────
  ctx.font = 'italic 40px Georgia, serif'
  ctx.fillStyle = 'rgba(200,210,255,0.28)'
  ctx.fillText('Something is sealed inside.', CX, baseY + 190)

  // ── Divider ───────────────────────────────────────────────────
  const divY = baseY + 268
  ctx.beginPath()
  ctx.moveTo(CX - 230, divY); ctx.lineTo(CX + 230, divY)
  ctx.strokeStyle = 'rgba(200,210,255,0.07)'; ctx.lineWidth = 1; ctx.stroke()

  // ── Dates ─────────────────────────────────────────────────────
  const opensDate = new Date(cap.opensAt!)
  const opensStr = opensDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const sealedStr = new Date(cap.sealedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  ctx.font = '28px sans-serif'
  ctx.fillStyle = 'rgba(184,200,240,0.38)'
  ctx.fillText(`sealed  ${sealedStr}`, CX, divY + 70)

  ctx.font = '38px Georgia, serif'
  ctx.fillStyle = '#b8c8f0'
  ctx.fillText(`opens  ${opensStr}`, CX, divY + 144)

  // ── People circles ────────────────────────────────────────────
  const user = getUser()
  const userInit = user?.name?.[0]?.toUpperCase() ?? '?'
  const initials = [userInit, ...cap.members.map(m => m.initial)].slice(0, 6)

  if (initials.length > 1) {
    const AR = 34, gap = 82
    const totalAW = (initials.length - 1) * gap
    const startAX = CX - totalAW / 2
    const ay = divY + 240

    initials.forEach((init, i) => {
      const ax = startAX + i * gap
      ctx.beginPath(); ctx.arc(ax, ay, AR, 0, Math.PI * 2)
      ctx.fillStyle = '#0c0d1a'; ctx.fill()

      const rg = ctx.createLinearGradient(ax-AR, ay-AR, ax+AR, ay+AR)
      rg.addColorStop(0, i === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(184,200,240,0.3)')
      rg.addColorStop(1, i === 0 ? 'rgba(184,200,240,0.6)' : 'rgba(184,200,240,0.12)')
      ctx.strokeStyle = rg; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(ax, ay, AR, 0, Math.PI * 2); ctx.stroke()

      ctx.font = '22px Georgia, serif'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = i === 0 ? '#d4e0ff' : '#b8c8f0'
      ctx.fillText(init, ax, ay)
      ctx.textBaseline = 'alphabetic'
    })

    ctx.font = '28px sans-serif'
    ctx.fillStyle = 'rgba(200,210,255,0.22)'
    ctx.fillText(`${initials.length} people sealed this`, CX, divY + 326)
  }

  // ── Footer ────────────────────────────────────────────────────
  ctx.font = '25px sans-serif'
  ctx.fillStyle = 'rgba(184,200,240,0.2)'
  ctx.fillText('beside-gules.vercel.app', CX, H - 108)

  // ── Final vignette ────────────────────────────────────────────
  const vig = ctx.createRadialGradient(CX, H/2, H*0.28, CX, H/2, H*0.75)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/png', 0.94)
  })
}

export async function shareOrDownload(cap: Capsule) {
  const blob = await buildShareImage(cap)
  const file = new File([blob], 'beside-sealed.png', { type: 'image/png' })
  const opensStr = new Date(cap.opensAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const text = `Something is sealed from ${cap.city}. It opens ${opensStr}.`
  try {
    if (navigator.share) {
      await navigator.share({ files: [file], title: 'beside', text })
    } else {
      throw new Error('no share api')
    }
  } catch {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'beside-sealed.png'
    a.click()
  }
}
