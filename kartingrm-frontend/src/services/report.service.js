import http from '../http-common'
const byRate  = (from,to) => http.get('/reports/by-rate',  {params:{from,to}})
const byGroup = (from,to) => http.get('/reports/by-group', {params:{from,to}})
export default { byRate, byGroup }
