// src/services/tariff.service.js
import http from '../http-common'

const list   = cfg => http.get('/tariffs', cfg).then(r => r.data)
const update = (rate, payload, cfg={}) =>
  http.put(`/tariffs/${rate}`, payload, cfg).then(r => r.data)

export default { list, update }
