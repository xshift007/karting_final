import http from '../http-common'

/**
 *  Todos los métodos aceptan un objeto opcional (signal, headers, …)
 */
const getAll = (cfg = {})         => http.get('/api/clients',        cfg)
const get    = (id, cfg = {})     => http.get(`/api/clients/${id}`,   cfg)
const create = (payload, cfg = {})=> http.post('/api/clients', payload, cfg).then(r => r.data)
const update = (id, payload, cfg={}) =>
  http.put(`/api/clients/${id}`, payload, cfg).then(r => r.data)

export default { getAll, get, create, update }
