import { Paper, Typography, Stack } from '@mui/material'

export default function Help(){
  return (
    <Paper sx={{p:3, maxWidth:600, mx:'auto'}}>
      <Typography variant="h5" gutterBottom>Ayuda</Typography>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Preguntas frecuentes</Typography>
        <Typography>¿Cómo creo una reserva? Use el menú Reservas y presione "Nueva reserva".</Typography>
        <Typography>¿Dónde consulto reportes? En la sección Reportes del menú principal.</Typography>
        <Typography>Para soporte adicional contacte al administrador.</Typography>
      </Stack>
    </Paper>
  )
}
