// src/services/tariff.service.js
import http from '../http-common'
import { fmtDate } from '../helpers' // 1º TODOS los imports

const list   = cfg => http.get('/tariffs', cfg).then(r => r.data)
const update = (rate, payload, cfg={}) =>
  http.put(`/tariffs/${rate}`, payload, cfg).then(r => r.data)

/** Consulta precio/minutos + clasificación WEEKEND/HOLIDAY/REGULAR */
const preview = (date, rate, cfg = {}) =>
  http.get('/tariffs/preview', { params: { date: fmtDate(date), rate }, ...cfg })
      .then(r => r.data)

export default { list, update, preview }
