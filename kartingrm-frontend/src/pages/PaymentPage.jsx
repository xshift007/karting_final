import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Stack, CircularProgress } from '@mui/material'
import paymentService from '../services/payment.service'
import { useNotify } from '../hooks/useNotify'
import { useApiErrorHandler } from '../hooks/useApiErrorHandler'

export default function PaymentPage() {
  const { reservationId } = useParams()
  const [paid, setPaid]   = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate          = useNavigate()
  const notify            = useNotify()
  const handleError       = useApiErrorHandler()

  const handlePay = async () => {
    setLoading(true)
    try {
      const { data:{ id } } = await paymentService.pay({ reservationId, method:'cash' })
      const pdf = await paymentService.receipt(id)
      const blob = new Blob([pdf.data],{ type:'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const win  = window.open(url,'_blank','noopener')
      if(!win) notify('Activa las ventanas emergentes para ver el comprobante','warning')
      setTimeout(()=>window.URL.revokeObjectURL(url),10000)
      setPaid(true)
      notify('Pago realizado ✅','success')
    } catch (e) {
      handleError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{p:3, maxWidth:500, mx:'auto'}}>
      <Typography variant="h5" gutterBottom>
        Pago reserva #{reservationId}
      </Typography>
      <Stack spacing={2}>
        <Button variant="contained" onClick={handlePay} disabled={loading || paid}>
          {loading && <CircularProgress size={20} sx={{ mr:1 }} />}
          {paid ? 'Pagado' : 'Pagar ahora'}
        </Button>
        <Button onClick={()=>navigate('/reservations')}>
          Volver a reservas
        </Button>
      </Stack>
    </Paper>
  )
}
