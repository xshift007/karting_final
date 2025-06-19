// src/pages/SessionsCrud.jsx
import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Paper, Dialog, TextField, Stack } from '@mui/material'
import ConfirmDialog from '../components/ConfirmDialog'
import sessionService from '../services/session.service'

export default function SessionsCrud() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ sessionDate:'', startTime:'', endTime:'', capacity:0 })
  const [confirm,setConfirm] = useState({open:false,id:null})

  /* ---------- carga inicial con AbortController ---------- */
  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const res = await sessionService.getAll({ signal: controller.signal })
        setRows(res.data)
      } catch (err) {
        if (!controller.signal.aborted) console.error(err)
      }
    }
    load()

    return () => controller.abort()
  }, [])

  const reload = () => sessionService.getAll().then(r => setRows(r.data))

  const handleSave = () => {
    const fn = edit
      ? sessionService.update(edit.id, form)
      : sessionService.create(form)

    fn.then(() => {
      reload()
      setOpen(false)
      setEdit(null)
      setForm({ sessionDate:'', startTime:'', endTime:'', capacity:0 })
    })
  }

  /* ---------- JSX ---------- */
  return (
    <Paper sx={{ p:2 }}>
      <Button variant="contained" onClick={()=>setOpen(true)}>
        Crear Sesión
      </Button>

      <div style={{ height:400, width:'100%' }}>
        <DataGrid
          rows={rows}
          columns={[
            { field:'id',         headerName:'ID',        width:70 },
            { field:'sessionDate',headerName:'Fecha',     width:120 },
            { field:'startTime',  headerName:'Inicio',    width:100 },
            { field:'endTime',    headerName:'Fin',       width:100 },
            { field:'capacity',   headerName:'Capacidad', width:100 },
            {
              field:'actions', headerName:'Acciones', width:180,
              renderCell: params => (
                <>
                  <Button size="small" onClick={()=>{
                    setEdit(params.row)
                    setForm(params.row)
                    setOpen(true)
                  }}>
                    Editar
                  </Button>
                  <Button size="small" color="error"
                    onClick={()=> setConfirm({open:true,id:params.row.id})}>
                    Eliminar
                  </Button>
                </>
              )
            }
          ]}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>

      {/* diálogo alta/edición */}
      <Dialog open={open} onClose={()=>setOpen(false)}>
        <Paper sx={{ p:3, width:400 }}>
          <Stack spacing={2}>
            <TextField label="Fecha" type="date" InputLabelProps={{shrink:true}}
              value={form.sessionDate}
              onChange={e=>setForm({ ...form, sessionDate:e.target.value })}/>
            <TextField label="Inicio" type="time" InputLabelProps={{shrink:true}}
              value={form.startTime}
              onChange={e=>setForm({ ...form, startTime:e.target.value })}/>
            <TextField label="Fin" type="time" InputLabelProps={{shrink:true}}
              value={form.endTime}
              onChange={e=>setForm({ ...form, endTime:e.target.value })}/>
            <TextField label="Capacidad" type="number"
              value={form.capacity}
              onChange={e=>setForm({ ...form, capacity:Number(e.target.value) })}/>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={()=>setOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleSave}>Guardar</Button>
            </Stack>
          </Stack>
        </Paper>
      </Dialog>
      <ConfirmDialog
        open={confirm.open}
        msg="¿Eliminar sesión?"
        onClose={()=>setConfirm({open:false,id:null})}
        onConfirm={()=>sessionService.delete(confirm.id).then(()=>{setConfirm({open:false,id:null});reload();})}
      />
    </Paper>
  )
}
