'use client'

import * as React from 'react'
import { Altimeter, type AltimeterHandle } from './altimeter'
import { Airspeed, type AirspeedHandle } from './airspeed'
import { Vsi, type VsiHandle } from './vsi'
import { cn } from '@/lib/utils'

export interface InstrumentClusterHandle {
  setAltitude: (feet: number) => void
  setAirspeed: (kt: number) => void
  setVsi: (fpm: number) => void
  setAll: (p: { altitude?: number; airspeed?: number; vsi?: number }) => void
}

export interface InstrumentClusterProps {
  altitude?: number
  airspeed?: number
  vsi?: number
  className?: string
  /** compact renders smaller instruments for tight HUDs */
  compact?: boolean
}

/**
 * InstrumentCluster — the three-instrument panel reused by the live game
 * (imperative, 60fps), the replay (controlled values), and the dashboard
 * preview. One visual language, three contexts.
 */
export const InstrumentCluster = React.forwardRef<
  InstrumentClusterHandle,
  InstrumentClusterProps
>(function InstrumentCluster(
  { altitude, airspeed, vsi, className, compact },
  ref,
) {
  const altRef = React.useRef<AltimeterHandle>(null)
  const asRef = React.useRef<AirspeedHandle>(null)
  const vsiRef = React.useRef<VsiHandle>(null)

  React.useImperativeHandle(ref, () => ({
    setAltitude: (feet) => altRef.current?.setValue(feet),
    setAirspeed: (kt) => asRef.current?.setValue(kt),
    setVsi: (fpm) => vsiRef.current?.setValue(fpm),
    setAll: ({ altitude, airspeed, vsi }) => {
      if (altitude !== undefined) altRef.current?.setValue(altitude)
      if (airspeed !== undefined) asRef.current?.setValue(airspeed)
      if (vsi !== undefined) vsiRef.current?.setValue(vsi)
    },
  }), [])

  const size = compact ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-28 w-28 sm:h-32 sm:w-32'

  return (
    <div className={cn('flex items-end justify-center gap-2 sm:gap-3', className)}>
      <div className={size}>
        <Altimeter ref={altRef} value={altitude} />
      </div>
      <div className={size}>
        <Airspeed ref={asRef} value={airspeed} />
      </div>
      <div className={size}>
        <Vsi ref={vsiRef} value={vsi} />
      </div>
    </div>
  )
})
