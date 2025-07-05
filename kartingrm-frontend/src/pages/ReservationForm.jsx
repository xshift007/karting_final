// src/pages/ReservationForm.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'
import { isWeekend } from 'date-fns'
import {
  TextField, Button, Stack, Paper, Typography,
  MenuItem, IconButton, Alert, Snackbar,
  CircularProgress
} from '@mui/material'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import { useNotify } from '../hooks/useNotify'

import reservationService from '../services/reservation.service'
import clientService      from '../services/client.service'
import sessionService     from '../services/session.service'
import tariffSvc          from '../services/tariff.service'
import { computePrice, buildTariffMaps } from '../helpers'

const RATE_TYPES = ['LAP_10','LAP_15','LAP_20']
const fmt = d => dayjs(d).format('YYYY-MM-DD')

/* ---------------- esquema ---------------- */
const schema = yup.object({
  clientId        : yup.number().required('Cliente obligatorio'),
  sessionDate     : yup.date().required('Fecha obligatoria'),
  startTime       : yup.string()
                        .required('Hora inicio obligatoria')
                        .test('is-in-future', 'La hora de inicio no puede ser en el pasado', function(value) {
                          const { sessionDate } = this.parent;
                          // Solo aplica la validación cuando la reserva es para hoy
                          if (dayjs(sessionDate).isSame(dayjs(), 'day')) {
                            if (!value) {
                              return true; // dejar que la validación 'required' actúye
                            }
                            // Construir la fecha y hora completas para compararlas con "ahora"
                            const now = dayjs();
                            const [hours, minutes] = value.split(':');
                            const selectedDateTime = dayjs(sessionDate).hour(hours).minute(minutes);

                            return selectedDateTime.isAfter(now);
                          }
                          return true;
                        }),
  endTime         : yup.string()
                        .required('Hora fin obligatoria')
                        .test('is-after','Fin debe ser posterior',
                              function (value){ return !value || value > this.parent.startTime }),
  participantsList: yup.array().of(
                      yup.object({
                        fullName: yup.string().required('Nombre obligatorio'),
                        email   : yup.string().email('Email inválido')
                                             .required('Email obligatorio'),
                        birthday: yup.boolean()
                      }))
                    .min(1,'Al menos 1 participante')
                    .max(15,'Máximo 15 participantes'),
  rateType        : yup.string().required()
})

