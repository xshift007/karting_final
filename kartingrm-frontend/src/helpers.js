// ⚠️ Reemplaza TODO el archivo helpers.js
// ──────────────────────────────────────────────────────────
//  Utilities de fecha / hora de uso transversal
// ──────────────────────────────────────────────────────────

/** Asegura formato HH:mm:ss (LocalTime default). */
export const ensureSeconds = (t) =>
  t && t.length === 5               // «14:30»
    ? `${t}:00`                     // «14:30:00»
    : t;                            // ya trae segundos

/** Suma minutos a un string HH:mm[:ss] y devuelve HH:mm:ss */
export const addMinutes = (timeStr, mins) => {
  const [h = 0, m = 0, s = 0] = timeStr.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m, s);
  date.setMinutes(date.getMinutes() + mins);
  const pad = (x) => String(x).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};
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
export function computePrice({
  rateType,
  participants,
  birthdayCount = 0,
  visitsThisMonth = 0,
  prices = {}
}) {
  const base = prices[rateType] ?? 0

  // Descuento por grupo
  const g =
    participants <= 2 ? 0 :
    participants <= 5 ? 10 :
    participants <= 10 ? 20 : 30

  // Descuento por cliente frecuente
  const f =
    visitsThisMonth >= 7 ? 30 :
    visitsThisMonth >= 5 ? 20 :
    visitsThisMonth >= 2 ? 10 : 0

  // Cumpleañeros con descuento
  const winners =
    (birthdayCount === 1 && participants >= 3 && participants <= 5) ? 1 :
    (birthdayCount >= 2 && participants >= 6 && participants <= 15) ? Math.min(2, birthdayCount) :
    0

  // Aplicar descuento de grupo al precio base
  const priceAfterGroup = base * (1 - g / 100)

  // Precio para el titular (con descuento de cliente frecuente)
  const ownerPrice = priceAfterGroup * (1 - f / 100)

  // Precio para los otros participantes
  const regularPrice = priceAfterGroup

  let finalPrice = 0
  let winnersLeft = winners
  let ownerIsBirthday = false // Esto debería venir de los datos del formulario

  if (participants > 0) {
    let currentOwnerPrice = ownerPrice
    if (ownerIsBirthday && winnersLeft > 0) {
      currentOwnerPrice *= 0.5
      winnersLeft--
    }
    finalPrice += currentOwnerPrice
  }

  const othersCount = participants - 1
  const othersPrice = regularPrice * (othersCount - winnersLeft) + (regularPrice * 0.5 * winnersLeft)
  finalPrice += othersPrice

  const totalWithoutDiscount = base * participants
  const totalDiscount = totalWithoutDiscount > 0 ? ((totalWithoutDiscount - finalPrice) * 100) / totalWithoutDiscount : 0

  return {
    base,
    discGroup: g,
    discFreq: f,
    discBirth: winners > 0 ? 50 : 0,
    totalDisc: totalDiscount.toFixed(2),
    final: Math.round(finalPrice)
  }
}
