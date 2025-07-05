import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotifyProvider } from './hooks/useNotify'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Proveedor de notificaciones */}
    <NotifyProvider>
      {/* 2. Límite de error (ahora puede usar notificaciones) */}
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {/* Proporciona enrutamiento basado en historial de navegador */}
          <BrowserRouter>
            {/* Componente raíz de nuestra aplicación */}
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </NotifyProvider>
  </React.StrictMode>
)
