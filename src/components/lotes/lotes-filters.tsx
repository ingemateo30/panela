'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'

export function LotesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [estado, setEstado] = useState(searchParams.get('estado') || 'todos')
  const [fechaDesde, setFechaDesde] = useState(searchParams.get('fechaDesde') || '')
  const [fechaHasta, setFechaHasta] = useState(searchParams.get('fechaHasta') || '')

  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (estado !== 'todos') params.set('estado', estado)
    if (fechaDesde) params.set('fechaDesde', fechaDesde)
    if (fechaHasta) params.set('fechaHasta', fechaHasta)
    
    router.push(`/lotes?${params.toString()}`)
  }

  const limpiarFiltros = () => {
    setEstado('todos')
    setFechaDesde('')
    setFechaHasta('')
    router.push('/lotes')
  }

  const hayFiltrosActivos = estado !== 'todos' || fechaDesde || fechaHasta

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="DISPONIBLE">Disponible</SelectItem>
            <SelectItem value="PRODUCCION">En Producción</SelectItem>
            <SelectItem value="VENDIDO">Vendido</SelectItem>
            <SelectItem value="CADUCADO">Caducado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fechaDesde">Fecha Desde</Label>
        <Input
          id="fechaDesde"
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fechaHasta">Fecha Hasta</Label>
        <Input
          id="fechaHasta"
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </div>

      <div className="flex items-end space-x-2">
        <Button onClick={aplicarFiltros} className="flex-1">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
        
        {hayFiltrosActivos && (
          <Button variant="outline" onClick={limpiarFiltros}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}