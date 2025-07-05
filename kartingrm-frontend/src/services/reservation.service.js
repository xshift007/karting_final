import http from '../http-common'

const list   = ()        => http.get('/reservations')
const get    = id       => http.get(`/reservations/${id}`)
const create = payload   => http.post('/reservations', payload).then(r => r.data)
const update = (id,payload) => http.patch(`/reservations/${id}`, payload).then(r => r.data)
const cancel = id        => http.patch(`/reservations/${id}/cancel`)
export default { list, get, create, update, cancel }
