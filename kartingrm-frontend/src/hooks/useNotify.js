import { createContext,useContext,useState } from 'react'
import { Snackbar,Alert } from '@mui/material'

export const NotifyContext = createContext()
export const useNotify = ()=> useContext(NotifyContext)

export function NotifyProvider({children}){
  const [snack,setSnack]=useState({open:false,msg:'',severity:'info'})
  return (
    <NotifyContext.Provider value={(msg,severity='info')=>setSnack({open:true,msg,severity})}>
      {children}
      <Snackbar open={snack.open}
                autoHideDuration={4000}
                onClose={()=>setSnack(v=>({...v,open:false}))}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </NotifyContext.Provider>
  )
}
