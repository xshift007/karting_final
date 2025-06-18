// ⚠️ Reemplaza TODO el archivo helpers.js
/**
 * Construye dos mapas (precio, minutos) a partir de la respuesta
 *     [{ rate:'LAP_10', price:15000, minutes:30 }, …]
 */
export function buildTariffMaps(tariffs = []) {
  const priceMap = {}
  const durMap   = {}
  tariffs.forEach(t => {
    priceMap[t.rate] = t.price
    durMap[t.rate]   = t.minutes
  })
  return { priceMap, durMap }
}

/**
 * Cálculo idéntico al backend (descuentos secuenciales).
 *  · `prices` → mapa { rate : price }
 */
export function computePrice ({
  rateType,
  participants,
  birthdayCount = 0,
  visitsThisMonth = 0,
  prices = {}
}) {
  const base = prices[rateType] ?? 0          // ← dinámico

  /* % grupo */
  const g =
    participants <= 2 ? 0 :
    participants <= 5 ? 10 :
    participants <=10 ? 20 : 30

  /* % frecuente */
  const f =
    visitsThisMonth >= 7 ? 30 :
    visitsThisMonth >= 5 ? 20 :
    visitsThisMonth >= 2 ? 10 : 0

  /* cumpleañeros con 50 % */
  const winners =
    (birthdayCount === 1 && participants >= 3 && participants <= 5) ? 1 :
    (birthdayCount >= 2  && participants >= 6 && participants <=15) ? Math.min(2,birthdayCount) :
    0

  /* precios unitarios */
  const afterGroup = base * (1 - g / 100)
  const ownerUnit  = afterGroup * (1 - f / 100)
  const unitReg    = afterGroup
  const unitBirth  = afterGroup * 0.5

  const final = Math.round(
    unitReg   * (participants - winners) +
    unitBirth * winners
  )

  const totalDisc = ((base * participants - final) * 100) /
                    (base * participants)

  return {
    base,
    discGroup : g,
    discFreq  : f,
    discBirth : winners ? 50 : 0,
    totalDisc,
    final
  }
}
