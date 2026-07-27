'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Award, Lock, Trophy, Plane, Download, RotateCcw } from 'lucide-react'
import { useProgressStore, BADGE_DEFS } from '@/stores/progress-store'
import { QUALITY_COLORS, QUALITY_LABELS } from '@/lib/aviation'
import type { LandingQuality } from '@/lib/aviation'
import { toast } from 'sonner'

/** Animated SVG gauge ring. */
function GaugeRing({
  value,
  max,
  label,
  sublabel,
  color,
}: {
  value: number
  max: number
  label: string
  sublabel: string
  color: string
}) {
  const r = 52
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  const [shown, setShown] = React.useState(0)
  React.useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = shown
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(from + (pct - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct])
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-sora text-2xl font-bold" style={{ color }}>
          {label}
        </span>
        <span className="font-jetbrains text-[10px] uppercase tracking-wider text-muted-foreground">
          {sublabel}
        </span>
      </div>
    </div>
  )
}

export interface ProgressDashboardProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function ProgressDashboard({ variant = 'full', className }: ProgressDashboardProps) {
  const bestScore = useProgressStore((s) => s.bestScore)
  const bestQuality = useProgressStore((s) => s.bestQuality)
  const totalLandings = useProgressStore((s) => s.totalLandings)
  const totalFlights = useProgressStore((s) => s.totalFlights)
  const greaserCount = useProgressStore((s) => s.greaserCount)
  const badges = useProgressStore((s) => s.badges)
  const attempts = useProgressStore((s) => s.attempts)
  const reset = useProgressStore((s) => s.reset)

