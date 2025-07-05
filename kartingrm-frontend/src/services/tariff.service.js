// src/services/tariff.service.js
import http from '../http-common'

const list   = cfg => http.get('/rate-pricing', cfg).then(r => r.data)
const update = (rate, payload, cfg={}) =>
  http.put(`/rate-pricing/${rate.rate}/${rate.category}`, payload, cfg).then(r => r.data)

export default { list, update }
