// src/pages/ReservationForm.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import {
  TextField, Button, Stack, Paper, Typography,
  MenuItem, IconButton, Alert, Snackbar, Chip,
  CircularProgress
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import { useNotify } from '../hooks/useNotify'
import { useApiErrorHandler } from '../hooks/useApiErrorHandler'

import reservationService from '../services/reservation.service'
import clientService      from '../services/client.service'
import sessionService     from '../services/session.service'
import tariffSvc          from '../services/tariff.service'
import { computePrice, buildTariffMaps } from '../helpers'

const RATE_TYPES = ['LAP_10','LAP_15','LAP_20']
const fmt = d => dayjs(d).format('YYYY-MM-DD')

/* ---------------- esquema ---------------- */
const schema = z.object({
  clientId   : z.coerce.number().min(1, 'Selecciona un cliente'),
  sessionDate: z.date().min(dayjs().startOf('day').toDate()),
  startTime  : z.string(),
  endTime    : z.string(),
}).refine(d => dayjs(d.endTime,'HH:mm').isAfter(d.startTime), {
  path: ['endTime'],
  message: 'Hora fin > inicio'
})

export default function ReservationForm({ edit = false }){

  /* ------------ hooks de navegación ------------ */
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  /* ------------ estado auxiliar ------------ */
  const [clients,  setClients]  = useState([])
  const [tariffs,  setTariffs ] = useState([])       // ← tarifas BD

  /* ------------ form principal --------------- */
  const {
    control, setValue, handleSubmit, watch, trigger,
    formState:{ errors, isSubmitting }
  } = useForm({
    resolver : zodResolver(schema),
    mode     : 'onChange',
    defaultValues:{
      clientId        : '',
      sessionDate     : dayjs().toDate(),
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
  const handleError = useApiErrorHandler()
  const [toast,setToast] = useState({open:false,msg:'',severity:'success'})

  /*  Pre-cálculo de tarifa y tipo de día  */
  const [preview, setPreview] = useState(null)

  /* ---- watchers útiles ---- */
  const sessionDate = watch('sessionDate')
  const startTime   = watch('startTime')
  const rateType    = watch('rateType')

  /*  Cada vez que cambian fecha o tarifa ⇒ consultar preview */
  useEffect(() => {
    if (!sessionDate || !rateType) return
    tariffSvc.preview(
        dayjs(sessionDate).format('YYYY-MM-DD'),
        rateType)
      .then(p => {
        setPreview(p)
        if(startTime){
          setValue('endTime', dayjs(startTime, 'HH:mm').add(p.minutes,'minute').format('HH:mm'))
        }
      })
      .catch(handleError)
  }, [sessionDate, rateType, startTime, setValue, handleError])
  /* ---------- mapas precio / duración ---------- */
  const priceMap = useMemo(() => buildTariffMaps(tariffs).priceMap, [tariffs])
  /* 1) prefills desde la URL (?d, ?s, ?e) */
  useEffect(()=>{
    const p = new URLSearchParams(location.search)
    p.get('d') && setValue('sessionDate', dayjs(p.get('d')).toDate())
    p.get('s') && setValue('startTime',  p.get('s'))
    p.get('e') && setValue('endTime',    p.get('e'))
  },[location.search, setValue])

  useEffect(() => {
    if (edit && id) {
      reservationService.get(id).then(res => {
        const { client, session, participantsList, rateType } = res.data
        setValue('clientId', client.id)
        setValue('sessionDate', dayjs(session.sessionDate).toDate())
        setValue('startTime', session.startTime)
        setValue('endTime', session.endTime)
        setValue('rateType', rateType)
        setValue('participantsList', participantsList)
      })
    }
  }, [edit, id, setValue])

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
    tariffSvc.list()
      .then(setTariffs)
      .catch(err => console.error("Error al cargar tarifas:", err))
  },[])

  /* 4) Revalidar startTime cuando sessionDate cambia */
  useEffect(()=>{
    if(startTime){
      trigger('startTime')
    }
  },[sessionDate, trigger, startTime])


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

      const payload = { ...data, specialDay: preview?.specialDay }
      const promise = edit ? reservationService.update(id, payload)
                           : reservationService.create(payload)
      const res = await promise

      notify(`Reserva ${edit ? 'actualizada' : 'creada'} ✅`,'success')

      navigate(`/payments/${res.id}`,{ replace:true })
    }catch(e){
      handleError(e)
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
  const minStart = useMemo(() => {
    const day = dayjs(sessionDate).day()
    const isWeekendOrHoliday = day === 0 || day === 6
    return isWeekendOrHoliday ? '10:00' : '14:00'
  }, [sessionDate])
  const maxEnd = '22:00'

  /* ---------- UI ---------- */
  return (
    <Paper sx={{ p:3, maxWidth:600, mx:'auto' }}>
      <Typography variant="h5" gutterBottom>Crear Reserva</Typography>

      <Alert severity="info" sx={{ mb:2 }}>
        Horario de Atención: <strong>L-V 14:00–22:00</strong> |{' '}
        <strong>Sáb, Dom y Feriados 10:00–22:00</strong>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>

          {/* ---------- cliente ---------- */}
            <Controller name="clientId" control={control}
              render={({ field }) => (
                <TextField {...field} id={field.name} select label="Cliente"
                  error={!!errors.clientId} helperText={errors.clientId?.message}>
                {clients.map(c =>
                  <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
              </TextField>
            )}
          />

          {/* ---------- fecha ---------- */}
            <Controller name="sessionDate" control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label="Fecha"
                    value={dayjs(field.value)}
                    minDate={dayjs()}
                    onChange={d => field.onChange(d ? d.toDate() : null)}
                    slotProps={{ textField:{ error:!!errors.sessionDate, helperText:errors.sessionDate?.message } }}
                  />
                </LocalizationProvider>
            )}
          />

          {/* ---------- hora inicio ---------- */}
            <Controller name="startTime" control={control}
              render={({ field }) => (
                <TextField {...field} id={field.name} type="time" label="Hora inicio"
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
                <TextField {...field} id={field.name} select label="Tipo de reserva"
                  value={field.value || ''}
                  error={!!errors.rateType}
                  helperText={errors.rateType?.message}
                  onChange={async e => {
                    field.onChange(e)
                    try {
                      const rate = e.target.value
                      const p = await tariffSvc.preview(sessionDate, rate)
                      setPreview(p)
                      if(startTime){
                        setValue('endTime', dayjs(startTime, 'HH:mm').add(p.minutes,'minute').format('HH:mm'))
                      }
                    } catch(err){
                      handleError(err)
                    }
                  }}>
                <MenuItem value="">Seleccione…</MenuItem>
                {RATE_TYPES.map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            )}
          />

          {/*  Muestra info devuelta por backend  */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField label="Precio"
                       value={preview?.price ?? ''}
                       disabled />
            <TextField label="Duración"
                       value={preview?.minutes ?? ''}
                       disabled />
            {preview?.specialDay && preview.specialDay !== 'REGULAR' &&
              <Chip color="warning" label={preview.specialDay} />}
          </Stack>

          {/* ---------- hora fin ---------- */}
            <Controller name="endTime" control={control}
              render={({ field }) => (
                <TextField {...field} id={field.name} type="time" label="Hora fin"
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
                  <TextField {...field} id={field.name} label="Nombre"
                    error={!!errors.participantsList?.[idx]?.fullName}
                    helperText={errors.participantsList?.[idx]?.fullName?.message}/>
                )}
              />

              <Controller name={`participantsList.${idx}.email`} control={control}
                render={({ field }) => (
                  <TextField {...field} id={field.name} label="Email"
                    error={!!errors.participantsList?.[idx]?.email}
                    helperText={errors.participantsList?.[idx]?.email?.message}/>
                )}
              />

              <Controller name={`participantsList.${idx}.birthday`} control={control}
                render={({ field }) => (
                  <TextField {...field} id={field.name} select label="Cumple">
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
