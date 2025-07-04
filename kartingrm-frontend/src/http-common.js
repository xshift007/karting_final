import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '/api';

const http = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

/* -------- INTERCEPTOR GLOBAL DE ERRORES -------- */
http.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.data?.code) {
      /* Mapea códigos → mensajes amigables */
      const map = {
        CAPACITY_EXCEEDED : 'La sesión ya está completa ❌',
        SESSION_OVERLAP   : 'Ese horario ya está ocupado ⏰',
        DUPLICATE_CODE    : 'Código de reserva duplicado',
        BAD_REQUEST       : err.response.data.message
      };
      const msg = map[err.response.data.code] || err.response.data.message;
      /* Lanza evento global capturado por ErrorBoundary */
      window.dispatchEvent(new CustomEvent('httpError',{ detail: msg }));
    }
    return Promise.reject(err);
  }
);

export default http;