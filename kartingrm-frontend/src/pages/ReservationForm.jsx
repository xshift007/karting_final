// src/pages/ReservationForm.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs from 'dayjs'
import {
  TextField, Button, Stack, Paper, Typography,
  MenuItem, IconButton, Alert, Snackbar, Chip,
  CircularProgress
} from '@mui/material'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import { useNotify } from '../hooks/useNotify'
import { useApiErrorHandler } from '../hooks/useApiErrorHandler'

import reservationService from '../services/reservation.service'
import clientService      from '../services/client.service'
import sessionService     from '../services/session.service'
import tariffSvc          from '../services/tariff.service'
import {
  computePrice, buildTariffMaps,
  addMinutes, ensureSeconds, fmtDate
} from '../helpers'

const RATE_TYPES = ['LAP_10', 'LAP_15', 'LAP_20']

/* ------------ esquema de validación (Zod) ------------ */
const schema = z.object({
  clientId    : z.coerce.number().min(1, 'Selecciona un cliente'),
  sessionDate : z.date().min(dayjs().startOf('day').toDate()),
  startTime   : z.string(),
  endTime     : z.string(),
}).refine(
  d => dayjs(d.endTime, 'HH:mm').isAfter(d.startTime),
  { message: 'Hora fin > inicio', path: ['endTime'] }
)

