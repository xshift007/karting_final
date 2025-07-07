// src/pages/WeeklyRack.jsx
// Navegación semanal (anterior/actual/siguiente) + click-to-form si hay cupos
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Tooltip, Box, Alert, Stack, Button
} from '@mui/material'
import sessionService from '../services/session.service'
import { format, addDays, startOfWeek } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import ReservationDetailsDialog from '../components/ReservationDetailsDialog'

const DOW = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']

export default function WeeklyRack({ onCellClickAdmin }) {
  const navigate = useNavigate()

  /* ---------------- estado de fecha base ---------------- */
  const [monday, setMonday] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [rack, setRack] = useState({})
  const [sel,  setSel]  = useState(null)

  const from = format(monday, 'yyyy-MM-dd')
  const to   = format(addDays(monday, 6), 'yyyy-MM-dd')

  /* ----------------- carga de disponibilidad ------------- */
  const loadRack = useCallback((signal) => {
    sessionService.weekly(from, to, { signal })
      .then(r => setRack(r.data ?? {}))
      .catch(err => { if (!signal?.aborted) console.error(err) })
  }, [from, to])

  const reload = useCallback(() => loadRack(), [loadRack])

  useEffect(() => {
    const controller = new AbortController()
    loadRack(controller.signal)
    return () => controller.abort()
  }, [loadRack])

  useEffect(() => {
    window.addEventListener('availabilityUpdated', reload)
    return () => window.removeEventListener('availabilityUpdated', reload)
  }, [reload])

  /* ----------------- filas de horas únicas --------------- */
  const slots = useMemo(() => {
    if (!rack || !Object.keys(rack).length) return []
    return Array.from(new Set(
      Object.values(rack).flat().map(s => `${s.startTime}-${s.endTime}`)
    )).sort((a, b) => a.localeCompare(b))
  }, [rack])

  /* ----------------- helpers UI -------------------------- */
  const cellColor = pct => (
    pct === 1 ? 'error.main' :
    pct >= 0.7 ? 'warning.main' : 'success.main'
  )

  const handleCellClick = ses => {
    if (!ses) return
    // modo admin (editar sesión)
    if (onCellClickAdmin) {
      onCellClickAdmin(ses.sessionDate, ses.startTime, ses.endTime)
      return
    }
    const full = ses.participantsCount === ses.capacity
    full
      ? setSel(ses.id) // mostrar detalles
      : navigate(
          `/reservations/new?d=${ses.sessionDate}&s=${ses.startTime}&e=${ses.endTime}`
        )
  }

  const rangeLabel =
    `${format(monday, 'dd MMM')} – ${format(addDays(monday, 6), 'dd MMM yyyy')}`

  /* ------------------- JSX ------------------------------ */
  return (
    <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Horario de Atención:
          <strong> Lunes–Viernes 14:00–22:00</strong> | 
          <strong> Sábados, Domingos y Feriados 10:00–22:00</strong>
        </Alert>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h5">Disponibilidad ({rangeLabel})</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => setMonday(prev => addDays(prev, -7))}>« Anterior</Button>
            <Button size="small" variant="outlined" onClick={() => setMonday(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Hoy</Button>
            <Button size="small" variant="outlined" onClick={() => setMonday(prev => addDays(prev, 7))}>Siguiente »</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Hora</TableCell>
              {DOW.map(d => (
                <TableCell key={d} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {d.slice(0, 3)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {slots.map(range => {
              const [start] = range.split('-')
              return (
                <TableRow key={range}>
                  <TableCell sx={{ fontWeight: 500 }}>{range}</TableCell>

                  {DOW.map(d => {
                    const ses = rack?.[d]?.find(s => s.startTime === start)
                    if (!ses) return <TableCell key={d + range} />

                    const pct   = ses.participantsCount / ses.capacity
                    const label = `${ses.participantsCount}/${ses.capacity}`

                    return (
                      <TableCell key={d + range} sx={{ p: 0 }}>
                        <Tooltip title={`Reservados ${label}`}>
                          <Box
                            sx={{
                              bgcolor: cellColor(pct),
                              color: '#fff',
                              py: .5,
                              cursor: 'pointer',
                              textAlign: 'center',
                              '&:hover': { opacity: .8 }
                            }}
                            onClick={() => handleCellClick(ses)}
                          >
                            {label}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <ReservationDetailsDialog
          id={sel}
          open={!!sel}
          onClose={() => setSel(null)}
        />
      </Paper>
  )
}
