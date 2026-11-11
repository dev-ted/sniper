"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DealRow } from "@/components/deal-row"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export function CompareBoard() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <p className="text-sm text-muted-foreground">
        Deal data is not connected yet.
      </p>
    )
  }
  return <CompareBoardLive />
}

function CompareBoardLive() {
  const [text, setText] = useState("")
  const [term, setTerm] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(text.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [text])

  const groups = useQuery(
    api.deals.compare,
    term.length >= 2 ? { query: term } : "skip"
  )

  return (
    <div className="flex flex-col gap-6">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Try a TV, sneakers, or Pampers"
        aria-label="Item"
      />

      {term.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Type an item to see its price at each shop.
        </p>
      ) : groups === undefined ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing matched that. Try the product name, like Hisense or Pampers.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.compareKey} className="flex flex-col gap-2">
              <h2 className="text-base font-medium">{group.title}</h2>
              <div>
                {group.deals.map((deal) => (
                  <DealRow
                    key={deal.id}
                    deal={deal}
                    cheapest={deal.id === group.cheapestId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
