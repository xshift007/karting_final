import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import reservationSvc from '../services/reservation.service'

export default function ReservationDetailsDialog({ id, open, onClose }) {

  /* ---------------- React-Query v5: firma con objeto --------------- */
  const { data, isPending } = useQuery({
    queryKey : ['reservation', id],
    queryFn  : () => reservationSvc.get(id),
    enabled  : open && !!id          // sólo cuando el diálogo está visible
  })

  const r = data?.data

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Detalles Reserva</DialogTitle>

      <DialogContent dividers>
        {isPending && <Typography>Cargando…</Typography>}

        {r && (
          <Stack spacing={1}>
            <Typography>Cliente: {r.client.fullName}</Typography>
            <Typography>Tarifa:  {r.rateType}</Typography>
            <Typography>Participantes: {r.participants}</Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
