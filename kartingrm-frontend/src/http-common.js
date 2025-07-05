import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '/api';

const http = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

/* -------- INTERCEPTOR GLOBAL DE ERRORES -------- */
http.interceptors.response.use(null, err => {
  const { code, message } = err.response?.data ?? {};

  const known =
    code === 'CAPACITY_EXCEEDED' ? 'Capacidad de la sesión superada' :
    code === 'SESSION_OVERLAP'   ? 'El horario seleccionado ya está ocupado. Por favor, revise el Rack de disponibilidad.' :
    code === 'DUPLICATE_CODE'    ? 'El código ya existe' :
    code === 'BAD_REQUEST'       ? message :
    message                      ? message : 'Error desconocido';

  const evt = new CustomEvent('httpError', { detail: known });
  window.dispatchEvent(evt);
  return Promise.reject(err);
});

export default http;
