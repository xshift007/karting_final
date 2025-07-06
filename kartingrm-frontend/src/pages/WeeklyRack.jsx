// src/pages/WeeklyRack.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Tooltip, Box, Alert
} from '@mui/material'
import sessionService from '../services/session.service'
import { format, addDays, startOfWeek } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const DOW = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']

export default function WeeklyRack({ onCellClickAdmin }) {
  const [rack, setRack] = useState({})          // nunca null
  const navigate = useNavigate()

  const monday = startOfWeek(new Date(), { weekStartsOn:1 })
  const from   = format(monday,'yyyy-MM-dd')
  const to     = format(addDays(monday,6),'yyyy-MM-dd')

  /* ---------- carga con AbortController ---------- */
  useEffect(() => {
    const controller = new AbortController()

    sessionService.weekly(from, to, { signal: controller.signal })
      .then(r => setRack(r.data ?? {}))        // <= fallback seguro
      .catch(err => {
        if (!controller.signal.aborted) console.error(err)
      })

    return () => controller.abort()
  }, [from, to])

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
            {DOW.map(d=>(
              <TableCell key={d} sx={{ fontWeight:'bold', textAlign:'center' }}>
                {d.slice(0,3)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {slots.map(range => {
            const [start,end] = range.split('-')
            return (
              <TableRow key={range}>
                <TableCell sx={{ fontWeight:500 }}>{range}</TableCell>

                {DOW.map((d,idx)=>{
                  const ses = rack?.[d]?.find(s=>s.startTime === start)

                  if (!ses) return <TableCell key={d+range}></TableCell>

                  const pct     = ses.participantsCount / ses.capacity
                  const isFull  = pct === 1
                  const label   = `${ses.participantsCount}/${ses.capacity}`
                                  
                  return (
                    <TableCell key={d+range} sx={{ p:0 }}>
                      <Tooltip title={`Reservados ${label}`}>
                        <Box
                          sx={{
                            bgcolor: cellColor(pct),
                            color:  '#fff',
                            py: .5,
                            cursor: isFull ? 'not-allowed':'pointer',
                            textAlign:'center',
                            '&:hover': { opacity: isFull ? 1 : .8 }
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