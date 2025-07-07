import http from '../http-common'

const list   = (cfg={}) => http.get('/reservations', cfg)
const get    = id       => http.get(`/reservations/${id}`)
const create = payload   => http.post('/reservations', payload).then(r => r.data)
const update = (id,payload) => http.patch(`/reservations/${id}`, payload).then(r => r.data)
const remove = id        => http.delete(`/reservations/${id}`)

/* ─── “truco”: trae todas y filtra por sessionId ───────────────────── */
const listBySession = async (sessionId, cfg = {}) => {
  const { data } = await list(cfg)          // ← una sola llamada
  return data.filter(r => r.session.id === Number(sessionId))
}

export default { list, get, create, update, remove, listBySession }
