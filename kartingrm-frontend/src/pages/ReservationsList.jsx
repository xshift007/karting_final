// src/pages/ReservationsList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Button, Stack, Typography
} from '@mui/material'
import reservationService from '../services/reservation.service'
import { useNotify } from '../hooks/useNotify'

export default function ReservationsList() {
  const [list, setList] = useState([])
  const navigate = useNavigate()
  const notify = useNotify()

  /* carga con AbortController */
  useEffect(() => {
    const controller = new AbortController()

    const load = () =>
      reservationService.list({ signal: controller.signal })
        .then(r => setList(r.data))
        .catch(err => {
          if (!controller.signal.aborted) console.error(err)
        })

    load()
    return () => controller.abort()
  }, [])

  const reload = () =>
    reservationService.list().then(r => setList(r.data))

  const cancel = id =>
    reservationService.cancel(id).then(reload)
      .catch(err => notify(err.response?.data?.message || err.message,'error'))

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h6">Reservas</Typography>
        <Button variant="contained"
          onClick={()=>navigate('/reservations/new')}>
          Nueva reserva
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            {['Código','Cliente','Fecha','Hora','#','Tarifa','Estado',''].map(h=>
              <TableCell key={h}>{h}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {list.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.reservationCode}</TableCell>
              <TableCell>{r.client.fullName}</TableCell>
              <TableCell sx={{ display:{ xs:'none', md:'table-cell' } }}>
                {r.session.sessionDate}
              </TableCell>
              <TableCell>{`${r.session.startTime}-${r.session.endTime}`}</TableCell>
              <TableCell>{r.participants}</TableCell>
              <TableCell>{r.rateType}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>
                {r.status === 'PENDING' &&
                  <Button color="error" size="small"
                    onClick={() => cancel(r.id)}>
                    Cancelar
                  </Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