  // §3.1 — Leaderboard fetch (graceful degradation; never blocks the game)
  const [leaderboard, setLeaderboard] = React.useState<{ playerName: string | null; bestScore: number; bestQuality: string | null }[]>([])
  React.useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.leaderboard && Array.isArray(d.leaderboard)) {
          setLeaderboard(d.leaderboard.slice(0, 5))
        }
      })
      .catch(() => { /* silent — offline-first */ })
  }, [bestScore]) // refetch when a new score is posted

  // §2.3/§3.5 — Score trend sparkline (last 10 attempts)
  const trend = React.useMemo(() => {
    return attempts.slice(0, 10).reverse().map((a) => a.score)
  }, [attempts])
  const unlimited = useProgressStore((s) => s.unlimitedUnlocked)

  const earnedIds = new Set(badges.map((b) => b.id))
  const allBadgeIds = Object.keys(BADGE_DEFS)
  const recent = attempts.slice(0, 6)

  const handleCert = async () => {
    if (totalLandings === 0) {
      toast.info('Complete a landing to earn your logbook certificate.')
      return
    }
    const blob = await generateCertificate(bestScore, totalLandings, greaserCount, bestQuality, badges)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flightcourse-logbook.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
    toast.success('Logbook certificate downloaded')
  }

  const handleReset = () => {
    if (confirm('Reset all progress, badges, and free plays? This cannot be undone.')) {
      reset()
      toast.success('Progress reset')
    }
  }

  return (
    <div className={className}>
      <Card className="border-white/10 bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 font-sora text-base">
            <Trophy className="h-4 w-4 text-horizon-gold" /> Progress Dashboard
          </CardTitle>
          {variant === 'full' && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* gauges */}
          <div className="flex flex-wrap items-center justify-around gap-3">
            <GaugeRing
              value={bestScore}
              max={100}
              label={String(bestScore)}
              sublabel="Best score"
              color="#F2B134"
            />
            <GaugeRing
              value={totalLandings}
              max={25}
              label={String(totalLandings)}
              sublabel="Landings"
              color="#3E92CC"
            />
            <GaugeRing
              value={greaserCount}
              max={5}
              label={String(greaserCount)}
              sublabel="Greasers"
              color="#5fcf6a"
            />
          </div>

          {/* stats row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-black/20 p-2">
              <div className="font-jetbrains text-lg text-foreground">{totalFlights}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Flights</div>
            </div>
            <div className="rounded-md bg-black/20 p-2">
              <div className="font-jetbrains text-lg text-foreground">
                {totalLandings > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg score</div>
            </div>
            <div className="rounded-md bg-black/20 p-2">
              <div className="font-jetbrains text-lg text-foreground">
                {bestQuality ? QUALITY_LABELS[bestQuality].replace('!', '') : '—'}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Best type</div>
            </div>
          </div>

          {/* unlimited status */}
          {unlimited && (
            <div className="flex items-center gap-2 rounded-md border border-horizon-gold/40 bg-horizon-gold/10 px-3 py-2 text-sm text-horizon-gold">
              <Award className="h-4 w-4" /> Unlimited practice unlocked
            </div>
          )}

          {/* badges */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-sora text-sm text-muted-foreground">
                Achievements ({badges.length}/{allBadgeIds.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              {allBadgeIds.map((id) => {
                const def = BADGE_DEFS[id]
                const earned = earnedIds.has(id)
                return (
                  <div
                    key={id}
                    title={`${def.label} — ${def.description}`}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition ${
                      earned
                        ? 'border-horizon-gold/40 bg-horizon-gold/10'
                        : 'border-white/5 bg-black/20 opacity-50'
                    }`}
                  >
                    {earned ? (
                      <Award className="h-4 w-4 text-horizon-gold" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-[10px] font-medium leading-tight text-foreground">
                      {def.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* recent landings */}
          {variant === 'full' && recent.length > 0 && (
            <div>
              <span className="mb-2 block font-sora text-sm text-muted-foreground">Recent landings</span>
              <div className="max-h-40 space-y-1 overflow-y-auto fc-scroll">
                {recent.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md bg-black/20 px-2 py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Plane className="h-3 w-3 text-sky" />
                      <span className="font-jetbrains text-xs" style={{ color: QUALITY_COLORS[a.quality] }}>
                        {QUALITY_LABELS[a.quality]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-jetbrains text-xs text-muted-foreground">
                      <span>{Math.round(a.touchdownVSI)} fpm</span>
                      <span className="font-bold text-foreground">{a.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* §2.3/§3.5 — Score trend sparkline */}
          {variant === 'full' && trend.length >= 2 && (
            <div>
              <span className="mb-2 block font-sora text-sm text-muted-foreground">Score trend</span>
              <div className="flex items-end gap-1 h-12">
                {trend.map((score, i) => {
                  const h = Math.max(4, (score / 100) * 48)
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}px`,
                        background: score >= 90 ? '#F2B134' : score >= 70 ? '#3E92CC' : '#5f7a99',
                        opacity: 0.5 + (i / trend.length) * 0.5,
                      }}
                      title={`Attempt ${i + 1}: ${score}`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* §3.1 — Leaderboard panel (only renders if data is available) */}
          {variant === 'full' && leaderboard.length > 0 && (
            <div>
              <span className="mb-2 block font-sora text-sm text-muted-foreground">Top landings</span>
              <div className="space-y-1">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md bg-black/20 px-2 py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-jetbrains text-xs text-muted-foreground">#{i + 1}</span>
                      <span className="font-jetbrains text-xs text-foreground">
                        {entry.playerName || 'Anonymous'}
                      </span>
                    </div>
                    <span className="font-jetbrains text-xs font-bold text-horizon-gold">
                      {entry.bestScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleCert} variant="outline" className="w-full border-sky/40 text-sky hover:bg-sky/10">
            <Download className="mr-2 h-4 w-4" /> Logbook certificate
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Certificate generator ---------------------------------------------------
async function generateCertificate(
  bestScore: number,
  totalLandings: number,
  greaserCount: number,
  bestQuality: LandingQuality | null,
  badges: { id: string; label: string }[],
): Promise<Blob> {
  const W = 1200
  const H = 850
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  try {
    await document.fonts.load('700 56px Sora')
    await document.fonts.load('500 24px "JetBrains Mono"')
    await document.fonts.ready
  } catch {
    /* noop */
  }

  // bg
  ctx.fillStyle = '#0B1D3A'
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W)
  g.addColorStop(0, 'rgba(62,146,204,0.10)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // border
  ctx.strokeStyle = '#F2B134'
  ctx.lineWidth = 4
  ctx.strokeRect(40, 40, W - 80, H - 80)
  ctx.strokeStyle = 'rgba(62,146,204,0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(56, 56, W - 112, H - 112)

  // header
  ctx.textAlign = 'center'
  ctx.fillStyle = '#cfe0f2'
  ctx.font = '700 28px Sora, sans-serif'
  ctx.fillText('FLIGHT', W / 2 - 70, 130)
  ctx.fillStyle = '#F2B134'
  ctx.fillText('COURSE', W / 2 + 40, 130)
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 18px "JetBrains Mono", monospace'
  ctx.fillText('PILOT LOGBOOK · LANDING FLARE TRAINER', W / 2, 165)

  // title
  ctx.fillStyle = '#E6EEF7'
  ctx.font = '700 52px Sora, sans-serif'
  ctx.fillText('Certificate of Achievement', W / 2, 250)

  ctx.fillStyle = '#9fb1c8'
  ctx.font = '400 24px Sora, sans-serif'
  ctx.fillText('This certifies that the holder has demonstrated', W / 2, 310)
  ctx.fillText('proficiency in the Cessna 172 landing flare:', W / 2, 344)

  // best score
  ctx.fillStyle = '#F2B134'
  ctx.font = '800 120px Sora, sans-serif'
  ctx.fillText(String(bestScore), W / 2 - 80, 470)
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 36px Sora, sans-serif'
  ctx.fillText('/ 100', W / 2 + 120, 470)
  ctx.fillStyle = '#cfe0f2'
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText('BEST SCORE', W / 2, 500)

  // stats
  const stats = [
    { label: 'TOTAL LANDINGS', value: String(totalLandings) },
    { label: 'GREASERS', value: String(greaserCount) },
    { label: 'BEST QUALITY', value: bestQuality ? QUALITY_LABELS[bestQuality].replace('!', '') : '—' },
    { label: 'ACHIEVEMENTS', value: String(badges.length) },
  ]
  const sw = (W - 200) / stats.length
  stats.forEach((s, i) => {
    const sx = 100 + i * sw
    ctx.fillStyle = '#5f7a99'
    ctx.font = '500 18px "JetBrains Mono", monospace'
    ctx.fillText(s.label, sx + sw / 2, 580)
    ctx.fillStyle = '#3E92CC'
    ctx.font = '700 40px "JetBrains Mono", monospace'
    ctx.fillText(s.value, sx + sw / 2, 625)
  })

  // badges row
  ctx.fillStyle = '#9fb1c8'
  ctx.font = '400 22px Sora, sans-serif'
  const badgeText = badges.slice(0, 5).map((b) => b.label).join('  ·  ')
  if (badgeText) {
    ctx.fillText('Earned: ' + badgeText, W / 2, 700)
  }

  // footer
  ctx.fillStyle = '#5f7a99'
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText('flightcourse.io/flare', W / 2, 770)
  ctx.fillStyle = '#F2B134'
  ctx.font = '600 18px Sora, sans-serif'
  ctx.fillText(new Date().toLocaleDateString(), W / 2, 800)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png'),
  )
}
