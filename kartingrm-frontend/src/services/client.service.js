import http from '../http-common'

/**
 *  Todos los métodos aceptan un objeto opcional (signal, headers, …)
 */
const getAll = (cfg = {})         => http.get('/clients',        cfg)
const get    = (id, cfg = {})     => http.get(`/clients/${id}`,   cfg)
const create = (payload, cfg = {})=> http.post('/clients', payload, cfg).then(r => r.data)
const update = (id, payload, cfg={}) =>
  http.put(`/clients/${id}`, payload, cfg).then(r => r.data)

export default { getAll, get, create, update }
