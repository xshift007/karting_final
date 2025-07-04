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
    {/* Captura errores JS en cualquier componente hijo */}
    <ErrorBoundary>
      <NotifyProvider>
        <QueryClientProvider client={queryClient}>
          {/* Proporciona enrutamiento basado en historial de navegador */}
          <BrowserRouter>
            {/* Componente raíz de nuestra aplicación */}
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </NotifyProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
