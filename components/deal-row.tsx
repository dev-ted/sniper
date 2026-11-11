import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    <article>
      <div className="flex gap-4 py-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {deal.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- the shop hosts the picture; we only store the URL
            <img
              src={deal.imageUrl}
              alt=""
              className="size-full object-contain"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h3 className="text-sm leading-snug font-medium">{deal.title}</h3>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums",
                cheapest && "text-destructive"
              )}
            >
              {formatRand(deal.priceCents)}
            </p>
          </div>
          {description ? (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{deal.storeName}</Badge>
            {cheapest ? <Badge variant="destructive">Cheapest</Badge> : null}
            {deal.compareAtCents ? (
              <span className="text-sm text-muted-foreground tabular-nums line-through">
                {formatRand(deal.compareAtCents)}
              </span>
            ) : null}
            <a
              href={deal.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "h-auto px-0"
              )}
            >
              View at {deal.storeName}
            </a>
          </div>
        </div>
      </div>
      <Separator />
    </article>
  )
}
