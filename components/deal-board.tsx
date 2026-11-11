"use client"

import { useState } from "react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DealRow } from "@/components/deal-row"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { KNOWN_STORES } from "@/convex/lib/catalog"
import {
  CATEGORIES,
  categoryLabel,
  type Category,
} from "@/convex/lib/dealFields"

const ALL = "all"

export function DealBoard() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <p className="text-sm text-muted-foreground">
        Deal data is not connected yet.
      </p>
    )
  }
  return <DealBoardLive />
}

function DealBoardLive() {
  const [category, setCategory] = useState<typeof ALL | Category>(ALL)
  const [storeSlug, setStoreSlug] = useState<string>(ALL)
  const stores = useQuery(api.stores.list)
  const shops =
    stores && stores.length > 0
      ? stores
      : KNOWN_STORES.map((store) => ({
          slug: store.slug,
          name: store.name,
        }))

  const { results, status, loadMore } = usePaginatedQuery(
    api.deals.list,
    {
      category: category === ALL ? undefined : category,
      storeSlug: storeSlug === ALL ? undefined : storeSlug,
    },
    { initialNumItems: 20 }
  )

  const shopName = shops.find((shop) => shop.slug === storeSlug)?.name

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={category}
          onValueChange={(value) => {
            if (value === ALL || CATEGORIES.includes(value as Category)) {
              setCategory(value as typeof ALL | Category)
            }
          }}
        >
          <SelectTrigger aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {categoryLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={storeSlug}
          onValueChange={(value) => {
            if (value) {
              setStoreSlug(value)
            }
          }}
        >
          <SelectTrigger aria-label="Shop">
            <SelectValue placeholder="Shop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All shops</SelectItem>
            {shops.map((shop) => (
              <SelectItem key={shop.slug} value={shop.slug}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {storeSlug === ALL
            ? "No deals in this category yet."
            : `No ${shopName ?? "shop"} deals in this category yet.`}
        </p>
      ) : (
        <div>
          {results.map((deal) => (
            <DealRow key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {status === "CanLoadMore" ? (
        <Button variant="outline" onClick={() => loadMore(20)}>
          Show more deals
        </Button>
      ) : null}
    </div>
  )
}
