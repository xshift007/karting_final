// src/pages/WeeklyRack.jsx
import { useEffect, useState } from 'react'
import {
  Paper, Box, Typography, Tooltip,
} from '@mui/material'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import sessionSvc from '../services/session.service'
import './WeeklyRack.css'

/* ---------- helpers ---------- */
const days = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']
const fmt  = t => t.slice(0,5)       // HH:mm -> HH:mm

function GridCell({ busy, info, onClick }) {
  /* busy === true  -> bloque ocupado / pasado
     busy === false -> disponible                     */

  const inner = (
    <Box
      component={busy ? 'div' : motion.div}
      whileHover={busy ? undefined : { scale: 1.08 }}
      className={busy ? 'cell busy' : 'cell free'}
      onClick={busy ? undefined : onClick}
    >
      {info.label}
    </Box>
  )

  return busy
    ? <Tooltip title={info.tooltip}>{inner}</Tooltip>
    : inner
}

export default function WeeklyRack() {
  const [data, setData] = useState({})

  /* carga inicial */
  useEffect(() => {
    const from = dayjs().startOf('week').add(1, 'day')    // lunes
    const to   = from.add(6, 'day')
    sessionSvc.weekly(from, to).then(r => setData(r.data))
  }, [])

  /* ----- grid de 7 columnas × 24 filas (bloques de 30 min) ----- */
  const rows = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2,'0')}:00`)

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Rack semanal</Typography>

      <Box className="rack">
        {/* encabezado horizontal */}
        <Box className="header empty" />
        {days.map(d => <Box key={d} className="header">{d}</Box>)}

        {/* grid cells */}
        {rows.map(hour => (
          <Box key={hour} className="row">
            <Box className="header">{hour}</Box>
            {days.map((d, idx) => {
              const dayIdx = (idx + 1) % 7          // DayOfWeek enum 1-7
              const blocks = data[dayIdx] ?? []
              const blk = blocks.find(b =>
                fmt(b.startTime) === hour)
              const busy = blk ? blk.participantsCount >= blk.capacity : false

              const info = blk
                ? {
                    label: `${blk.participantsCount}/${blk.capacity}`,
                    tooltip: busy
                      ? 'Sesión completa'
                      : `Quedan ${blk.capacity-blk.participantsCount}`
                  }
                : { label:'', tooltip:'' }

              return (
                <GridCell
                  key={`${hour}-${idx}`}
                  busy={busy || !blk}
                  info={info}
                  onClick={()=>{
                    // abre el formulario con fecha/hora pre-seleccionados
                    const date = dayjs().startOf('week').add(idx, 'day')
                                    .format('YYYY-MM-DD')
                    window.location = `/reservations/new?d=${date}`
                                     + `&start=${fmt(blk.startTime)}`
                                     + `&end=${fmt(blk.endTime)}`
                  }}
                />
              )
            })}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
