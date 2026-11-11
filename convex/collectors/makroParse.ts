import { cleanText } from "../lib/dealFields"

export const MAKRO_ORIGIN = "https://www.makro.co.za"
export const MAKRO_PAGE = "https://www.makro.co.za/black-friday"
export const MAKRO_DEAL_CAP = 80

export type ParsedMakroDeal = {
  storeSlug: "makro"
  title: string
  description: string
  priceCents: number
  compareAtCents?: number
  url: string
  imageUrl?: string
}

type AnchorHit = {
  index: number
  pathname: string
  attrs: string
  inner: string
}

function toCents(rands: string, cents: string | undefined): number | undefined {
  const whole = Number(rands.replace(/[^\d]/g, ""))
  const fraction = cents ? Number(cents) : 0
  if (
    !Number.isInteger(whole) ||
    !Number.isInteger(fraction) ||
    fraction > 99
  ) {
    return undefined
  }
  return whole * 100 + fraction
}

function pricesIn(html: string): number[] {
  const prices: number[] = []
  const pattern =
    /R\s*([\d][\d\s,]*)<\/span>\s*<span[^>]*>\s*(\d{2})\s*<\/span>/g
  for (const match of html.matchAll(pattern)) {
    const cents = toCents(match[1], match[2])
    if (cents && cents > 0) {
      prices.push(cents)
    }
  }
  return prices
}

function imageIn(html: string): string | undefined {
  const match = /<img\b[^>]*\bsrc="([^"]+)"/i.exec(html)
  if (!match) {
    return undefined
  }
  const src = cleanText(match[1])
  if (src.startsWith("//")) {
    return `https:${src}`
  }
  if (src.startsWith("https://")) {
    return src
  }
  return undefined
}

function productAnchors(html: string): AnchorHit[] {
  const hits: AnchorHit[] = []
  const pattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  for (const match of html.matchAll(pattern)) {
    const attrs = match[1] ?? ""
    const hrefMatch = /href="([^"]+)"/i.exec(attrs)
    if (!hrefMatch) {
      continue
    }
    const href = cleanText(hrefMatch[1])
    let url: URL
    try {
      url = new URL(href, MAKRO_ORIGIN)
    } catch {
      continue
    }
    if (
      !url.hostname.toLowerCase().endsWith("makro.co.za") ||
      !url.pathname.includes("/p/itm")
    ) {
      continue
    }
    hits.push({
      index: match.index ?? 0,
      pathname: url.pathname,
      attrs,
      inner: match[2] ?? "",
    })
  }
  return hits
}

export function parseMakroBlackFriday(html: string): ParsedMakroDeal[] {
  const hits = productAnchors(html)
  const seen = new Set<string>()
  const deals: ParsedMakroDeal[] = []

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i]
    if (seen.has(hit.pathname)) {
      continue
    }
    seen.add(hit.pathname)

    let end = Math.min(html.length, hit.index + 2500)
    for (let j = i + 1; j < hits.length; j++) {
      if (hits[j].pathname !== hit.pathname) {
        end = hits[j].index
        break
      }
    }

    const windowHtml = html.slice(hit.index, end)
    const titleMatch = /title="([^"]+)"/i.exec(hit.attrs)
    const title = cleanText(
      titleMatch?.[1] ?? hit.inner.replace(/<[^>]+>/g, " ")
    )
    const prices = pricesIn(windowHtml)
    if (!title || prices.length === 0) {
      continue
    }

    const sale = prices[0]
    const was = prices[1]
    deals.push({
      storeSlug: "makro",
      title,
      description: title,
      priceCents: sale,
      compareAtCents: was !== undefined && was > sale ? was : undefined,
      url: `${MAKRO_ORIGIN}${hit.pathname}`,
      imageUrl: imageIn(hit.inner) ?? imageIn(windowHtml),
    })

    if (deals.length >= MAKRO_DEAL_CAP) {
      break
    }
  }

  return deals
}
