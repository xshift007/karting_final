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
