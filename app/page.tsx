import { DealBoard } from "@/components/deal-board"
import { DealError } from "@/components/deal-error"

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Specials</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Black Friday prices from South African shops. Each row shows the item,
          the price, and a link to the shop selling it.
        </p>
      </div>
      <DealError>
        <DealBoard />
      </DealError>
    </main>
  )
}
