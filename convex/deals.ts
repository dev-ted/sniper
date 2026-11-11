import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { categoryValidator } from "./schema"
import { findStore } from "./lib/catalog"
import {
  buildCompareKey,
  categorize,
  imageUrlAllowed,
  productUrlAllowed,
} from "./lib/dealFields"

const MAX_TITLE = 400
const MAX_DESCRIPTION = 400
const MAX_URL = 500
const MAX_PRICE_CENTS = 100_000_000_00

const collectorDeal = {
  storeSlug: v.string(),
  title: v.string(),
  description: v.string(),
  priceCents: v.number(),
  compareAtCents: v.optional(v.number()),
  url: v.string(),
  imageUrl: v.optional(v.string()),
}

const dealCard = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  priceCents: v.number(),
  compareAtCents: v.optional(v.number()),
  url: v.string(),
  imageUrl: v.optional(v.string()),
  category: categoryValidator,
  storeName: v.string(),
  storeSlug: v.string(),
})

export const upsertFromCollector = internalMutation({
  args: collectorDeal,
  returns: v.id("deals"),
  handler: async (ctx, args) => {
    const known = findStore(args.storeSlug)
    if (!known) {
      throw new Error("Unknown shop")
    }
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", known.slug))
      .unique()
    if (!store) {
      throw new Error("Shop is not saved yet")
    }

    const title = args.title.trim()
    const description = args.description.trim()
    if (!title || title.length > MAX_TITLE) {
      throw new Error("Item name is missing or too long")
    }
    if (!description || description.length > MAX_DESCRIPTION) {
      throw new Error("Description is missing or too long")
    }
    if (
      !Number.isInteger(args.priceCents) ||
      args.priceCents <= 0 ||
      args.priceCents > MAX_PRICE_CENTS
    ) {
      throw new Error("Price is not a valid rand amount")
    }
    if (
      args.compareAtCents !== undefined &&
      (!Number.isInteger(args.compareAtCents) ||
        args.compareAtCents <= args.priceCents)
    ) {
      throw new Error("Was price must be higher than the sale price")
    }
    if (args.url.length > MAX_URL || !productUrlAllowed(args.url, store)) {
      throw new Error("Product link is not on this shop's site")
    }
    const imageUrl = args.imageUrl?.trim() || undefined
    if (imageUrl && (imageUrl.length > MAX_URL || !imageUrlAllowed(imageUrl))) {
      throw new Error("Image link must be an https URL")
    }

    const existing = await ctx.db
      .query("deals")
      .withIndex("by_store_and_url", (q) =>
        q.eq("storeId", store._id).eq("url", args.url)
      )
      .unique()

    const keptImage = imageUrl ?? existing?.imageUrl
    const fields = {
      storeId: store._id,
      title,
      description,
      priceCents: args.priceCents,
      url: args.url,
      category: categorize(title),
      compareKey: buildCompareKey(title),
      lastSeenAt: Date.now(),
      active: true,
      ...(args.compareAtCents !== undefined
        ? { compareAtCents: args.compareAtCents }
        : {}),
      ...(keptImage ? { imageUrl: keptImage } : {}),
    }

    if (existing) {
      await ctx.db.patch(existing._id, fields)
      return existing._id
    }
    return await ctx.db.insert("deals", fields)
  },
})

export const list = query({
  args: {
    category: v.optional(categoryValidator),
    storeSlug: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const empty = {
      page: [],
      isDone: true,
      continueCursor: args.paginationOpts.cursor ?? "",
    }

    let storeId = undefined
    if (args.storeSlug) {
      const known = findStore(args.storeSlug)
      if (!known) {
        return empty
      }
      const store = await ctx.db
        .query("stores")
        .withIndex("by_slug", (q) => q.eq("slug", known.slug))
        .unique()
      if (!store) {
        return empty
      }
      storeId = store._id
    }

    const deals = ctx.db.query("deals")
    const page = await (
      args.category && storeId
        ? deals.withIndex("by_category_and_store", (q) =>
            q
              .eq("category", args.category!)
              .eq("storeId", storeId)
              .eq("active", true)
          )
        : args.category
          ? deals.withIndex("by_category", (q) =>
              q.eq("category", args.category!).eq("active", true)
            )
          : storeId
            ? deals.withIndex("by_store", (q) =>
                q.eq("storeId", storeId).eq("active", true)
              )
            : deals.withIndex("by_active", (q) => q.eq("active", true))
    )
      .order("desc")
      .paginate(args.paginationOpts)

    const cards = []
    for (const deal of page.page) {
      const store = await ctx.db.get(deal.storeId)
      cards.push({
        id: deal._id,
        title: deal.title,
        description: deal.description,
        priceCents: deal.priceCents,
        compareAtCents: deal.compareAtCents,
        url: deal.url,
        imageUrl: deal.imageUrl,
        category: deal.category,
        storeName: store?.name ?? "Shop",
        storeSlug: store?.slug ?? "",
      })
    }

    return { ...page, page: cards }
  },
})

export const compare = query({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      compareKey: v.string(),
      title: v.string(),
      cheapestId: v.optional(v.string()),
      deals: v.array(dealCard),
    })
  ),
  handler: async (ctx, args) => {
    const term = args.query.trim()
    if (term.length < 2) {
      return []
    }

    const hits = await ctx.db
      .query("deals")
      .withSearchIndex("search_title", (q) =>
        q.search("title", term).eq("active", true)
      )
      .take(24)

    const keys: string[] = []
    for (const hit of hits) {
      if (!keys.includes(hit.compareKey)) {
        keys.push(hit.compareKey)
      }
      if (keys.length === 8) {
        break
      }
    }

    const groups = []
    for (const key of keys) {
      const rows = await ctx.db
        .query("deals")
        .withIndex("by_compareKey", (q) =>
          q.eq("compareKey", key).eq("active", true)
        )
        .take(8)

      const deals = []
      for (const deal of rows) {
        const store = await ctx.db.get(deal.storeId)
        deals.push({
          id: deal._id,
          title: deal.title,
          description: deal.description,
          priceCents: deal.priceCents,
          compareAtCents: deal.compareAtCents,
          url: deal.url,
          imageUrl: deal.imageUrl,
          category: deal.category,
          storeName: store?.name ?? "Shop",
          storeSlug: store?.slug ?? "",
        })
      }
      deals.sort((a, b) => a.priceCents - b.priceCents)
      groups.push({
        compareKey: key,
        title: deals[0]?.title ?? key,
        cheapestId: deals.length > 1 ? deals[0]?.id : undefined,
        deals,
      })
    }

    groups.sort(
      (a, b) => (a.deals[0]?.priceCents ?? 0) - (b.deals[0]?.priceCents ?? 0)
    )
    return groups
  },
})
