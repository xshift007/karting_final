import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import reservationSvc from '../services/reservation.service'

export default function ReservationDetailsDialog({ id, open, onClose }) {
  const { data } = useQuery(['res', id], () => reservationSvc.get(id), {
    enabled: open && !!id
  })
  const r = data?.data
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Detalles Reserva</DialogTitle>
      <DialogContent dividers>
        {r ? (
          <Stack spacing={1}>
            <Typography>Cliente: {r.client.fullName}</Typography>
            <Typography>Tarifa: {r.rateType}</Typography>
            <Typography>Participantes: {r.participants}</Typography>
          </Stack>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
