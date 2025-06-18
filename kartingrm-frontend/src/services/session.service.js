import http from '../http-common'

const weekly = (from, to, cfg = {}) =>
  http.get('/sessions/availability', { params:{ from, to }, ...cfg })

const getAll = (cfg = {})            => http.get('/sessions', cfg)
const create = (payload, cfg = {})   => http.post('/sessions', payload, cfg).then(r => r.data)
const update = (id, payload, cfg={}) => http.put(`/sessions/${id}`, payload, cfg).then(r => r.data)
const remove = (id, cfg = {})        => http.delete(`/sessions/${id}`, cfg)

export default { weekly, getAll, create, update, delete: remove }
