import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, CircularProgress, Box, Button, Stack
} from '@mui/material'
import reservationSvc from '../services/reservation.service'
import { useApiErrorHandler } from '../hooks/useNotify'

export default function SessionReservations () {
  const { sessionId }     = useParams()
  const [rows, setRows]   = useState([])
  const [loading, setLoad] = useState(true)
  const handleError       = useApiErrorHandler()

  useEffect(() => {
    setLoad(true)
    reservationSvc.listBySession(sessionId)
      .then(setRows)
      .catch(handleError)
      .finally(() => setLoad(false))
  }, [sessionId])

  if (loading)
    return (
      <Box sx={{ display:'flex', justifyContent:'center', p:4 }}>
        <CircularProgress/>
      </Box>
    )

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h6">
          Reservas de la sesión #{sessionId}
        </Typography>
        <Button component={RouterLink} to="/rack" variant="outlined">
          Volver al Rack
        </Button>
      </Stack>

      {rows.length === 0
        ? <Typography>No hay reservas en esta sesión.</Typography>
        : (
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Código','Cliente','Participantes','Tarifa','Estado'].map(h =>
                  <TableCell key={h}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.reservationCode}</TableCell>
                  <TableCell>{r.client.fullName}</TableCell>
                  <TableCell>{r.participants}</TableCell>
                  <TableCell>{r.rateType}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
    </Paper>
  )
}
