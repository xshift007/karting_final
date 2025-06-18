// src/pages/ClientsCrud.jsx
import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Paper, Dialog, TextField, Stack } from '@mui/material'
import clientService from '../services/client.service'

export default function ClientsCrud() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', birthDate:''/*, adress:''*/ })

  /* ---------- carga inicial con AbortController ---------- */
  useEffect(() => {
    const controller = new AbortController()

    const fetchClients = async () => {
      try {
        const res = await clientService.getAll({ signal: controller.signal })
        setRows(res.data)
      } catch (err) {
        if (!controller.signal.aborted) console.error(err)
      }
    }
    fetchClients()

    return () => controller.abort()
  }, [])                 // ← solo al montar

  const reload = async () => {
    const res = await clientService.getAll()
    setRows(res.data)
  }

  const handleSave = async () => {
    try {
      if (edit) {
        await clientService.update(edit.id, form)
      } else {
        await clientService.create(form)
      }
      await reload()
      setOpen(false)
      setEdit(null)
      setForm({ fullName:'', email:'', phone:'', birthDate:'',/* adress:'' */})
    } catch (e) {
      console.error(e)
    }
  }

  /* ---------- JSX ---------- */
  return (
    <Paper sx={{ p:2 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Crear Cliente
      </Button>

      <div style={{ height:400, width:'100%' }}>
        <DataGrid
          rows={rows}
          columns={[
            { field:'id',        headerName:'ID',        width:70 },
            { field:'fullName',  headerName:'Nombre',    width:200 },
            { field:'email',     headerName:'Email',     width:200 },
            { field:'phone',     headerName:'Teléfono',  width:150 },
            { field:'birthDate', headerName:'Nacimiento',width:130 },
            /*{ field:'address',  headerName:'Dirección', width:200 },*/ // Añadir campo
            {
              field:'actions', headerName:'Acciones', width:150,
              renderCell: params => (
                <Button size="small" onClick={() => {
                  setEdit(params.row)
                  setForm(params.row)
                  setOpen(true)
                }}>
                  Editar
                </Button>
              )
            }
          ]}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>

      {/* diálogo de alta/edición */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Paper sx={{ p:3, width:400 }}>
          <Stack spacing={2}>
            <TextField label="Nombre"     value={form.fullName}
              onChange={e=>setForm({ ...form, fullName:e.target.value })}/>
            <TextField label="Email"      value={form.email}
              onChange={e=>setForm({ ...form, email:e.target.value })}/>
            <TextField label="Teléfono"   value={form.phone}
              onChange={e=>setForm({ ...form, phone:e.target.value })}/>
            <TextField label="Nacimiento" type="date" InputLabelProps={{shrink:true}}
              value={form.birthDate}
              onChange={e=>setForm({ ...form, birthDate:e.target.value })}/>
            {/*<TextField
              label="Dirección"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
            />*/}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={()=>setOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleSave}>Guardar</Button>
            </Stack>
          </Stack>
        </Paper>
      </Dialog>
    </Paper>
  )
}
