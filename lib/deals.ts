import type { Category } from "@/convex/lib/dealFields"

export type DealCard = {
  id: string
  title: string
  description: string
  priceCents: number
  compareAtCents?: number
  url: string
  imageUrl?: string
  category: Category
  storeName: string
  storeSlug: string
}

export function visibleDescription(
  title: string,
  description: string
): string | null {
  const detail = description.trim()
  if (!detail || detail === title.trim()) {
    return null
  }
  return detail
}
