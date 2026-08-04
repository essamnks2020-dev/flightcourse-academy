'use client'

import * as React from 'react'
import { useMounted } from '@/hooks/use-mounted'

/**
 * ClientOnly — defers rendering of children until after client mount.
 * Prevents SSR hydration mismatches for components that use browser-only
 * APIs (crypto.randomUUID, Math.random, localStorage, AudioContext) during
 * their initial render.
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const mounted = useMounted()
  return mounted ? <>{children}</> : <>{fallback}</>
}
