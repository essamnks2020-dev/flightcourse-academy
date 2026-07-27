/**
 * FlightCourse — funnel / analytics hooks
 * --------------------------------------------------------------
 * Lightweight, structured event emission. Today these log to the console
 * in a stable shape so they can be grep'd / forwarded; the moment a real
 * analytics provider is wired up (PostHog, Segment, GA4…) you only swap the
 * sink inside `emit()`. No call sites need to change.
 */

export type FunnelEvent =
  | { event: 'game_start'; free_plays_remaining: number; unlimited: boolean; crosswind: boolean }
  | { event: 'game_complete'; quality: string; score: number; bounces: number; stalled: boolean; crosswind: boolean; duration_ms: number }
  | { event: 'paywall_hit'; free_plays_remaining: number }
  | { event: 'paywall_dismissed' }
  | { event: 'share_tapped'; quality: string; score: number }
  | { event: 'share_completed'; method: 'web_share' | 'download' | 'copy'; quality: string; score: number }
  | { event: 'bonus_play_granted'; reason: 'share' | 'first_landing'; free_plays_remaining: number }
  | { event: 'unlock_purchased'; price: number }
  | { event: 'badge_earned'; badge: string }
  | { event: 'replay_scrubbed'; quality: string }
  | { event: 'leaderboard_submit'; score: number; quality: string }

let sessionId: string | null = null

export function setFunnelSession(id: string) {
  sessionId = id
}

function emit(payload: FunnelEvent) {
  const envelope = {
    ts: Date.now(),
    session_id: sessionId,
    channel: 'flare-trainer',
    ...payload,
  }
  // Structured + greppable. Swap this for a real provider later.
  // eslint-disable-next-line no-console
  console.log('[Funnel]', envelope)
}

export const track = {
  gameStart: (free_plays_remaining: number, unlimited: boolean, crosswind: boolean) =>
    emit({ event: 'game_start', free_plays_remaining, unlimited, crosswind }),
  gameComplete: (
    quality: string,
    score: number,
    bounces: number,
    stalled: boolean,
    crosswind: boolean,
    duration_ms: number,
  ) =>
    emit({ event: 'game_complete', quality, score, bounces, stalled, crosswind, duration_ms }),
  paywallHit: (free_plays_remaining: number) =>
    emit({ event: 'paywall_hit', free_plays_remaining }),
  paywallDismissed: () => emit({ event: 'paywall_dismissed' }),
  shareTapped: (quality: string, score: number) =>
    emit({ event: 'share_tapped', quality, score }),
  shareCompleted: (method: 'web_share' | 'download' | 'copy', quality: string, score: number) =>
    emit({ event: 'share_completed', method, quality, score }),
  bonusPlayGranted: (reason: 'share' | 'first_landing', free_plays_remaining: number) =>
    emit({ event: 'bonus_play_granted', reason, free_plays_remaining }),
  unlockPurchased: (price: number) => emit({ event: 'unlock_purchased', price }),
  badgeEarned: (badge: string) => emit({ event: 'badge_earned', badge }),
  replayScrubbed: (quality: string) => emit({ event: 'replay_scrubbed', quality }),
  leaderboardSubmit: (score: number, quality: string) =>
    emit({ event: 'leaderboard_submit', score, quality }),
}

export function trackFunnel(event: string, data?: Record<string, unknown>) {
  track.event(event, data)
}
