export const KNOWN_STORES = [
  { slug: "makro", name: "Makro", host: "makro.co.za" },
  { slug: "game", name: "Game", host: "game.co.za" },
  { slug: "spar", name: "SPAR", host: "spar.co.za" },
  { slug: "checkers", name: "Checkers", host: "checkers.co.za" },
  { slug: "puma", name: "PUMA", host: "za.puma.com" },
  { slug: "nike", name: "Nike", host: "nike.com", pathPrefix: "/za" },
  {
    slug: "incredible",
    name: "Incredible Connection",
    host: "incredible.co.za",
  },
  { slug: "hifi-corp", name: "HiFi Corp", host: "hificorp.co.za" },
] as const

export type StoreSlug = (typeof KNOWN_STORES)[number]["slug"]

export function findStore(slug: string) {
  return KNOWN_STORES.find((store) => store.slug === slug)
}
