import { authenticate, jsonError } from '@/lib/server/auth'
import { decodeChatPayload } from '@/lib/server/crypto'
import { rateLimit } from '@/lib/server/rate-limit'
import { startRun } from '@/lib/server/runs'
import type { RunStartResponse } from '@/lib/shared/game'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const player = authenticate(req)
    await rateLimit('run', player.id)
    // start_param comes from the HMAC-verified initData, so the group id cannot be spoofed by the client.
    const chatId = decodeChatPayload(player.startParam)
    // Dev-only shortcut for testing later levels (e.g. the cart ride); ignored in production.
    let startLevel = 1
    if (process.env.NODE_ENV !== 'production') {
      const body = (await req.json().catch(() => ({}))) as { startLevel?: unknown }
      if (Number.isInteger(body.startLevel) && (body.startLevel as number) >= 1 && (body.startLevel as number) <= 30) {
        startLevel = body.startLevel as number
      }
    }
    const { run, round } = await startRun(player, chatId, startLevel)
    const body: RunStartResponse = {
      runId: run.runId,
      guest: player.guest,
      groupLaunch: run.chatId !== null,
      player: { name: player.name },
      round,
    }
    return Response.json(body)
  } catch (error) {
    return jsonError(error)
  }
}
