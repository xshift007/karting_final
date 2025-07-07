import { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Stack, Button, Paper, Typography, TextField, Alert } from '@mui/material';
import reportService from '../services/report.service';
import dayjs from 'dayjs';
import { useNotify } from '../hooks/useNotify';

export default function ReportCharts() {

  const notify = useNotify()

  const year = dayjs().year()
  const [from, setFrom] = useState(dayjs().startOf('year').format('YYYY-MM-DD'))
  const [to,   setTo]   = useState(dayjs().endOf('year').format('YYYY-MM-DD'))

  const [byRate,  setByRate ] = useState([])
  const [byGroup, setByGroup] = useState([])

  const load = () => {
    if (dayjs(from).isAfter(to)) return notify('Rango inválido','error')
    reportService.byRate(from, to).then(r => setByRate(r.data))
    reportService.byGroup(from, to).then(r => setByGroup(r.data))
  }

  return (
    <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Reportes {year}
      </Typography>

      <Stack spacing={2} alignItems="center">

        <Stack direction="row" spacing={2}>
          <TextField type="date" label="Desde" value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField type="date" label="Hasta" value={to} onChange={e=>setTo(e.target.value)} />
        <Button variant="contained" onClick={load}>
          Cargar datos
        </Button>
        <Button
          variant="outlined"
          disabled={!byRate.length}
          component="a"
          href={`/api/reports/by-rate/csv?from=${from}&to=${to}`}
          download
        >
          Exportar CSV
        </Button>
        </Stack>
        {!byRate.length && !byGroup.length && (
          <Alert severity="info">Sin ingresos en este período</Alert>
        )}

        {byRate.length > 0 && (
          <>
            <Typography>Ingresos por Tarifa</Typography>
            <BarChart
              width={400}
              height={250}
              xAxis={[{ scaleType: 'band', data: byRate.map(d => d.rate) }]}
              series={[{ data: byRate.map(d => d.total) }]}
            />
          </>
        )}

        {byGroup.length > 0 && (
          <>
            <Typography>Ingresos por Grupo</Typography>
            <BarChart
              width={400}
              height={250}
              xAxis={[{ scaleType: 'band', data: byGroup.map(d => d.range) }]}
              series={[{ data: byGroup.map(d => d.total) }]}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
}
