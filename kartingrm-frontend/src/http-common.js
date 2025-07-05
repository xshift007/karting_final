import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '/api';

const http = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

/* -------- INTERCEPTOR GLOBAL DE ERRORES -------- */
http.interceptors.response.use(null, err => {
  // 0️⃣  Ignorar cancelaciones explícitas
  if (err.code === 'ERR_CANCELED' || err.message === 'canceled') {
    return Promise.reject(err);       //  ←  sin lanzar evento
  }
  // 1. Información devuelta por el backend (cuando existe)
  const code    = err.response?.data?.code;
  const backend = err.response?.data?.message;

  // 2. Mapeo de códigos conocidos
  const known =
    code === 'CAPACITY_EXCEEDED' ? 'Capacidad de la sesión superada' :
    code === 'SESSION_OVERLAP'   ? 'El horario seleccionado ya está ocupado. Por favor, revise el Rack de disponibilidad.' :
    code === 'DUPLICATE_CODE'    ? 'El código ya existe' :
    code === 'BAD_REQUEST'       ? backend :
    // 3. Si hay mensaje de backend lo mostramos
    backend ? backend :
    // 4. Si la petición nunca llegó al backend o la respuesta no es JSON
    err.message || `Error HTTP ${err.response?.status ?? ''}`.trim();

  const evt = new CustomEvent('httpError', { detail: known });
  window.dispatchEvent(evt);
  return Promise.reject(err);
});

export default http;
