// src/App.jsx

import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import { CircularProgress } from '@mui/material'
import Navbar from './components/Navbar'
import { useHotkeys } from 'react-hotkeys-hook'

// Carga perezosa (code splitting) de cada página para optimizar el bundle(conjunto de archivos JavaScript, CSS que el sistema)
// agrupa en uno o varios ficheros finales que se envían al navegador


const WeeklyRack       = lazy(() => import('./pages/WeeklyRack'))
const ReservationForm  = lazy(() => import('./pages/ReservationForm'))
const ReservationsList = lazy(() => import('./pages/ReservationsList'))
const ReportCharts     = lazy(() => import('./pages/ReportCharts'))
const ReportTable      = lazy(() => import('./pages/ReportTable'))
const ClientsCrud      = lazy(() => import('./pages/ClientsCrud'))
const PaymentPage      = lazy(() => import('./pages/PaymentPage'))
const NotFound         = lazy(() => import('./pages/NotFound'))
const TariffsCrud      = lazy(() => import('./pages/TariffsCrud'))
const Help            = lazy(() => import('./pages/Help'))

export default function App() {
  const navigate = useNavigate()
  useHotkeys('g>r', () => navigate('/reservations'))
  return (
    <>
      {/* Normaliza estilos base y tipografías con Material-UI */}
      <CssBaseline />

      {/* Barra de navegación fija en toda la app */}
      <Navbar />

      {/* Contenedor central con márgenes verticales */}
      <Container maxWidth="xl" sx={{ my: 4 }}>
        {/* 
          Suspense muestra un fallback (spinner) mientras se cargan dinámicamente
          los componentes lazy importados 
        */}
        <Suspense fallback={
          <CircularProgress sx={{ display:'block', margin:'2rem auto' }}/>
        }>
          {/* Definición de rutas de la aplicación */}
          <Routes>
            {/* Redirige la raíz hacia /rack */}
            <Route path="/" element={<Navigate to="/rack" replace />} />
            <Route path="/rack" element={<WeeklyRack />} />
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route path="/reservations" element={<ReservationsList />} />
            <Route path="/payments/:reservationId" element={<PaymentPage />} />
            <Route path="/clients" element={<ClientsCrud />} />
            <Route path="/reports" element={<ReportCharts />} />
            <Route path="/reports/monthly" element={<ReportTable />} />
            <Route path="/help" element={<Help />} />
            {/* Ruta comodín para 404 */}
            <Route path="*" element={<NotFound />} />
            <Route path="/tariffs" element={<TariffsCrud/>}/>
          </Routes>
        </Suspense>
      </Container>
    </>
  )
}
