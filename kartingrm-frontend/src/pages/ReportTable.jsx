import { useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Button, Stack, TextField, Alert
} from '@mui/material';
import reportService from '../services/report.service';
import dayjs from 'dayjs';
import { useNotify } from '../hooks/useNotify';

const monthName = n => dayjs().month(n - 1).format('MMMM');

export default function ReportTable() {
  const notify = useNotify()
  const [from, setFrom] = useState(dayjs().startOf('year').format('YYYY-MM-DD'))
  const [to,   setTo]   = useState(dayjs().endOf('year').format('YYYY-MM-DD'))

  const [rateData, setRateData]   = useState([])
  const [groupData, setGroupData] = useState([])

  const load = async () => {
    if (dayjs(from).isAfter(to)) return notify('Rango inválido','error')
    const [r1, r2] = await Promise.all([
      reportService.byRateMonthly(from, to),
      reportService.byGroupMonthly(from, to)
    ])
    setRateData(r1.data)
    setGroupData(r2.data)
  }

  const monthNums = Array.from(new Set(rateData.map(d => d.month)))
    .sort((a,b)=> a - b);
  const months = monthNums.map(monthName);

  const buildMatrix = (data, keyField) => {
    const keys = Array.from(new Set(data.map(d=>d[keyField])));
    return keys.map(k => ({
      key: k,
      counts: monthNums.map(m => {
        const row = data.find(d => d.month===m && d[keyField]===k);
        return row?.total ?? 0;
      }),
      total: data.filter(d=>d[keyField]===k).reduce((s,d)=>s+d.total,0)
    }));
  };

  const rateMatrix  = buildMatrix(rateData, 'rate');
  const groupMatrix = buildMatrix(groupData,'range');

  return (
    <Paper sx={{ p:3, maxWidth:800, mx:'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField type="date" label="Desde" value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField type="date" label="Hasta" value={to} onChange={e=>setTo(e.target.value)} />
          <Button variant="contained" onClick={load}>Cargar reporte mensual</Button>
        </Stack>
        {!rateData.length && !groupData.length && (
          <Alert severity="info">Sin ingresos en este período</Alert>
        )}

        <Typography variant="h6">Ingresos por Tarifa</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tarifa</TableCell>
              {months.map(m => <TableCell key={m}>{m}</TableCell>)}
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rateMatrix.map(r => (
              <TableRow key={r.key}>
                <TableCell>{r.key}</TableCell>
                {r.counts.map((c,i)=>
                  <TableCell key={i}>{c.toLocaleString()}</TableCell>
                )}
                <TableCell><strong>{r.total.toLocaleString()}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6">Ingresos por Grupo</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Grupo</TableCell>
              {months.map(m => <TableCell key={m}>{m}</TableCell>)}
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupMatrix.map(g => (
              <TableRow key={g.key}>
                <TableCell>{g.key}</TableCell>
                {g.counts.map((c,i)=>
                  <TableCell key={i}>{c.toLocaleString()}</TableCell>
                )}
                <TableCell><strong>{g.total.toLocaleString()}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
}
