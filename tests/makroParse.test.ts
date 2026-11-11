import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  MAKRO_DEAL_CAP,
  parseMakroBlackFriday,
} from "../convex/collectors/makroParse"
import {
  buildCompareKey,
  categorize,
  productUrlAllowed,
} from "../convex/lib/dealFields"

function card(
  name: string,
  itemId: string,
  price: string,
  was: string,
  image: string
) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const href = `/${slug}/p/${itemId}?pid=TVR9ABC&amp;otracker1=clp_pmu`
  return `<a class="_2rpwqI" title="${name}" href="${href}"><img alt="${name}" src="${image}"/></a>
<a class="s1Q9rs" title="${name}" href="${href}">${name.slice(0, 12)}...</a>
<div><span>R ${price}</span><span>00</span></div>
<div><span>R ${was}</span><span>00</span></div>`
}

describe("parseMakroBlackFriday", () => {
  it("keeps the product fields from one specials card and drops tracking params", () => {
    const html = card(
      "Hisense 100 inch TV",
      "itm123",
      "1,299",
      "1,999",
      "https://www.makro.co.za/asset/rukmini/tv.jpeg?q=70"
    )
    const [deal] = parseMakroBlackFriday(html)
    assert.equal(deal.storeSlug, "makro")
    assert.equal(deal.title, "Hisense 100 inch TV")
    assert.equal(deal.description, "Hisense 100 inch TV")
    assert.equal(deal.priceCents, 129900)
    assert.equal(deal.compareAtCents, 199900)
    assert.equal(
      deal.url,
      "https://www.makro.co.za/hisense-100-inch-tv/p/itm123"
    )
    assert.equal(
      deal.imageUrl,
      "https://www.makro.co.za/asset/rukmini/tv.jpeg?q=70"
    )
  })

  it("does not mix the next product's price into the first", () => {
    const html = [
      card("Hisense TV", "itm1", "100", "200", "https://cdn.example/a.jpg"),
      card("Defy Fridge", "itm2", "300", "400", "https://cdn.example/b.jpg"),
    ].join("")
    const deals = parseMakroBlackFriday(html)
    assert.deepEqual(
      deals.map((deal) => [deal.title, deal.priceCents, deal.compareAtCents]),
      [
        ["Hisense TV", 10000, 20000],
        ["Defy Fridge", 30000, 40000],
      ]
    )
  })

  it("keeps a deal when the card has no image", () => {
    const html = `<a title="Pampers Size 4" href="/pampers/p/itm9"><span>Pampers Size 4</span></a>
<span>R 220</span><span>00</span>`
    const [deal] = parseMakroBlackFriday(html)
    assert.equal(deal.title, "Pampers Size 4")
    assert.equal(deal.imageUrl, undefined)
    assert.equal(deal.priceCents, 22000)
  })

  it("stops at the specials-page cap", () => {
    const html = Array.from({ length: MAKRO_DEAL_CAP + 10 }, (_, index) =>
      card(
        `Item ${index}`,
        `itm${index}`,
        "10",
        "20",
        "https://cdn.example/x.jpg"
      )
    ).join("")
    assert.equal(parseMakroBlackFriday(html).length, MAKRO_DEAL_CAP)
  })
})

describe("deal fields", () => {
  it("builds a compare key and a category from the title", () => {
    assert.equal(
      buildCompareKey("Pampers Premium Care, Size 4 (52)"),
      "pampers premium care size 4 52"
    )
    assert.equal(categorize("Hisense 100 inch TV"), "tech")
    assert.equal(categorize("Defy fridge 347L"), "appliances")
    assert.equal(categorize("Pampers Premium Care Size 4"), "baby")
    assert.equal(categorize("Running shoes"), "shoes")
    assert.equal(categorize("Beef Flavour Instant Noodles"), "groceries")
  })

  it("only accepts a product link on that shop", () => {
    assert.equal(
      productUrlAllowed("https://www.makro.co.za/tv/p/itm1", {
        host: "makro.co.za",
      }),
      true
    )
    assert.equal(
      productUrlAllowed("https://www.nike.com/za/t/shoe", {
        host: "nike.com",
        pathPrefix: "/za",
      }),
      true
    )
    assert.equal(
      productUrlAllowed("https://www.nike.com/t/shoe", {
        host: "nike.com",
        pathPrefix: "/za",
      }),
      false
    )
    assert.equal(
      productUrlAllowed("http://www.makro.co.za/tv", { host: "makro.co.za" }),
      false
    )
  })
})
