import { useState } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Button, Stack, TextField, Alert
} from '@mui/material'
import reportService from '../services/report.service'
import dayjs from 'dayjs'
import { useNotify } from '../hooks/useNotify'

const monthName = n => dayjs().month(n-1).format('MMMM')

export default function ReportTable() {
  const notify = useNotify()

  /* rango editable --------------------------------------------------- */
  const [from, setFrom] = useState(dayjs().startOf('year').format('YYYY-MM-DD'))
  const [to,   setTo]   = useState(dayjs().endOf('year').format('YYYY-MM-DD'))

  /* datos crudos ----------------------------------------------------- */
  const [rateData,  setRateData ] = useState([])
  const [groupData, setGroupData] = useState([])

  /* carga desde API -------------------------------------------------- */
  const load = async () => {
    if (dayjs(from).isAfter(to))
      return notify('Rango inválido','error')

    const [r1, r2] = await Promise.all([
      reportService.byRateMonthly (from,to),
      reportService.byGroupMonthly(from,to)
    ])
    setRateData (r1.data)
    setGroupData(r2.data)
  }

  /* helpers para tabla matricial ------------------------------------ */
  const monthNums = Array.from(new Set(rateData.map(d=>d.month)))
        .sort((a,b)=>a-b)
  const months = monthNums.map(monthName)

  const buildMatrix = (data, key) => {
    const keys = Array.from(new Set(data.map(d=>d[key])))
    return keys.map(k => {
      const counts = monthNums.map(m => {
        const row = data.find(d=>d.month===m && d[key]===k)
        return row?.total ?? 0
      })
      return {
        key: k,
        counts,
        total: counts.reduce((s,x)=>s+x,0)
      }
    })
  }

  const rateMx  = buildMatrix(rateData , 'rate')
  const groupMx = buildMatrix(groupData, 'range')

  return (
    <Paper sx={{ p:3, maxWidth:800, mx:'auto' }}>
      <Stack spacing={2}>
        {/* selector de fechas + botón */}
        <Stack direction="row" spacing={2}>
          <TextField type="date" label="Desde" value={from}
                     onChange={e=>setFrom(e.target.value)} />
          <TextField type="date" label="Hasta" value={to}
                     onChange={e=>setTo(e.target.value)} />
          <Button variant="contained" onClick={load}>
            Cargar reporte mensual
          </Button>
        </Stack>

        {!rateData.length && !groupData.length &&
          <Alert severity="info">Sin ingresos en este período</Alert>}

        {/* tabla por tarifa ------------------------------------------- */}
        <Typography variant="h6">Ingresos por Tarifa</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tarifa</TableCell>
              {months.map(m=><TableCell key={m}>{m}</TableCell>)}
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rateMx.map(r=>(
              <TableRow key={r.key}>
                <TableCell>{r.key}</TableCell>
                {r.counts.map((c,i)=>
                  <TableCell key={i}>{c.toLocaleString()}</TableCell>)}
                <TableCell><strong>{r.total.toLocaleString()}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* tabla por grupo ------------------------------------------- */}
        <Typography variant="h6" sx={{ mt:3 }}>Ingresos por Grupo</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Grupo</TableCell>
              {months.map(m=><TableCell key={m}>{m}</TableCell>)}
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupMx.map(g=>(
              <TableRow key={g.key}>
                <TableCell>{g.key}</TableCell>
                {g.counts.map((c,i)=>
                  <TableCell key={i}>{c.toLocaleString()}</TableCell>)}
                <TableCell><strong>{g.total.toLocaleString()}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  )
}
