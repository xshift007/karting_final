// src/hooks/useApiErrorHandler.jsx
import { useNotify } from './useNotify'

/**
 * Hook centralizado para mostrar errores provenientes de Axios / fetch.
 * Devuelve una función que puedes llamar con el objeto de error.
 */
export const useApiErrorHandler = () => {
  const notify = useNotify()
  return err => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message

    // mapea mensajes conocidos
    if (/Capacidad|Overlap/i.test(msg)) {
      notify('Capacidad de la sesión superada', 'error')
    } else {
      notify(msg, 'error')
    }
  }
}
