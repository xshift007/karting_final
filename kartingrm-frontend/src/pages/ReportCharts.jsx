import { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Stack, Button, Paper, Typography } from '@mui/material';
import reportService from '../services/report.service';
import dayjs from 'dayjs';

export default function ReportCharts() {

  const year = dayjs().year();
  const from = dayjs().startOf('year').format('YYYY-MM-DD');
  const to   = dayjs().endOf('year').format('YYYY-MM-DD');

  const [byRate,  setByRate ] = useState([]);
  const [byGroup, setByGroup] = useState([]);

  const load = () => {
    reportService.byRate(from, to).then(r => setByRate(r.data));
    reportService.byGroup(from, to).then(r => setByGroup(r.data));
  };

  return (
    <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Reportes {year}
      </Typography>

      <Stack spacing={2} alignItems="center">

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={load}>
            Cargar datos
          </Button>
          <Button
            variant="outlined"
            disabled={!byRate.length}
            onClick={() => window.open(`/api/reports/by-rate/csv?from=${from}&to=${to}`)}
          >
            Exportar CSV
          </Button>
        </Stack>

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