export default function ReservationForm ({ edit = false }) {

  /* ------------ navegación y utilidades ------------ */
  const navigate      = useNavigate()
  const location      = useLocation()
  const { id }        = useParams()
  const queryClient   = useQueryClient()
  const notify        = useNotify()
  const handleError   = useApiErrorHandler()

  /* ------------ estado auxiliar ------------ */
  const [clients,  setClients]  = useState([])
  const [tariffs,  setTariffs ] = useState([])
  const [preview,  setPreview ] = useState(null)   // info /preview
  const [minutes,  setMinutes ] = useState(0)      // duración calculada

  /* ------------ react-hook-form ------------ */
  const {
    control, setValue, handleSubmit, watch, trigger,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver : zodResolver(schema),
    mode     : 'onChange',
    defaultValues : {
      clientId        : '',
      sessionDate     : dayjs().toDate(),
      startTime       : '',
      endTime         : '',
      participantsList: [{ fullName:'', email:'', birthday:false }],
      rateType        : 'LAP_10'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participantsList'
  })

  const [toast, setToast] = useState({
    open:false, msg:'', severity:'success'
  })

  /* ------------ watchers ------------ */
  const sessionDate = watch('sessionDate')
  const startTime   = watch('startTime')
  const rateType    = watch('rateType')

  /* ========================================================
   * 1.   Cargar combos / datos iniciales
   * ====================================================== */
  /* -- clientes -- */
  useEffect(() => {
    const ctrl = new AbortController()
    clientService.getAll({ signal: ctrl.signal })
      .then(r => setClients(r.data))
      .catch(e => { if (!ctrl.signal.aborted) console.error(e) })
    return () => ctrl.abort()
  }, [])

  /* -- tarifas -- */
  useEffect(() => {
    tariffSvc.list()
      .then(setTariffs)
      .catch(console.error)
  }, [])

  /* -- modo edición -- */
  useEffect(() => {
    if (!edit || !id) return
    reservationService.get(id).then(res => {
      const { client, session, participantsList, rateType } = res.data
      setValue('clientId', client.id)
      setValue('sessionDate', dayjs(session.sessionDate).toDate())
      setValue('startTime', session.startTime)
      setValue('endTime',   session.endTime)
      setValue('rateType',  rateType)
      setValue('participantsList', participantsList)
    })
  }, [edit, id, setValue])

  /* -- pre-relleno a partir de la query (?d,?s,?e) -- */
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    p.get('d') && setValue('sessionDate', dayjs(p.get('d')).toDate())
    p.get('s') && setValue('startTime',  p.get('s'))
    p.get('e') && setValue('endTime',    p.get('e'))
  }, [location.search, setValue])

  /* ========================================================
   * 2.   Preview tarifa / minutos (backend)
   *      sólo cuando cambian fecha o rateType
   * ====================================================== */
  useEffect(() => {
    if (!sessionDate || !rateType) return
    tariffSvc.preview(fmtDate(sessionDate), rateType)
      .then(p => {
        setPreview(p)
        setMinutes(p.minutes)          // dur. para efecto #3
      })
      .catch(handleError)
  }, [sessionDate, rateType, handleError])

  /* ========================================================
   * 3.   Ajustar hora fin
   *      • se dispara SÓLO si cambia startTime o minutes
   *      • evita bucle infinito: no llama setValue si no cambia
   * ====================================================== */
  useEffect(() => {
    if (!startTime || !minutes) return
    const newEnd = addMinutes(startTime, minutes)
    setValue('endTime', prev => prev === newEnd ? prev : newEnd)
  }, [startTime, minutes, setValue])

  /* -- si cambia la fecha re-valida startTime contra las reglas del día -- */
  useEffect(() => { if (startTime) trigger('startTime') },
            [sessionDate, startTime, trigger])

  /* ========================================================
   * 4.   Mapas utilitarios
   * ====================================================== */
  const { priceMap } = useMemo(() => buildTariffMaps(tariffs), [tariffs])

  /* ========================================================
   * 5.   Resumen de precio en cliente
   * ====================================================== */
  const summary = useMemo(() => {
    const birthdayCount = fields.filter(f => f.birthday).length
    return computePrice({
      rateType,
      participants : fields.length,
      birthdayCount,
      prices       : priceMap
    })
  }, [rateType, fields, priceMap])

  /* ========================================================
   * 6.   Envío
   * ====================================================== */
  const onSubmit = async data => {
    try {
      /* -- validar aforo en vivo -- */
      const { sessionDate, startTime, endTime, participantsList } = data
      const { data: week } =
        await sessionService.weekly(fmtDate(sessionDate), fmtDate(sessionDate))
      const slot = Object.values(week).flat()
                   .find(s => s.startTime === startTime && s.endTime === endTime)
      if (slot &&
          slot.participantsCount + participantsList.length > slot.capacity) {
        notify('La sesión ya está completa ❌', 'error')
        return
      }

      /* -- construir payload -- */
      const payload = {
        ...data,
        sessionDate : fmtDate(sessionDate),
        startTime   : ensureSeconds(startTime),
        endTime     : ensureSeconds(endTime || addMinutes(startTime, minutes)),
        specialDay  : preview?.specialDay,
      }

      const res = edit
        ? await reservationService.update(id, payload)
        : await reservationService.create(payload)

      notify(`Reserva ${edit ? 'actualizada' : 'creada'} ✅`, 'success')
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      window.dispatchEvent(new CustomEvent('availabilityUpdated'))
      navigate(`/payments/${res.id}`, { replace: true })
    } catch (e) { handleError(e) }
  }

  /* ========================================================
   * 7.   Restricciones de horario
   * ====================================================== */
  const minStart = useMemo(() => {
    const day = dayjs(sessionDate).day()
    const isWeekendOrHoliday = day === 0 || day === 6
    return isWeekendOrHoliday ? '10:00' : '14:00'
  }, [sessionDate])
  const maxEnd = '22:00'

  /* ========================================================
   * 8.   Render
   * ====================================================== */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p:3, maxWidth:600, mx:'auto' }}>
        <Typography variant="h5" gutterBottom>
          {edit ? 'Editar reserva' : 'Crear reserva'}
        </Typography>

        <Alert severity="info" sx={{ mb:2 }}>
          Horario de Atención:
          <strong> L-V 14:00–22:00</strong> |{' '}
          <strong>Sáb, Dom y Feriados 10:00–22:00</strong>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>

            {/* ---------- Cliente ---------- */}
            <Controller
              name="clientId" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Cliente"
                  error={!!errors.clientId}
                  helperText={errors.clientId?.message}>
                  {clients.map(c =>
                    <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
                </TextField>
              )}
            />

            {/* ---------- Fecha ---------- */}
            <Controller
              name="sessionDate" control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Fecha"
                  inputFormat="YYYY-MM-DD"
                  value={dayjs(field.value)}
                  onChange={val => field.onChange(val ? val.toDate() : null)}
                  minDate={dayjs()}
                  renderInput={params =>
                    <TextField {...params}
                               error={!!errors.sessionDate}
                               helperText={errors.sessionDate?.message}/>}
                />
              )}
            />

            {/* ---------- Hora inicio ---------- */}
            <Controller
              name="startTime" control={control}
              render={({ field }) => (
                <TimePicker
                  label="Hora inicio"
                  minTime={dayjs(minStart, 'HH:mm')}
                  maxTime={dayjs(maxEnd,   'HH:mm')}
                  value={field.value ? dayjs(field.value, 'HH:mm') : null}
                  onChange={val => {
                    const t = val ? val.format('HH:mm') : ''
                    field.onChange(t)
                  }}
                  renderInput={params =>
                    <TextField {...params}
                               error={!!errors.startTime}
                               helperText={errors.startTime?.message}/>}
                />
              )}
            />

            {/* ---------- Tipo de tarifa ---------- */}
            <Controller
              name="rateType" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Tipo de reserva"
                  error={!!errors.rateType}
                  helperText={errors.rateType?.message}>
                  {RATE_TYPES.map(r =>
                    <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              )}
            />

            {/* ---------- Info preview ---------- */}
            <Stack direction="row" spacing={2}>
              <TextField label="Precio"   value={preview?.price   ?? ''} disabled />
              <TextField label="Minutos"  value={preview?.minutes ?? ''} disabled />
              {preview?.specialDay && preview.specialDay !== 'REGULAR' &&
                <Chip color="warning" label={preview.specialDay} />}
            </Stack>

            {/* ---------- Hora fin (sólo lectura) ---------- */}
            <Controller
              name="endTime" control={control}
              render={({ field }) => (
                <TimePicker
                  label="Hora fin"
                  minTime={dayjs(minStart, 'HH:mm')}
                  maxTime={dayjs(maxEnd,   'HH:mm')}
                  value={field.value ? dayjs(field.value, 'HH:mm') : null}
                  readOnly disabled
                  renderInput={params =>
                    <TextField {...params}
                               error={!!errors.endTime}
                               helperText={errors.endTime?.message}/>}
                />
              )}
            />

            {/* ---------- Participantes ---------- */}
            <Typography variant="h6">Participantes</Typography>

            {fields.map((item, idx) => (
              <Stack key={item.id} direction="row" spacing={1} alignItems="center">
                <Controller
                  name={`participantsList.${idx}.fullName`} control={control}
                  render={({ field }) =>
                    <TextField {...field} label="Nombre"
                      error={!!errors.participantsList?.[idx]?.fullName}
                      helperText={errors.participantsList?.[idx]?.fullName?.message}/>}
                />

                <Controller
                  name={`participantsList.${idx}.email`} control={control}
                  render={({ field }) =>
                    <TextField {...field} label="Email"
                      error={!!errors.participantsList?.[idx]?.email}
                      helperText={errors.participantsList?.[idx]?.email?.message}/>}
                />

                <Controller
                  name={`participantsList.${idx}.birthday`} control={control}
                  render={({ field }) =>
                    <TextField {...field} select label="Cumple">
                      <MenuItem value={false}>No</MenuItem>
                      <MenuItem value={true}>Sí</MenuItem>
                    </TextField>}
                />

                <IconButton onClick={() => remove(idx)}
                            disabled={fields.length === 1}>
                  <RemoveCircle />
                </IconButton>
              </Stack>
            ))}

            <Button
              type="button"
              startIcon={<AddCircle />}
              onClick={() => append({ fullName:'', email:'', birthday:false })}
              disabled={fields.length >= 15}>
              Agregar participante
            </Button>

            {/* ---------- Resumen ---------- */}
            <Paper variant="outlined" sx={{ p:2 }}>
              <Typography variant="subtitle1">Resumen</Typography>
              <Typography>Participantes: {fields.length}</Typography>
              <Typography>Tarifa base: ${summary.base}</Typography>
              <Typography>Descuento: {summary.totalDisc}%</Typography>
              <Typography variant="h6">Total estimado: ${summary.final}</Typography>
            </Paper>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting && <CircularProgress size={20} sx={{ mr:1 }} />}
                Guardar
              </Button>
            </Stack>
          </Stack>
        </form>

        <Snackbar open={toast.open} autoHideDuration={4000}
                  onClose={() => setToast(v => ({ ...v, open:false }))}>
          <Alert severity={toast.severity}>{toast.msg}</Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  )
}
