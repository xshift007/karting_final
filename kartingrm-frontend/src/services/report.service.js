import http from '../http-common'
const byRate  = (from,to) => http.get('/api/reports/by-rate',  {params:{from,to}})
const byGroup = (from,to) => http.get('/api/reports/by-group', {params:{from,to}})
const byRateMonthly  = (from,to) => http.get('/api/reports/by-rate/monthly',  { params:{ from, to } })
const byGroupMonthly = (from,to) => http.get('/api/reports/by-group/monthly', { params:{ from, to } })
export default { byRate, byGroup, byRateMonthly, byGroupMonthly }
