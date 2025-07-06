import { createContext,useContext,useState } from 'react'
import { Snackbar,Alert } from '@mui/material'

export const NotifyContext = createContext()
export const useNotify = ()=> useContext(NotifyContext)

export function NotifyProvider({children}){
  const [snack,setSnack]=useState(null)
  return (
    <NotifyContext.Provider value={(msg,severity='info')=>setSnack({msg,severity})}>
      {children}
      <Snackbar
         key={snack?.msg}
         open={!!snack}
         autoHideDuration={4000}
         onClose={()=>setSnack(null)}>
        <Alert severity={snack?.severity}>{snack?.msg}</Alert>
      </Snackbar>
    </NotifyContext.Provider>
  )
}

/* helper de alto nivel – traduce códigos comunes */
export function useApiErrorHandler() {
  const notify = useNotify()
  return err => {
    const code = err.response?.data?.code
    switch (code) {
      case 'SESSION_OVERLAP':   return notify('Horario ocupado','error')
      case 'CAPACITY_EXCEEDED': return notify('Capacidad superada','error')
      case 'SPECIAL_DAY_MISMATCH': return notify('Tarifa especial (WE/HOL). Actualiza.','error')
      case 'DUPLICATED_EMAIL':  return notify('Los e-mails deben ser únicos','error') // ⭐️
      default: return notify(err.response?.data?.message || err.message,'error')
    }
  }
}
