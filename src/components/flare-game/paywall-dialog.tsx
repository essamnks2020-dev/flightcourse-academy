'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Rocket, Share2, Sparkles } from 'lucide-react'
import { UNLOCK_PRICE } from '@/lib/aviation'
import { useProgressStore } from '@/stores/progress-store'
import { track } from '@/lib/funnel'
import { toast } from 'sonner'

export interface PaywallDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  onShareToEarn: () => void
}

export function PaywallDialog({ open, onOpenChange, onShareToEarn }: PaywallDialogProps) {
  const purchaseUnlock = useProgressStore((s) => s.purchaseUnlock)
  const freePlays = useProgressStore((s) => s.freePlays)

  const handleUnlock = () => {
    // Simulated purchase — in production this would route through Stripe /
    // RevenueCat and call purchaseUnlock() on webhook confirmation.
    purchaseUnlock()
    toast.success('Unlimited unlocked — fly as much as you like!')
    onOpenChange(false)
  }

  const handleShare = () => {
    onOpenChange(false)
    onShareToEarn()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-primary/40 bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-semibold tracking-tight text-primary">
            <Rocket className="h-5 w-5" /> Out of free flights
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            You've used your free plays. Pick a path forward — both keep you flying.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          {/* Primary: unlock */}
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-semibold tracking-tight text-lg text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Unlock the full flight-school track
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unlimited flare practice, all 16 ground-school modules, three training sims, and progress toward your pilot rating.
                </p>
              </div>
              <div className="shrink-0 font-semibold tracking-tight text-2xl text-primary">
                ${UNLOCK_PRICE}
              </div>
            </div>
            <Button
              onClick={handleUnlock}
              className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Unlock unlimited
            </Button>
          </div>

          {/* Alternate: share to earn */}
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-semibold tracking-tight text-lg text-foreground">
                  <Share2 className="h-4 w-4 text-accent" /> Share to earn a play
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share any landing result and get a bonus free play. Up to 5/day — free, forever.
                </p>
              </div>
              <div className="shrink-0 font-semibold tracking-tight text-2xl text-accent">+1</div>
            </div>
            <Button
              onClick={handleShare}
              variant="outline"
              className="mt-3 w-full border-accent/50 text-accent hover:bg-accent/10"
            >
              Share a result
            </Button>
          </div>
        </div>

        <AlertDialogFooter className="!flex-col !items-stretch gap-2 sm:!flex-row sm:!justify-between">
          <AlertDialogCancel
            onClick={() => track.paywallDismissed()}
            className="mt-0 sm:mt-0"
          >
            Maybe later
          </AlertDialogCancel>
          <p className="text-right font-mono text-xs text-muted-foreground self-center">
            Free plays: {freePlays}
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
