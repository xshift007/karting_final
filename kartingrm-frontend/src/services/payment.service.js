import http from '../http-common'
const pay = payload => http.post('/payments', payload)
const receipt = id => http.get(`/payments/${id}/receipt`, {
  responseType:'blob',
  headers:{ Accept:'application/pdf' }
})
export default { pay, receipt }
