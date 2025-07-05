// src/pages/ClientsCrud.jsx
import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Paper, Dialog, TextField, Stack } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'
import clientService from '../services/client.service'

const schema = yup.object().shape({
  fullName: yup.string().required('El nombre es obligatorio'),
  email: yup.string().email('Email inválido').required('El email es obligatorio'),
  phone: yup.string(),
  birthDate: yup.date()
    .required('La fecha de nacimiento es obligatoria')
    .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
    .test('is-of-age', 'Debes ser mayor de 18 años para registrarte', function (value) {
      if (!value) return true
      return dayjs().diff(dayjs(value), 'years') >= 18
    }),
})

export default function ClientsCrud() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      birthDate: '',
    },
  })

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

  const handleOpen = (client = null) => {
    if (client) {
      setEdit(client)
      setValue('fullName', client.fullName)
      setValue('email', client.email)
      setValue('phone', client.phone || '')
      setValue('birthDate', client.birthDate ? dayjs(client.birthDate).format('YYYY-MM-DD') : '')
    } else {
      setEdit(null)
      reset()
    }
    setOpen(true)
  }

  const handleSave = async data => {
    try {
      if (edit) {
        await clientService.update(edit.id, data)
      } else {
        await clientService.create(data)
      }
      await reload()
      setOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  /* ---------- JSX ---------- */
  return (
    <Paper sx={{ p:2 }}>
      <Button variant="contained" onClick={() => handleOpen()}>
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
                <Button size="small" onClick={() => handleOpen(params.row)}>
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
          <form onSubmit={handleSubmit(handleSave)}>
            <Stack spacing={2}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teléfono"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nacimiento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.birthDate}
                    helperText={errors.birthDate?.message}
                  />
                )}
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="contained">Guardar</Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Dialog>
    </Paper>
  )
}
