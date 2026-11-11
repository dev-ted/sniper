import { CompareBoard } from "@/components/compare-board"
import { DealError } from "@/components/deal-error"

export default function ComparePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          See the same item at more than one shop. The lowest price is marked.
        </p>
      </div>
      <DealError>
        <CompareBoard />
      </DealError>
    </main>
  )
}
