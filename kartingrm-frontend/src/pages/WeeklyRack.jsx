// src/pages/WeeklyRack.jsx
import React, { useState, useEffect } from 'react'
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, CircularProgress } from '@mui/material'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import sessionSvc from '../services/session.service'

const DOW_EN = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const DOW_ES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

export default function WeeklyRack() {
  const navigate = useNavigate()
  const [rack, setRack] = useState(null)

  useEffect(() => {
    const monday = dayjs().startOf('week').add(1, 'day')
    const from = monday.format('YYYY-MM-DD')
    const to = monday.add(6, 'day').format('YYYY-MM-DD')
    sessionSvc.weekly(from, to).then(r => setRack(r.data ?? {}))
  }, [])

  if (!rack) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
  }

  const ranges = Array.from(new Set(
    Object.values(rack).flat().map(s => `${s.startTime}-${s.endTime}`)
  )).sort()

  return (
    <Paper sx={{ p: 2, overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hora</TableCell>
            {DOW_ES.map(d => (
              <TableCell key={d} align="center">{d}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {ranges.map(range => {
            const start = range.split('-')[0]
            return (
              <TableRow key={range}>
                <TableCell sx={{ fontWeight: 500 }}>{range}</TableCell>
                {DOW_EN.map(dayKey => {
                  const ses = rack[dayKey]?.find(s => s.startTime === start)
                  if (!ses) return <TableCell key={dayKey}></TableCell>
                  const free = ses.participantsCount < ses.capacity
                  return (
                    <TableCell
                      key={dayKey}
                      sx={{ bgcolor: free ? 'success.light' : 'error.main', textAlign: 'center', cursor: free ? 'pointer' : 'default' }}
                      onClick={() => free && navigate(`/reservations/new?d=${ses.sessionDate}&s=${ses.startTime}&e=${ses.endTime}`)}
                    >
                      {free ? 'Disponible' : 'Ocupado'}
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
