export function formatRand(cents: number): string {
  const negative = cents < 0
  const absolute = Math.abs(cents)
  const rands = Math.floor(absolute / 100)
  const remainder = absolute % 100
  const grouped = rands.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const amount = `R${grouped}.${remainder.toString().padStart(2, "0")}`
  return negative ? `-${amount}` : amount
}
