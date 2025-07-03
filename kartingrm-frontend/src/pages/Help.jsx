import { Paper, Typography, Stack, List, ListItem, ListItemText, Divider } from '@mui/material'

export default function Help(){
  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Ayuda</Typography>
      <Stack spacing={3}>
        <section>
          <Typography variant="h6">Preguntas frecuentes</Typography>
          <Typography><b>¿Cómo creo una reserva?</b> Use el menú "Reservas" y presione "Nueva reserva".</Typography>
          <Typography><b>¿Dónde consulto reportes?</b> En la sección "Reportes" del menú principal.</Typography>
        </section>
        <Divider />
        <section>
          <Typography variant="h6">Atajos de Teclado</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Ir a Inicio:" secondary="Presiona 'g' y luego 'h'" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Ir a Reservas:" secondary="Presiona 'g' y luego 'r'" />
            </ListItem>
          </List>
        </section>
        <Divider />
        <Typography>Para soporte adicional, contacte al administrador.</Typography>
      </Stack>
    </Paper>
  )
}
