import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Stack, CircularProgress } from '@mui/material'
import paymentService from '../services/payment.service'
import { useNotify } from '../hooks/useNotify'

export default function PaymentPage() {
  const { reservationId } = useParams()
  const [paid, setPaid]   = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate          = useNavigate()
  const notify            = useNotify()

  const handlePay = async () => {
    try {
      setLoading(true)
      const { data:{ id } } = await paymentService.pay({
        reservationId,
        method:'cash'
      })
      setPaid(true)
      const { data } = await paymentService.receipt(id)
      const url = window.URL.createObjectURL(
        new Blob([data], { type:'application/pdf' })
      )
      window.open(url,'_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 4000)
      notify('Pago realizado ✅','success')
    } catch (e) {
      notify(e.response?.data?.message || e.message, 'error')
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
