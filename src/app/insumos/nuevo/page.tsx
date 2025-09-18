'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'

interface InsumoFormData {
  nombre: string
  descripcion: string
  unidadMedida: string
  stockMinimo: number
  stockActual: number
  costoUnitario: number
  activo: boolean
}

const unidadesMedida = [
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'g', label: 'Gramos' },
  { value: 'l', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'm', label: 'Metros' },
  { value: 'm2', label: 'Metros cuadrados' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'paquetes', label: 'Paquetes' },
]

export default function NuevoInsumoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InsumoFormData>({
    nombre: '',
    descripcion: '',
    unidadMedida: 'unidades',
    stockMinimo: 0,
    stockActual: 0,
    costoUnitario: 0,
    activo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del insumo es obligatorio',
        variant: 'destructive'
      })
      return
    }

    if (formData.stockActual < 0 || formData.stockMinimo < 0) {
      toast({
        title: 'Error de validación',
        description: 'Las cantidades no pueden ser negativas',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/insumos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el insumo')
      }

      toast({
        title: 'Éxito',
        description: 'Insumo creado correctamente',
      })

      router.push('/insumos')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el insumo',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Insumo</h1>
          <p className="text-gray-600">Registra un nuevo insumo en el inventario</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Insumo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Insumo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Bolsas de 500g"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                <Select
                  value={formData.unidadMedida}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unidadMedida: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidad) => (
                      <SelectItem key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockActual">Stock Actual</Label>
                <Input
                  id="stockActual"
                  type="number"
                  min="0"
                  value={formData.stockActual}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockActual: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="costoUnitario">Costo Unitario ($)</Label>
                <Input
                  id="costoUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costoUnitario}
                  onChange={(e) => setFormData(prev => ({ ...prev, costoUnitario: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción detallada del insumo..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="activo">Insumo Activo</Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Insumo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}