'use client'

import { useEffect, useRef } from 'react'
import type { Game } from '@/lib/game/game'

/** Orange handheld map device the rider holds; the game draws the route onto its screen. */
export function Minimap({ game, mist }: { game: Game; mist: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    game.attachMinimap(canvasRef.current)
    return () => game.attachMinimap(null)
  }, [game])

  return (
    <figure
      aria-label="Route map"
      className="relative flex w-[min(46vw,13rem)] flex-col gap-1.5 rounded-[1.1rem] border-2 border-black/60 bg-[#e8651e] p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-3px_0_rgba(0,0,0,0.25)]"
      style={{ transform: 'perspective(600px) rotateX(14deg)' }}
    >
      <span aria-hidden className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-black/40" />
      <span aria-hidden className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-black/40" />
      <span aria-hidden className="absolute bottom-1.5 left-1.5 size-1.5 rounded-full bg-black/40" />
      <span aria-hidden className="absolute bottom-1.5 right-1.5 size-1.5 rounded-full bg-black/40" />
      <figcaption className="flex items-center justify-between px-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/75">
        <span>Map</span>
        <span className={mist > 0.3 ? 'animate-pulse text-black' : ''}>{mist > 0.3 ? 'Fog' : 'Live'}</span>
      </figcaption>
      <div className="overflow-hidden rounded-md border-2 border-black/70 bg-[#0d1410] shadow-[inset_0_0_18px_rgba(0,0,0,0.9)]">
        <canvas ref={canvasRef} className="block aspect-[4/5] w-full" />
      </div>
      <div aria-hidden className="flex items-center justify-center gap-2 pt-0.5">
        <span className="h-1.5 w-6 rounded-full bg-black/45" />
        <span className="size-2.5 rounded-full bg-black/55" />
        <span className="h-1.5 w-6 rounded-full bg-black/45" />
      </div>
    </figure>
  )
}
