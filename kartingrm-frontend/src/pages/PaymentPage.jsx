import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Stack } from '@mui/material'
import paymentService from '../services/payment.service'
import { useNotify } from '../hooks/useNotify'

export default function PaymentPage() {
  const { reservationId } = useParams()
  const [paid, setPaid]   = useState(false)
  const navigate          = useNavigate()
  const notify            = useNotify()

  const handlePay = () => {
    paymentService.pay({ reservationId, method:'cash' })
      .then(res => {
        setPaid(true);
        const paymentId = res.data.id;
        return paymentService.receipt(paymentId);
      })
      .then(response => {
        const blob = new Blob([response.data], { type:'application/pdf' })
        const url  = window.URL.createObjectURL(blob)
        window.open(url,'_blank')
        URL.revokeObjectURL(url)
      })
      .catch(e => notify(e.response?.data?.message||e.message,'error'))
  }

  return (
    <Paper sx={{p:3, maxWidth:500, mx:'auto'}}>
      <Typography variant="h5" gutterBottom>
        Pago reserva #{reservationId}
      </Typography>
      <Stack spacing={2}>
        <Button variant="contained" onClick={handlePay} disabled={paid}>
          {paid ? 'Pagado' : 'Pagar ahora'}
        </Button>
        <Button onClick={()=>navigate('/reservations')}>
          Volver a reservas
        </Button>
      </Stack>
    </Paper>
  )
}
