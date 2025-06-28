import { useEffect, useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Button, Stack
} from '@mui/material';
import reportService from '../services/report.service';
import dayjs from 'dayjs';

export default function ReportTable() {
  const from = dayjs().startOf('year').format('YYYY-MM-DD');
  const to   = dayjs().endOf('year').format('YYYY-MM-DD');

  const [rateData, setRateData]   = useState([]);
  const [groupData, setGroupData] = useState([]);

  const load = async () => {
    const [r1, r2] = await Promise.all([
      reportService.byRateMonthly(from, to),
      reportService.byGroupMonthly(from, to)
    ]);
    setRateData(r1.data);
    setGroupData(r2.data);
  };

  const months = Array.from(new Set(rateData.map(d => d.month)))
    .sort((a,b)=> dayjs(a,'MMMM').month() - dayjs(b,'MMMM').month());

  const buildMatrix = (data, keyField) => {
    const keys = Array.from(new Set(data.map(d=>d[keyField])));
    return keys.map(k => ({
      key: k,
      counts: months.map(m => {
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
        <Button variant="contained" onClick={load}>Cargar reporte mensual</Button>

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
