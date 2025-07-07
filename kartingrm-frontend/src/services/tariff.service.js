// src/services/tariff.service.js
import http from '../http-common'
import { fmtDate } from '../helpers' // 1º TODOS los imports

const list   = cfg => http.get('/api/tariffs', cfg).then(r => r.data)
const update = (rate, payload, cfg={}) =>
  http.put(`/api/tariffs/${rate}`, payload, cfg).then(r => r.data)

/** Consulta precio/minutos + clasificación WEEKEND/HOLIDAY/REGULAR */
const preview = (date, rate, cfg = {}) =>
  http.get('/api/tariffs/preview', { params: { date: fmtDate(date), rate }, ...cfg })
      .then(r => r.data)

export default { list, update, preview }
