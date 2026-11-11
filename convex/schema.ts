import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const categoryValidator = v.union(
  v.literal("tech"),
  v.literal("appliances"),
  v.literal("shoes"),
  v.literal("clothes"),
  v.literal("baby"),
  v.literal("groceries"),
  v.literal("other")
)

export default defineSchema({
  stores: defineTable({
    slug: v.string(),
    name: v.string(),
    host: v.string(),
    pathPrefix: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  deals: defineTable({
    storeId: v.id("stores"),
    title: v.string(),
    description: v.string(),
    priceCents: v.number(),
    compareAtCents: v.optional(v.number()),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    category: categoryValidator,
    compareKey: v.string(),
    lastSeenAt: v.number(),
    active: v.boolean(),
  })
    .index("by_active", ["active", "lastSeenAt"])
    .index("by_category", ["category", "active", "lastSeenAt"])
    .index("by_store", ["storeId", "active", "lastSeenAt"])
    .index("by_category_and_store", [
      "category",
      "storeId",
      "active",
      "lastSeenAt",
    ])
    .index("by_compareKey", ["compareKey", "active"])
    .index("by_store_and_url", ["storeId", "url"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["active"],
    }),
})
