import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { type DealCard, visibleDescription } from "@/lib/deals"
import { formatRand } from "@/lib/money"
import { cn } from "@/lib/utils"

export function DealRow({
  deal,
  cheapest = false,
}: {
  deal: DealCard
  cheapest?: boolean
}) {
  const description = visibleDescription(deal.title, deal.description)

  return (
    <article
      className={cn(
        "grid grid-cols-[5rem_1fr] gap-x-4 gap-y-3 rounded-xl border bg-card p-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:p-4",
        cheapest && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="size-20 overflow-hidden rounded-lg bg-muted">
        {deal.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the shop hosts the picture; we only store the URL
          <img
            src={deal.imageUrl}
            alt=""
            className="size-full object-contain"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <h3 className="text-base leading-snug font-medium">{deal.title}</h3>
        {description ? (
          <p className="mt-1 max-w-prose text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{deal.storeName}</Badge>
          <a
            href={deal.url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View at {deal.storeName}
          </a>
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:text-right">
        <p
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            cheapest && "text-destructive"
          )}
        >
          {formatRand(deal.priceCents)}
        </p>
        {deal.compareAtCents ? (
          <p className="mt-1 text-sm text-muted-foreground tabular-nums line-through">
            {formatRand(deal.compareAtCents)}
          </p>
        ) : null}
        {cheapest ? (
          <Badge variant="destructive" className="mt-2">
            Cheapest
          </Badge>
        ) : null}
      </div>
    </article>
  )
}
