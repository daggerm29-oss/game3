# SKYWALK – progress log

Resume from here if a chat runs out of credits. Keep this file updated.

## Current change (v2): CART / COASTER MODE after level 5
After clearing level 5 the runner reaches a station at the end of the deck and hops into a mine cart.
From level 6 on, every level is a cart ride on a narrow, see-through grating coaster track high above the city:
- Track has lots of turns, climbs and plunges (rollercoaster, banked turns, first-person camera, fear of height:
  thin pylons all the way down to the city at y=-340, grating floor you can see through).
- Turns push the cart outward (centrifugal drift) -> player must slide left/right (swipe / A-D / arrows) to stay on.
  If the cart leaves the plank -> derail -> fall.
- Track FORKS (= the "gates" of a cart level). Before a fork the plank widens with a hazard bollard in the middle.
  Slide LEFT or RIGHT of the bollard. One branch is the real route, the other is a dead end (rails stop) -> fall.
  Centered at the fork = crash into the bollard.
- Orange handheld MINIMAP (bottom of screen, like the reference image) shows the TRUE route ahead (heading-up),
  dim stubs at forks for the fake branch. Player must rely on it.
- Fog banks (CSS mist overlay + dense scene fog) hide the track before some forks -> map only.
  Wind gusts push the cart sideways at higher levels; map static glitches at level >= 8.
- Levels keep getting harder: faster, more forks, sharper turns, shorter pre-fork straights, more fog.

## Architecture (cart mode)
- `lib/shared/game.ts`: `CART_START_LEVEL=6`, `CartPlan {seed, correct[], fog[], wind}`, `RoundDTO.cart`,
  `cartLayout()` (distances rounded to 0.5 m so forks land exactly on path samples), FailReasons
  `wrong_track` | `derailed`.
- Server `rounds.ts` generates cart rounds for level >= 6 (steps = one per fork, faces empty).
  `runs.ts` verifies lane (0 left / 1 right) against `cart.correct[step]`; lane -1 = derailed. Same timing check
  (cart speed never exceeds layout.speed; climbs only slow it down).
- Client `lib/game/render/coaster.ts`: deterministic path generator from seed (mulberry32), samples every 0.5 m,
  geometry (grating plank ribbon, hazard edge lips, under beams, instanced pylons, beacons, fork bollards,
  fake dead-end branches), `Coaster` class holding rounds, cart mesh + headlight, `sampleAt(S)`, minimap drawing.
- `lib/game/game.ts`: phases `BOARDING`, `CART`; cart fall reuses `FALL` with `this.cartFall`.
  `RUNNER_PHASES` (old runner list) vs `RUNNING_PHASES` (incl. cart) in store.ts.
- HUD: `components/game/minimap.tsx` (orange device, canvas drawn by game), mist overlay, lean warning.

## Status
- [x] Repo imported from github.com/daggerm29-oss/game2 (commit 1f9c5a6) into v0 project
- [x] shared/game.ts cart types + layout
- [x] server rounds.ts + runs.ts cart verification
- [x] render/coaster.ts (path gen + geometry + cart + minimap draw)
- [x] world.ts (coaster, mist, city follows x)
- [x] store.ts phases/fields
- [x] game.ts integration (boarding, cart update, forks, fall, camera)
- [x] hud minimap + mist overlay + result reasons
- [x] typecheck passes
- [x] headless sim: 649 generated rounds (levels 6-16) all beatable by a simulated driver; worst drift 3.2 m/s (< 6.5 key steer)
- [x] server API verified: correct lane -> next cart round delivered; wrong lane -> wrong_track; -1 -> derailed
- [ ] visual check in a real browser (sandbox browser has no WebGL2, so the 3D scene was not visually verified here)

## Possible next steps / tuning knobs
- Difficulty: `cartSpeed`, `cartForkCount`, `cartForkGapSeconds` in lib/shared/game.ts; `difficulty()` (max curvature,
  plunge chance) in lib/game/render/coaster.ts; drift factor `0.05` and gusts in Game.updateCart (lib/game/game.ts).
- Fog look: Hud mist overlay (components/game/hud.tsx) + World.update fog density.
- Ideas: tunnels, loops, a lift-chain sound, rail clack audio in AudioEngine, cart sway animation.

## Testing tip
Set `?cart=1` in the URL to start a run directly at level 6 (dev shortcut, server honors it only outside production).

---
## Previous change (v1, done): endless Temple-Run style runner
- Player auto-runs on endless steel deck; sign shows emoji sequence; gates with doorways; steer into matching face.
- Server signs round tokens, verifies each gate (lane + timing), delivers next round on gate 0.
- `lib/server/redis.ts` falls back to in-memory store without Upstash creds (dev only).
- Files: render/track.ts (endless track), render/runner.ts, input.ts steering, hud.tsx.
