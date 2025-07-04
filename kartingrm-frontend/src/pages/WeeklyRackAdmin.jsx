// src/pages/WeeklyRackAdmin.jsx ─ versión abreviada
import WeeklyRack from './WeeklyRack'
import sessionSvc from '../services/session.service'
import { useNavigate } from 'react-router-dom'
import { Dialog, Paper, Stack, TextField, Button } from '@mui/material'
import { useState } from 'react'

export default function WeeklyRackAdmin(){
  const [dlg,setDlg]=useState({open:false, date:'', start:'', end:'', cap:15})
  const navigate = useNavigate()

  const open = (date,start,end) =>
    setDlg({open:true,date,start,end,cap:15})

  const save = async ()=>{
    try{
      await sessionSvc.create({
        sessionDate:dlg.date,
        startTime:dlg.start,
        endTime:dlg.end,
        capacity:dlg.cap
      })
      setDlg({...dlg,open:false});
      navigate(0)
    }catch{
      /* Mensaje vendrá del interceptor – no cerrar diálogo */
    }
  }

  return (
    <>
      <WeeklyRack onCellClickAdmin={open}/>
      <Dialog open={dlg.open} onClose={()=>setDlg({...dlg,open:false})}>
        <Paper sx={{p:3}}>
          <Stack spacing={2}>
            <TextField label="Capacidad" type="number"
              value={dlg.cap} onChange={e=>setDlg({...dlg,cap:+e.target.value})}/>
            <Button variant="contained" onClick={save}>Guardar</Button>
          </Stack>
        </Paper>
      </Dialog>
    </>
  )
}
