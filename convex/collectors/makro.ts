import { v } from "convex/values"
import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { MAKRO_PAGE, parseMakroBlackFriday } from "./makroParse"

export const collect = internalAction({
  args: {},
  returns: v.object({
    found: v.number(),
    saved: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    await ctx.runMutation(internal.stores.ensureKnown, {})

    const response = await fetch(MAKRO_PAGE, {
      headers: {
        accept: "text/html",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    })
    if (!response.ok) {
      throw new Error(`Makro specials page returned ${response.status}`)
    }

    const deals = parseMakroBlackFriday(await response.text())
    let saved = 0
    let skipped = 0
    for (const deal of deals) {
      try {
        await ctx.runMutation(internal.deals.upsertFromCollector, deal)
        saved += 1
      } catch (error) {
        skipped += 1
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error(`Skipped a Makro deal: ${message}`)
      }
    }

    return { found: deals.length, saved, skipped }
  },
})
