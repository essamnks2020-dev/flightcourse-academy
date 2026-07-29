'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Share2, Download, Copy, Check } from 'lucide-react'
import type { Attempt, LandingQuality } from '@/lib/aviation'
import { QUALITY_LABELS, QUALITY_COLORS, QUALITY_BLURBS } from '@/lib/aviation'
import { useProgressStore } from '@/stores/progress-store'
import { track } from '@/lib/funnel'
import { toast } from 'sonner'

const NAVY = '#0B1D3A'
const SKY = '#3E92CC'
const GOLD = '#F2B134'

/** Draw the share card to an offscreen canvas and return a PNG blob. */
export async function generateShareCard(
  attempt: Attempt,
  bestScore: number,
): Promise<Blob> {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // make sure brand fonts are ready
  try {
    await Promise.all([
      document.fonts.load('700 64px Sora'),
      document.fonts.load('500 28px Sora'),
      document.fonts.load('500 24px "JetBrains Mono"'),
    ])
    await document.fonts.ready
  } catch {
    /* fall back to system fonts */
  }

  // --- background ---
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0a1830')
  bg.addColorStop(0.5, NAVY)
  bg.addColorStop(1, '#050d1d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // horizon glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 40, W * 0.5, H * 0.42, W * 0.7)
  glow.addColorStop(0, 'rgba(242,177,52,0.18)')
  glow.addColorStop(0.5, 'rgba(62,146,204,0.08)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // top accent bar
  ctx.fillStyle = GOLD
  ctx.fillRect(0, 0, W, 8)

  // --- wordmark ---
  ctx.textAlign = 'left'
  ctx.fillStyle = '#cfe0f2'
  ctx.font = '700 30px Sora, sans-serif'
  ctx.fillText('FLIGHT', 64, 92)
  ctx.fillStyle = GOLD
  ctx.fillText('COURSE', 64 + ctx.measureText('FLIGHT').width + 10, 92)
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText('LANDING FLARE TRAINER', 64, 122)

  // --- score ---
  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = '800 240px Sora, sans-serif'
  const scoreStr = String(attempt.score)
  ctx.fillText(scoreStr, W / 2, 360)
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 44px Sora, sans-serif'
  ctx.fillText('/ 100', W / 2, 410)

  // --- quality badge ---
  const qColor = QUALITY_COLORS[attempt.quality]
  const qLabel = QUALITY_LABELS[attempt.quality]
  ctx.font = '700 44px Sora, sans-serif'
  const labelW = ctx.measureText(qLabel).width
  const badgeW = labelW + 80
  const badgeH = 78
  const bx = W / 2 - badgeW / 2
  const by = 450
  ctx.fillStyle = qColor
  roundRect(ctx, bx, by, badgeW, badgeH, 16)
  ctx.fill()
  ctx.fillStyle = NAVY
  ctx.fillText(qLabel, W / 2, by + 54)

  // blurb
  ctx.fillStyle = '#9fb1c8'
  ctx.font = 'italic 400 26px Sora, sans-serif'
  wrapText(ctx, QUALITY_BLURBS[attempt.quality], W / 2, by + badgeH + 44, W - 160, 34)

  // --- stats row ---
  const stats = [
    { label: 'TOUCHDOWN', value: `${Math.round(attempt.touchdownVSI)} fpm`, good: Math.abs(attempt.touchdownVSI) < 150 },
    { label: 'SPEED', value: `${Math.round(attempt.touchdownAirspeed)} kt`, good: attempt.touchdownAirspeed >= 50 && attempt.touchdownAirspeed <= 62 },
    { label: 'DISTANCE', value: `${Math.round(attempt.touchdownDistance)} ft`, good: attempt.touchdownDistance > 0 && attempt.touchdownDistance < 1000 },
    { label: 'FLARE @', value: `${Math.round(attempt.flareAltitude)} ft`, good: attempt.flareAltitude > 4 && attempt.flareAltitude < 25 },
  ]
  const sy = 720
  const sw = (W - 128) / stats.length
  stats.forEach((s, i) => {
    const sx = 64 + i * sw
    ctx.fillStyle = '#5f7a99'
    ctx.font = '500 20px "JetBrains Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(s.label, sx + sw / 2, sy)
    ctx.fillStyle = s.good ? '#5fcf6a' : '#cfe0f2'
    ctx.font = '700 40px "JetBrains Mono", monospace'
    ctx.fillText(s.value, sx + sw / 2, sy + 46)
    if (i < stats.length - 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(sx + sw - 1, sy - 16, 2, 64)
    }
  })

  // chips: crosswind / bounces
  const chipsY = 820
  const chips: string[] = []
  if (attempt.crosswind) chips.push('CROSSWIND')
  if (attempt.bounces > 0) chips.push(`${attempt.bounces} BOUNCE${attempt.bounces > 1 ? 'S' : ''}`)
  if (attempt.stalled) chips.push('STALL')
  if (chips.length === 0) chips.push('CLEAN APPROACH')
  ctx.font = '600 22px "JetBrains Mono", monospace'
  let cx = 64
  chips.forEach((c) => {
    const cw = ctx.measureText(c).width + 36
    ctx.fillStyle = 'rgba(62,146,204,0.15)'
    roundRect(ctx, cx, chipsY, cw, 40, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(62,146,204,0.5)'
    ctx.lineWidth = 1.5
    roundRect(ctx, cx, chipsY, cw, 40, 20)
    ctx.stroke()
    ctx.fillStyle = SKY
    ctx.textAlign = 'center'
    ctx.fillText(c, cx + cw / 2, chipsY + 27)
    cx += cw + 14
  })

  // best score comparison
  if (bestScore > 0) {
    ctx.fillStyle = GOLD
    ctx.font = '600 24px Sora, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`BEST ${bestScore}`, W - 64, chipsY + 27)
  }

  // --- simplified aircraft silhouette ---
  drawCessnaGlyph(ctx, W / 2, 940, 1)

  // --- footer ---
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 26px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('flightcourse.io/flare', W / 2, 1010)
  ctx.fillStyle = GOLD
  ctx.font = '700 28px Sora, sans-serif'
  ctx.fillText('Can you stick a greaser?', W / 2, 1052)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

function drawCessnaGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  ctx.fillStyle = 'rgba(207,224,242,0.85)'
  ctx.strokeStyle = NAVY
  ctx.lineWidth = 2
  // fuselage
  ctx.beginPath()
  ctx.moveTo(-90, 0)
  ctx.bezierCurveTo(-60, -16, 60, -16, 92, -6)
  ctx.bezierCurveTo(104, -4, 104, 6, 92, 8)
  ctx.bezierCurveTo(60, 16, -60, 16, -90, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // wing
  ctx.fillRect(-40, -34, 110, 12)
  ctx.strokeRect(-40, -34, 110, 12)
  // tail fin
  ctx.beginPath()
  ctx.moveTo(-90, 0)
  ctx.lineTo(-112, -30)
  ctx.lineTo(-86, -8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // horizontal stab
  ctx.fillRect(-122, -6, 40, 10)
  ctx.strokeRect(-122, -6, 40, 10)
  // gear
  ctx.beginPath()
  ctx.arc(-20, 18, 7, 0, Math.PI * 2)
  ctx.arc(60, 18, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = w
      yy += lh
    } else line = test
  }
  ctx.fillText(line, x, yy)
}

export interface ShareCardProps {
  attempt: Attempt
  bestScore: number
}

export function ShareCard({ attempt, bestScore }: ShareCardProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const registerShare = useProgressStore((s) => s.registerShare)
  const grantShareBonus = useProgressStore((s) => s.grantShareBonus)

  const buildBlob = React.useCallback(async () => {
    return generateShareCard(attempt, bestScore)
  }, [attempt, bestScore])

  const handleShare = async () => {
    setBusy(true)
    track.shareTapped(attempt.quality, attempt.score)
    try {
      const blob = await buildBlob()
      const file = new File([blob], 'flightcourse-flare.png', { type: 'image/png' })
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean
        share?: (d: ShareData) => Promise<void>
      }
      const shareData: ShareData = {
        title: 'FlightCourse — Landing Flare',
        text: `I scored ${attempt.score}/100 (${QUALITY_LABELS[attempt.quality]}) on FlightCourse's Landing Flare Trainer. Can you beat me?`,
        files: [file],
      }
      if (nav.canShare && nav.canShare(shareData) && nav.share) {
        await nav.share(shareData)
        onShareSuccess('web_share')
      } else if (nav.share) {
        await nav.share({ title: shareData.title, text: shareData.text })
        // still grant a preview download since file share unsupported
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        onShareSuccess('web_share')
      } else {
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        toast.info('Share sheet unsupported here — download or copy below.')
      }
    } catch (err) {
      // user cancelled share — don't grant bonus
      if ((err as Error)?.name !== 'AbortError') {
        toast.error('Could not build share card')
      }
    } finally {
      setBusy(false)
    }
  }

  const onShareSuccess = (method: 'web_share' | 'download' | 'copy') => {
    track.shareCompleted(method, attempt.quality, attempt.score)
    if (registerShare()) {
      const granted = grantShareBonus()
      if (granted) toast.success('Share counted — +1 bonus play added!')
    } else {
      toast.success('Shared! (Daily share bonus cap reached.)')
    }
  }

  const handleDownload = async () => {
    setBusy(true)
    track.shareTapped(attempt.quality, attempt.score)
    try {
      const blob = await buildBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flightcourse-flare-${attempt.score}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      onShareSuccess('download')
      toast.success('Share card downloaded')
    } catch {
      toast.error('Download failed')
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    setBusy(true)
    track.shareTapped(attempt.quality, attempt.score)
    try {
      const blob = await buildBlob()
      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onShareSuccess('copy')
      toast.success('Share card copied to clipboard')
    } catch {
      toast.error('Clipboard copy unsupported — try Download.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleShare} disabled={busy} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Share2 className="mr-2 h-4 w-4" /> Share result
        </Button>
        <Button onClick={handleDownload} disabled={busy} variant="outline" className="flex-1 border-accent/40 text-accent hover:bg-accent/10">
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
        <Button onClick={handleCopy} disabled={busy} variant="outline" className="flex-1 border-accent/40 text-accent hover:bg-accent/10">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {useProgressStore.getState().unlimitedUnlocked
          ? 'Sharing helps fellow pilots find FlightCourse.'
          : 'Sharing grants a bonus free play — every day, up to 5/day.'}
      </p>

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent className="max-w-md border-accent/30 bg-card">
          <DialogHeader>
            <DialogTitle className="font-semibold tracking-tight text-primary">Your share card</DialogTitle>
            <DialogDescription>
              Long-press to save on mobile, or use the buttons above to download/copy.
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="FlightCourse share card" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
