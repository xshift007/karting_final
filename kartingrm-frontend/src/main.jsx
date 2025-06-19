import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NotifyProvider } from './hooks/useNotify'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Captura errores JS en cualquier componente hijo */}
    <ErrorBoundary>
      <NotifyProvider>
        {/* Proporciona enrutamiento basado en historial de navegador */}
        <BrowserRouter>
          {/* Componente raíz de nuestra aplicación */}
          <App />
        </BrowserRouter>
      </NotifyProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
