// src/components/ErrorBoundary.jsx
import React from 'react'
import { Container, Typography, Button } from '@mui/material'
import { NotifyContext } from '../hooks/useNotify'

export class ErrorBoundary extends React.Component {
  static contextType = NotifyContext
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Error capturado por ErrorBoundary:', error, info)
  }

  componentDidMount() {
    window.addEventListener('httpError', this.handleHttpError)
  }
  componentWillUnmount() {
    window.removeEventListener('httpError', this.handleHttpError)
  }

  handleHttpError = (e) => {
    const notify = this.context
    notify(e.detail,'error')
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            ¡Uy! Algo salió mal.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Recargar
          </Button>
        </Container>
      )
    }

    return this.props.children
  }
}
