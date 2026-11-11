import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { KNOWN_STORES } from "./lib/catalog"

export const ensureKnown = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const store of KNOWN_STORES) {
      const pathPrefix = "pathPrefix" in store ? store.pathPrefix : undefined
      const fields = {
        name: store.name,
        host: store.host,
        ...(pathPrefix ? { pathPrefix } : {}),
      }
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_slug", (q) => q.eq("slug", store.slug))
        .unique()
      if (existing) {
        await ctx.db.patch(existing._id, fields)
      } else {
        await ctx.db.insert("stores", {
          slug: store.slug,
          ...fields,
        })
      }
    }
    return null
  },
})

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      name: v.string(),
    })
  ),
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").withIndex("by_slug").take(20)
    return stores
      .map((store) => ({ slug: store.slug, name: store.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  },
})
