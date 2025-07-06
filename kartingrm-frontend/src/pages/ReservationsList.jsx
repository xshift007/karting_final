// src/pages/ReservationsList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Button, Stack, Typography, CircularProgress, Box
} from '@mui/material'
import reservationService from '../services/reservation.service'
import { useNotify, useApiErrorHandler } from '../hooks/useNotify'
import ConfirmDialog from '../components/ConfirmDialog'

export default function ReservationsList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const navigate = useNavigate()
  const notify = useNotify()
  const handleError = useApiErrorHandler()

  /* carga con AbortController */
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    reservationService.list({ signal: controller.signal })
      .then(r => setList(r.data))
      .catch(err => {
        if (!controller.signal.aborted) handleError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const reload = () => {
    setLoading(true)
    reservationService.list()
      .then(r => setList(r.data))
      .finally(() => setLoading(false))
  }

  const cancel = id => {
    reservationService.remove(id)
      .then(() => {
        reload()
        notify('Reserva cancelada', 'success')
      })
      .catch(err => handleError(err))
      .finally(() => setConfirm({ open: false, id: null }))
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
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
                  <Button color="error" size="small"
                    onClick={() => setConfirm({ open: true, id: r.id })}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <ConfirmDialog
        open={confirm.open}
        msg="¿Estás seguro de que quieres eliminar esta reserva?"
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={() => cancel(confirm.id)}
      />
    </>
  )
}
