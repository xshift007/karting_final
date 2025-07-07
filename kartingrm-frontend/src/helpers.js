// kartingrm-frontend/src/helpers.js
// ──────────────────────────────────────────────────────────
//  Utilidades comunes de fechas, horas y precios
// ──────────────────────────────────────────────────────────
import dayjs from 'dayjs'

/* ---------- Fecha ---------- */
export const fmtDate = (d) =>
  typeof d === 'string' ? d : dayjs(d).format('YYYY-MM-DD')

/* ---------- Tiempo (HH:mm:ss) ---------- */
/** Convierte “14:30” → “14:30:00”. */
export const ensureSeconds = (t) =>
  t && t.length === 5 ? `${t}:00` : t

/** Suma `mins` minutos a HH:mm[:ss] y devuelve HH:mm:ss. */
export const addMinutes = (timeStr, mins) => {
  const [h = 0, m = 0, s = 0] = timeStr.split(':').map(Number)
  const date = new Date(0, 0, 0, h, m, s)
  date.setMinutes(date.getMinutes() + mins)
  const pad = (x) => String(x).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

/* ---------- Tarifas ---------- */
/**
 * Devuelve dos mapas { rate: price } y { rate: minutes }
 * a partir del array de tarifas recibido del backend.
 */
export const buildTariffMaps = (tariffs = []) => {
  const priceMap = {}
  const durMap = {}
  tariffs.forEach((t) => {
    priceMap[t.rate] = t.price
    durMap[t.rate] = t.minutes
  })
  return { priceMap, durMap }
}

/* ---------- Pricing (idéntico al backend) ---------- */
/**
 * Calcula el precio final aplicando:
 *   1) Descuento por grupo
 *   2) Descuento cliente frecuente (solo titular)
 *   3) 50 % a 1–2 cumpleañeros elegibles
 *
 * @param {Object} opts
 * @param {string}  opts.rateType
 * @param {number}  opts.participants           (1-15)
 * @param {number}  opts.birthdayCount
 * @param {number}  opts.visitsThisMonth
 * @param {Object}  opts.prices                 mapa { rate : price }
 * @param {boolean} [opts.ownerIsBirthday=false]
 */
export const computePrice = ({
  rateType,
  participants,
  birthdayCount = 0,
  visitsThisMonth = 0,
  prices = {},
  ownerIsBirthday = false,
}) => {
  const base = prices[rateType] ?? 0

  /* — Descuento por tamaño de grupo — */
  const groupDisc =
    participants <= 2 ? 0 :
    participants <= 5 ? 10 :
    participants <= 10 ? 20 : 30

  /* — Descuento cliente frecuente — */
  const freqDisc =
    visitsThisMonth >= 7 ? 30 :
    visitsThisMonth >= 5 ? 20 :
    visitsThisMonth >= 2 ? 10 : 0

  /* — Cumpleañeros con 50 % — */
  const birthdayWinners =
    participants < 3 ? 0 :
    participants <= 5
      ? Math.min(1, birthdayCount)
      : Math.min(2, birthdayCount)

  /* — Precios intermedios — */
  const afterGroup = base * (1 - groupDisc / 100)
  let ownerUnit = afterGroup * (1 - freqDisc / 100)
  let winnersLeft = birthdayWinners

  if (ownerIsBirthday && winnersLeft > 0) {
    ownerUnit *= 0.5
    winnersLeft--
  }

  const regularUnit = afterGroup
  const othersCount = participants - 1
  const othersPrice =
    regularUnit * (othersCount - winnersLeft) +
    regularUnit * 0.5 * winnersLeft

  const final = Math.round(ownerUnit + othersPrice)
  const subtotal = base * participants
  const totalDisc = subtotal
    ? Number(((subtotal - final) * 100) / subtotal).toFixed(2)
    : 0

  return {
    base,
    discGroup: groupDisc,
    discFreq: freqDisc,
    discBirth: birthdayWinners > 0 ? 50 : 0,
    totalDisc,
    final,
  }
}
