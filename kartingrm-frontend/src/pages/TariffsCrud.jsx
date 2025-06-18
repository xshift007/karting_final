// src/pages/TariffsCrud.jsx
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Paper, Button } from '@mui/material'
import tariffSvc from '../services/tariff.service'

export default function TariffsCrud(){
  const [rows,setRows]=useState([])

  useEffect(()=>{ tariffSvc.list().then(setRows) },[])

  const processRowUpdate = async (newRow) => {
    await tariffSvc.update(newRow.rate, newRow)
    return newRow
  }

  return (
    <Paper sx={{p:2}}>
      <DataGrid
        rows={rows}
        columns={[
          {field:'rate',     headerName:'Tarifa',   width:130, editable:false},
          {field:'price',    headerName:'Precio',   width:130, editable:true, type:'number'},
          {field:'minutes',  headerName:'Minutos',  width:130, editable:true, type:'number'}
        ]}
        getRowId={r=>r.rate}
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
        autoHeight
      />
      <Button sx={{mt:2}} onClick={()=>tariffSvc.list().then(setRows)}>
        Recargar
      </Button>
    </Paper>
  )
}
