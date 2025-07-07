// kartingrm-frontend/src/http-common.js
import axios from 'axios'

/* ──────────────────────────────────────────────────────────
   Construimos baseURL así:

   • Si hay VITE_BACKEND_API_URL (= raíz del backend), añadimos /api
       Ej.: http://localhost:8080  →  http://localhost:8080/api
   • Si NO hay variable, asumimos que el front llamará a /api
     y Vite lo proxy-eará a http://localhost:8080 (dev).
─────────────────────────────────────────────────────────── */
const root = import.meta.env.VITE_BACKEND_API_URL          // puede ser undefined
const baseURL = root
  ? `${root.replace(/\/+$/, '')}/api`
  : '/api'

const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000
})

/* -------- INTERCEPTOR GLOBAL DE ERRORES -------- */
http.interceptors.response.use(null, err => {
  // 0️⃣ Ignorar cancelaciones explícitas
  if (err.code === 'ERR_CANCELED' || err.message === 'canceled') {
    return Promise.reject(err)
  }

  // 1. Información devuelta por el backend (cuando existe)
  const code    = err.response?.data?.code
  const backend = err.response?.data?.message

  // 2. Mapeo de códigos conocidos
  const known =
        code === 'CAPACITY_EXCEEDED' ? 'Capacidad de la sesión superada' :
        code === 'SESSION_OVERLAP'   ? 'El horario seleccionado ya está ocupado. Por favor, revise el rack de disponibilidad.' :
        code === 'DUPLICATE_CODE'    ? 'El código ya existe' :
        code === 'BAD_REQUEST'       ? backend :
        // 3. Si hay mensaje de backend lo mostramos
        backend ? backend :
        // 4. Si la petición nunca llegó al backend o la respuesta no es JSON
        err.message || `Error HTTP ${err.response?.status ?? ''}`.trim()

  window.dispatchEvent(new CustomEvent('httpError', { detail: known }))
  return Promise.reject(err)
})

export default http
