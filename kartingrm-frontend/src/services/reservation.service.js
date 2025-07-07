import http from '../http-common'

const list   = (cfg={}) => http.get('/api/reservations', cfg)
const get    = id       => http.get(`/api/reservations/${id}`)
const create = payload   => http.post('/api/reservations', payload).then(r => r.data)
const update = (id,payload) => http.patch(`/api/reservations/${id}`, payload).then(r => r.data)
const remove = id =>
  http.delete(`/api/reservations/${id}`).then(r => {
    window.dispatchEvent(new CustomEvent('availabilityUpdated'))
    return r
  })
export default { list, get, create, update, remove }
