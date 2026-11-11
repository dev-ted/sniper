export const CATEGORIES = [
  "tech",
  "appliances",
  "shoes",
  "clothes",
  "baby",
  "groceries",
  "other",
] as const

export type Category = (typeof CATEGORIES)[number]

const CATEGORY_RULES: { category: Category; pattern: RegExp }[] = [
  {
    category: "baby",
    pattern: /\b(pampers|huggies|nappies|nappy|diapers|diaper|infant|baby)\b/i,
  },
  {
    category: "shoes",
    pattern:
      /\b(sneakers|sneaker|shoes|shoe|boots|boot|slippers|slipper|takkies)\b/i,
  },
  {
    category: "clothes",
    pattern:
      /\b(shirts|shirt|dresses|dress|jeans|jackets|jacket|hoodies|hoodie|socks|sock|trousers|pants)\b/i,
  },
  {
    category: "appliances",
    pattern:
      /\b(fridge|freezer|washing machine|washer|microwave|dishwasher|air fryer|oven|kettle|toaster|tumble dryer|air conditioner|aircon)\b/i,
  },
  {
    category: "tech",
    pattern:
      /\b(television|laptop|iphone|smartphone|phone|headphones|headphone|monitor|tablet|console|macbook|ssd|router|tvs|tv)\b/i,
  },
  {
    category: "groceries",
    pattern:
      /\b(milk|maize|sugar|oil|washing powder|rice|cereal|noodles|mayonnaise|detergent|wine|nachos)\b/i,
  },
]

export function categorize(title: string): Category {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(title)) {
      return rule.category
    }
  }
  return "other"
}

export function categoryLabel(category: Category): string {
  switch (category) {
    case "tech":
      return "Tech"
    case "appliances":
      return "Appliances"
    case "shoes":
      return "Shoes"
    case "clothes":
      return "Clothes"
    case "baby":
      return "Baby"
    case "groceries":
      return "Groceries"
    case "other":
      return "Other"
    default: {
      const exhaustive: never = category
      return exhaustive
    }
  }
}

export function buildCompareKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, digits: string) =>
      String.fromCodePoint(Number(digits))
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

export function cleanText(value: string): string {
  return decodeHtml(value).replace(/\s+/g, " ").trim()
}

export function productUrlAllowed(
  url: string,
  store: { host: string; pathPrefix?: string }
): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (parsed.protocol !== "https:") {
    return false
  }
  const hostname = parsed.hostname.toLowerCase()
  const host = store.host.toLowerCase()
  const hostMatches = hostname === host || hostname.endsWith(`.${host}`)
  if (!hostMatches) {
    return false
  }
  if (store.pathPrefix && !parsed.pathname.startsWith(store.pathPrefix)) {
    return false
  }
  return true
}

export function imageUrlAllowed(url: string | undefined): boolean {
  if (url === undefined) {
    return true
  }
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  return parsed.protocol === "https:" && parsed.hostname.length > 0
}
