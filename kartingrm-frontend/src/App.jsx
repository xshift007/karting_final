// src/App.jsx

import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import { CircularProgress } from '@mui/material'
import Navbar from './components/Navbar'

// Carga perezosa (code splitting) de cada página para optimizar el bundle(conjunto de archivos JavaScript, CSS que el sistema)
// agrupa en uno o varios ficheros finales que se envían al navegador


const Home             = lazy(() => import('./pages/Home'))
const WeeklyRack       = lazy(() => import('./pages/WeeklyRack'))
const ReservationForm  = lazy(() => import('./pages/ReservationForm'))
const ReservationsList = lazy(() => import('./pages/ReservationsList'))
const ReportCharts     = lazy(() => import('./pages/ReportCharts'))
const ClientsCrud      = lazy(() => import('./pages/ClientsCrud'))
const SessionsCrud     = lazy(() => import('./pages/SessionsCrud'))
const PaymentPage      = lazy(() => import('./pages/PaymentPage'))
const NotFound         = lazy(() => import('./pages/NotFound'))
const TariffsCrud      = lazy(() => import('./pages/TariffsCrud'))
const WeeklyRackAdmin  = lazy(() => import('./pages/WeeklyRackAdmin'))

export default function App() {
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
            {/* Redirige la raíz hacia /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/rack" element={<WeeklyRack />} />
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route path="/reservations" element={<ReservationsList />} />
            <Route path="/payments/:reservationId" element={<PaymentPage />} />
            <Route path="/clients" element={<ClientsCrud />} />
            <Route path="/sessions" element={<SessionsCrud />} />
            <Route path="/reports" element={<ReportCharts />} />
            {/* Ruta comodín para 404 */}
            <Route path="*" element={<NotFound />} />
            <Route path="/tariffs" element={<TariffsCrud/>}/>
            <Route path="/rack-admin" element={<WeeklyRackAdmin/>}/>
          </Routes>
        </Suspense>
      </Container>
    </>
  )
}