export default function ReservationForm(){

  /* ------------ hooks de navegación ------------ */
  const navigate = useNavigate()
  const location = useLocation()

  /* ------------ estado auxiliar ------------ */
  const [clients,  setClients]  = useState([])
  const [_sessions, setSessions] = useState([])
  const [tariffs,  setTariffs ] = useState([])       // ← tarifas BD

  /* ------------ form principal --------------- */
  const {
    control, setValue, handleSubmit, watch,
    formState:{ errors, isSubmitting }
  } = useForm({
    resolver : yupResolver(schema),
    mode     : 'onChange',
    defaultValues:{
      clientId        : '',
      sessionDate     : dayjs().format('YYYY-MM-DD'),
      startTime       : '',
      endTime         : '',
      participantsList:[{ fullName:'', email:'', birthday:false }],
      rateType        : 'LAP_10'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name:'participantsList'
  })

  const notify = useNotify()
  const [toast,setToast] = useState({open:false,msg:'',severity:'success'})

  /* ---- watchers útiles ---- */
  const sessionDate = watch('sessionDate')
  const startTime   = watch('startTime')
  const rateType    = watch('rateType')

  /* ---------- mapas precio / duración ---------- */
  const { priceMap, durMap } = useMemo(
    () => buildTariffMaps(tariffs),
    [tariffs]
  )

  /* ---------- efectos ---------- */
  /* 1) prefills desde la URL (?d, ?s, ?e) */
  useEffect(()=>{
    const p = new URLSearchParams(location.search)
    p.get('d') && setValue('sessionDate', p.get('d'))
    p.get('s') && setValue('startTime',  p.get('s'))
    p.get('e') && setValue('endTime',    p.get('e'))
  },[location.search, setValue])

  /* 3) cargar clientes */
  useEffect(()=>{
    const c = new AbortController()
    clientService.getAll({ signal:c.signal })
      .then(r => setClients(r.data))
      .catch(err => { if (!c.signal.aborted) console.error(err) })
    return ()=>c.abort()
  },[])

  /* 4) cargar tarifas una vez */
  useEffect(()=>{
    tariffSvc.list().then(setTariffs)
  },[])

  /* 5) cargar sesiones del día (por ahora sin usar) */
  useEffect(()=>{
    if (!sessionDate) return
    const c = new AbortController()
    sessionService.weekly(sessionDate, sessionDate, { signal:c.signal })
      .then(r => setSessions(Object.values(r.data).flat()))
      .catch(err => { if (!c.signal.aborted) console.error(err) })
    return ()=>c.abort()
  },[sessionDate])

  /* 6) calcular hora fin automática */
  useEffect(()=>{
    if (!startTime || !rateType || !sessionDate) return
    const mins = durMap[rateType] ?? 0
    const end  = dayjs(`${sessionDate} ${startTime}`)
                   .add(mins,'minute').format('HH:mm')
    setValue('endTime', end, { shouldValidate:true, shouldDirty:true })
  },[startTime, rateType, sessionDate, durMap, setValue])

  /* ---------- envío ---------- */
  const onSubmit = async data => {
    try{
      /* ---- VALIDAR AFORO ---- */
      const { sessionDate, startTime, endTime, participantsList } = data
      const { data: week } = await sessionService.weekly(fmt(sessionDate), fmt(sessionDate))
      const slot = Object.values(week).flat()
                    .find(s => s.startTime===startTime && s.endTime===endTime)
      if (slot && slot.participantsCount + participantsList.length > slot.capacity){
        notify('La sesión ya está completa ❌','error')
        return
      }

      const res = await reservationService.create(data)

      notify('Reserva creada ✅','success')

      navigate(`/payments/${res.id}`,{ replace:true })
    }catch(e){
      if(e.response?.status===409){
        notify('El código ya existe. Intenta de nuevo.','error')
      }else{
        setToast({open:true,msg:e.response?.data?.message||e.message,severity:'error'})
        notify(e.response?.data?.message||e.message,'error')
      }
    }
  }

  /* ---------- resumen ---------- */
  const summary = useMemo(() => {
    const birthdayCount = fields.filter(f => f.birthday).length
    return computePrice({
      rateType,
      participants : fields.length,
      birthdayCount,
      prices       : priceMap
    })
  },[rateType, fields, priceMap])

  /* ---------- límites horario ---------- */
  const minStart = useMemo(
    () => isWeekend(new Date(sessionDate)) ? '10:00' : '14:00',
    [sessionDate]
  )
  const maxEnd = '22:00'

  /* ---------- UI ---------- */
  return (
    <Paper sx={{ p:3, maxWidth:600, mx:'auto' }}>
      <Typography variant="h5" gutterBottom>Crear Reserva</Typography>

      <Alert severity="info" sx={{ mb:2 }}>
        Horario de Atención: <strong>L-V&nbsp;14:00–22:00</strong> |{' '}
        <strong>S-D&nbsp;y&nbsp;Feriados 10:00–22:00</strong>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>

          {/* ---------- cliente ---------- */}
          <Controller name="clientId" control={control}
            render={({ field }) => (
              <TextField {...field} select label="Cliente"
                error={!!errors.clientId} helperText={errors.clientId?.message}>
                {clients.map(c =>
                  <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
              </TextField>
            )}
          />

          {/* ---------- fecha ---------- */}
          <Controller name="sessionDate" control={control}
            render={({ field }) => (
              <TextField {...field} type="date" label="Fecha"
                InputLabelProps={{shrink:true}}
                error={!!errors.sessionDate}
                helperText={errors.sessionDate?.message}/>
            )}
          />

          {/* ---------- hora inicio ---------- */}
          <Controller name="startTime" control={control}
            render={({ field }) => (
              <TextField {...field} type="time" label="Hora inicio"
                InputLabelProps={{shrink:true}}
                inputProps={{ step:300, min:minStart, max:maxEnd }}
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
                onChange={e=>{
                  field.onChange(e)
                  setValue('endTime','')           // vacía fin para recálculo
                }}/>
            )}
          />

          {/* ---------- tipo / vueltas (dinámico) ---------- */}
          <Controller name="rateType" control={control}
            render={({ field }) => (
              <TextField {...field} select label="Tipo de reserva"
                value={field.value || ''}
                error={!!errors.rateType}
                helperText={errors.rateType?.message}>
                <MenuItem value="">Seleccione…</MenuItem>
                {RATE_TYPES.map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* ---------- hora fin ---------- */}
          <Controller name="endTime" control={control}
            render={({ field }) => (
              <TextField {...field} type="time" label="Hora fin"
                InputLabelProps={{shrink:true}}
                inputProps={{ readOnly:true }} disabled
                error={!!errors.endTime}
                helperText={errors.endTime?.message}/>
            )}
          />

          {/* ---------- participantes ---------- */}
          <Typography variant="h6">Participantes</Typography>

          {fields.map((item, idx) => (
            <Stack key={item.id} direction="row" spacing={1} alignItems="center">

              <Controller name={`participantsList.${idx}.fullName`} control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nombre"
                    error={!!errors.participantsList?.[idx]?.fullName}
                    helperText={errors.participantsList?.[idx]?.fullName?.message}/>
                )}
              />

              <Controller name={`participantsList.${idx}.email`} control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email"
                    error={!!errors.participantsList?.[idx]?.email}
                    helperText={errors.participantsList?.[idx]?.email?.message}/>
                )}
              />

              <Controller name={`participantsList.${idx}.birthday`} control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Cumple">
                    <MenuItem value={false}>No</MenuItem>
                    <MenuItem value={true}>Sí</MenuItem>
                  </TextField>
                )}
              />

              <IconButton
                onClick={()=>remove(idx)}
                disabled={fields.length === 1}>
                <RemoveCircle/>
              </IconButton>
            </Stack>
          ))}

          <Button
            type="button"
            startIcon={<AddCircle/>}
            onClick={()=>append({ fullName:'', email:'', birthday:false })}
            disabled={fields.length >= 15}>
            Agregar participante
          </Button>

          {/* ---------- resumen ---------- */}
          <Paper variant="outlined" sx={{ p:2 }}>
            <Typography variant="subtitle1">Resumen</Typography>
            <Typography>Participantes: {fields.length}</Typography>
            <Typography>Tarifa base: ${summary.base}</Typography>
            <Typography>Descuento: {summary.totalDisc}%</Typography>
            <Typography variant="h6">Total estimado: ${summary.final}</Typography>
          </Paper>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={()=>navigate(-1)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting && <CircularProgress size={20} sx={{mr:1}}/>}
              Guardar
            </Button>
          </Stack>
        </Stack>
      </form>
      <Snackbar  open={toast.open} autoHideDuration={4000}
                 onClose={()=>setToast(v=>({...v,open:false}))}>
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  )
}
