import { Dialog, DialogTitle, DialogActions, Button } from '@mui/material'

export default function ConfirmDialog({open,onClose,onConfirm,msg}){
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{msg}</DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>No</Button>
        <Button color="error" onClick={onConfirm}>Sí</Button>
      </DialogActions>
    </Dialog>
  )
}
