// src/pages/WeeklyRack.jsx
import React, { useMemo } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Tooltip, Box, Alert, CircularProgress
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import sessionSvc from '../services/session.service'
import { useNavigate } from 'react-router-dom'

const DOW_EN = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DOW_ES = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO']

export default function WeeklyRack({ onCellClickAdmin }) {
  const navigate = useNavigate()

  const monday = dayjs().startOf('week').add(1, 'day')
  const from   = monday.format('YYYY-MM-DD')
  const to     = monday.add(6, 'day').format('YYYY-MM-DD')

  const fetchRack = () =>
    sessionSvc.weekly(from, to).then(r => r.data ?? {})

  const { data: rack = {}, isPending, refetch: _refetch } = useQuery({
    queryKey: ['rack', from, to],
    queryFn: fetchRack,
    staleTime: 5 * 60_000
  })

  /* ---------- todos los rangos HH:MM-HH:MM existentes ---------- */
  const slots = useMemo(() => {
    if (!rack || !Object.keys(rack).length) return []        // <= guarda
    return Array.from(
      new Set(
        Object.values(rack)
          .flat()
          .map(s => `${s.startTime}-${s.endTime}`)
      )
    ).sort((a,b)=>a.localeCompare(b))
  }, [rack])

  /* ---------- helpers UI ---------- */
  const cellColor = pct => (
    pct === 1        ? 'error.main'    // rojo full
    : pct >= 0.7     ? 'warning.main'  // naranja casi lleno
    : 'success.main'                   // verde disponible
  )

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
                <TableCell sx={{ fontWeight:500 }}>{range}</TableCell>

                {DOW_EN.map((dayKey, index) => {
                  const ses = rack?.[dayKey]?.find(s=>s.startTime === start)

                  if (!ses) return <TableCell key={DOW_ES[index] + range}></TableCell>

                  const pct     = ses.participantsCount / ses.capacity
                  const isFull  = ses.participantsCount >= ses.capacity
                  const label   = `${ses.participantsCount}/${ses.capacity}`
                                  
                  return (
                    <TableCell key={DOW_ES[index] + range} sx={{ p:0 }}>
                      <Tooltip title={`Reservados ${label}`}>
                        <Box
                          sx={{
                            bgcolor: cellColor(pct),
                            color:  '#fff',
                            py: .5,
                            cursor: isFull ? 'not-allowed':'pointer',
                            textAlign:'center',
                            backgroundColor: isFull ? '#ffcdd2' : '#e8f5e9',
                            opacity: isFull ? 0.6 : 1,
                            '&:hover': { opacity: isFull ? 0.6 : .8 }
                          }}
                          onClick={()=>!isFull && handleCellClick(ses)}
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
    </Paper>
  )
}
