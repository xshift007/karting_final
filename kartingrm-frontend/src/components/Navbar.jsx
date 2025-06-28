import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Link as RouterLink } from 'react-router-dom'

export default function Navbar(){
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow:1 }}>
          KartingRM
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" component={RouterLink} to="/home">Home</Button>
          <Button color="inherit" component={RouterLink} to="/rack">Rack</Button>
          <Button color="inherit" component={RouterLink} to="/reservations">Reservas</Button>
          <Button color="inherit" component={RouterLink} to="/reports">Reportes</Button>
          <Button color="inherit" component={RouterLink} to="/reports/monthly">Reporte Mensual</Button>
          <Button color="inherit" component={RouterLink} to="/clients">Clientes</Button>
          <Button color="inherit" component={RouterLink} to="/sessions">Sesiones</Button>
          <Button color="inherit" component={RouterLink} to="/tariffs">Tarifas</Button>
          <Button color="inherit" component={RouterLink} to="/rack-admin">Rack admin</Button>
          <Button color="inherit" component={RouterLink} to="/help">Ayuda</Button>

        </Stack>
      </Toolbar>
    </AppBar>
  )
}
