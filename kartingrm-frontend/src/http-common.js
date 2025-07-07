// kartingrm-frontend/src/http-common.js
import axios from 'axios'

const http = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_API_URL ||
    '/api',                    // producción detrás de reverse-proxy
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

/* ---------- Interceptor global de errores ---------- */
http.interceptors.response.use(
  (res) => res,
  (err) => {
    /* 0️⃣ Cancelaciones explícitas → no mostrar alerta */
    if (err.code === 'ERR_CANCELED' || err.message === 'canceled') {
      return Promise.reject(err)
    }

    /* 1️⃣ Info devuelta por backend (cuando existe) */
    const code = err.response?.data?.code
    const backendMsg = err.response?.data?.message

    /* 2️⃣ Mapeo de códigos conocidos */
    const humanMsg =
      code === 'CAPACITY_EXCEEDED'
        ? 'Capacidad de la sesión superada'
        : code === 'SESSION_OVERLAP'
        ? 'El horario seleccionado ya está ocupado. Revisa el Rack.'
        : code === 'DUPLICATE_CODE'
        ? 'El código ya existe'
        : code === 'BAD_REQUEST'
        ? backendMsg
        : /* 3️⃣ Mensaje literal del backend si existe */
        backendMsg
        ? backendMsg
        : /* 4️⃣ Fallback genérico */
          (err.message || `Error HTTP ${err.response?.status ?? ''}`).trim()

    /* 5️⃣ Propagar evento a ErrorBoundary / useNotify */
    window.dispatchEvent(new CustomEvent('httpError', { detail: humanMsg }))

    return Promise.reject(err)
  }
)

export default http
