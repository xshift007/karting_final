// src/pages/NotFound.jsx
import { Button, Paper, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFound() {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        404 – Página no encontrada
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Lo sentimos, la página que buscas no existe.
      </Typography>
      <Button component={RouterLink} to="/rack" variant="contained">
        Volver al Calendario
      </Button>
    </Paper>
  )
}
