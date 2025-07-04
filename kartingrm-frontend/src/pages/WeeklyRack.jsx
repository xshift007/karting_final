// src/pages/WeeklyRack.jsx
import React, { useMemo } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Typography, Tooltip, Box, Alert, CircularProgress, Stack
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import sessionSvc from '../services/session.service'
import { useNavigate } from 'react-router-dom'

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
              <TableRow key={range} sx={{ backgroundColor: 'success.light' }}>
                <TableCell sx={{ fontWeight: 500 }}>{range}</TableCell>

                {DOW_EN.map((dayKey, index) => {
                  const ses = rack?.[dayKey]?.find(s=>s.startTime === start)

                  if (!ses) return <TableCell key={DOW_ES[index] + range}></TableCell>

                  const isOccupied = ses.participantsCount > 0;
                  const label   = `${ses.participantsCount}/${ses.capacity}`
                                  
                  return (
                    <TableCell key={DOW_ES[index] + range} sx={{ p:0 }}>
                      <Tooltip title={isOccupied ? `Ocupado ${label}` : `Disponible ${label}`}>
                        <Box
                          sx={{
                            bgcolor: isOccupied ? 'error.main' : 'transparent',
                            color:  isOccupied ? '#fff' : 'inherit',
                            py: .5,
                            cursor: isOccupied ? 'not-allowed':'pointer',
                            textAlign:'center',
                            '&:hover': { 
                                opacity: isOccupied ? 1 : 0.8,
                                backgroundColor: isOccupied ? 'error.main' : 'success.dark'
                            }
                          }}
                          onClick={()=>!isOccupied && handleCellClick(ses)}
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
