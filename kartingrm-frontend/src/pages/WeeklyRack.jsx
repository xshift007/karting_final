// src/pages/WeeklyRack.jsx
import React, { useMemo } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Box, Alert, CircularProgress, Stack
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import sessionSvc from '../services/session.service'
import { useNavigate } from 'react-router-dom'
import { useApiErrorHandler } from '../hooks/useNotify'

const DOW_EN = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DOW_ES = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO']

const Legend = () => (
  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ width: 16, height: 16, bgcolor: 'success.light', borderRadius: 1 }} />
      <Typography variant="caption">Disponible</Typography>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 1 }} />
      <Typography variant="caption">Ocupado</Typography>
    </Stack>
  </Stack>
)

export default function WeeklyRack({ onCellClickAdmin }) {
  const navigate = useNavigate()
  const handleError = useApiErrorHandler()

  const monday = dayjs().startOf('week').add(1, 'day')
  const from   = monday.format('YYYY-MM-DD')
  const to     = monday.add(6, 'day').format('YYYY-MM-DD')

  const fetchRack = () =>
    sessionSvc.weekly(from, to)
      .then(r => r.data ?? {})
      .catch(handleError)


  const { data: rack = {}, isPending } = useQuery({
    queryKey: ['rack', from, to],
    queryFn: fetchRack,
    staleTime: 5 * 60_000
  })


  /* ---------- rangos de 30 min entre 10:00 y 22:00 ---------- */
  const slots = useMemo(() => {
    const result = []
    let start = dayjs().hour(10).minute(0)
    const end = dayjs().hour(22).minute(0)
    while (start.isBefore(end)) {
      const next = start.add(30, 'minute')
      result.push(`${start.format('HH:mm')}-${next.format('HH:mm')}`)
      start = next
    }
    return result
  }, [])

  const isOpen = (dayIndex, start) => {
    const [h, m] = start.split(':').map(Number)
    const minutes = h * 60 + m
    const minStart = dayIndex >= 5 ? 10 * 60 : 14 * 60
    return minutes >= minStart
  }

  const handleCellClick = (ses) => {
    if (!ses) return
    if (onCellClickAdmin) {
      onCellClickAdmin(ses.sessionDate, ses.startTime, ses.endTime)
      return
    }
    navigate(`/reservations/new?d=${ses.sessionDate}&s=${ses.startTime}&e=${ses.endTime}`)
  }

  /* ---------- JSX ---------- */
  if (isPending) {
    return <CircularProgress sx={{ display:'block', mx:'auto', my:4 }}/>
  }

  return (
    <Paper sx={{ p:2, overflowX:'auto' }}>
      <Legend />
      <Alert severity="info" sx={{ mb:2 }}>
        Horario de Atención:
        <strong> Lunes–Viernes 14:00–22:00</strong> |
        <strong> Sábados, Domingos y Feriados 10:00–22:00</strong>
      </Alert>
      <Typography variant="h5" gutterBottom>
        Disponibilidad (semana {from})
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight:'bold' }}>Hora</TableCell>
            {DOW_ES.map(d=>(
              <TableCell key={d} sx={{ fontWeight:'bold', textAlign:'center' }}>
                {d.slice(0,3)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {slots.map(range => {
            const [start,_end] = range.split('-')
            return (
              <TableRow key={range}>
                <TableCell sx={{ fontWeight: 500 }}>{range}</TableCell>

                {DOW_EN.map((dayKey, index) => {
                  if (!isOpen(index, start)) {
                    return <TableCell key={DOW_ES[index] + range}></TableCell>
                  }

                  const ses = rack?.[dayKey]?.find(s=>s.startTime === start)
                  const full = ses && ses.participantsCount >= ses.capacity
                  const label = ses ? `${ses.participantsCount}/${ses.capacity}` : ''

                  return (
                    <TableCell
                      key={DOW_ES[index] + range}
                      sx={{
                        p: 1,
                        bgcolor: full ? 'error.main' : 'success.light',
                        textAlign: 'center',
                        cursor: ses && !full ? 'pointer' : 'default'
                      }}
                      onClick={() => ses && !full && handleCellClick(ses)}
                    >
                      {label}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Paper>
  )
}
