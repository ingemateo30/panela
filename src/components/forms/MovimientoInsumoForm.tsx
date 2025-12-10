'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/app/hooks/use-toast'
import { Plus, Minus, Package, AlertTriangle } from 'lucide-react'

interface MovimientoInsumoFormProps {
  insumoId: string
  insumoNombre: string
  stockActual: number
  unidadMedida: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface MovimientoFormData {
  tipo: 'ENTRADA' | 'SALIDA'
  cantidad: number
  motivo: string
}

export function MovimientoInsumoForm({
  insumoId,
  insumoNombre,
  stockActual,
  unidadMedida,
  onSuccess,
  onCancel
}: MovimientoInsumoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MovimientoFormData>({
    tipo: 'ENTRADA',
    cantidad: 0,
    motivo: ''
  })

  const handleInputChange = <K extends keyof MovimientoFormData>(
    field: K,
    value: MovimientoFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nuevoStock = formData.tipo === 'ENTRADA'
    ? stockActual + formData.cantidad
    : stockActual - formData.cantidad

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validaciones
    if (formData.cantidad <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La cantidad debe ser mayor a 0',
        variant: 'destructive'
      })
      return
    }

    if (formData.tipo === 'SALIDA' && formData.cantidad > stockActual) {
      toast({
        title: 'Error de validación',
        description: `No hay suficiente stock disponible. Stock actual: ${stockActual} ${unidadMedida}`,
        variant: 'destructive'
      })
      return
    }

    if (!formData.motivo.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El motivo del movimiento es obligatorio',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/insumos/${insumoId}/movimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: formData.tipo,
          cantidad: formData.cantidad,
          motivo: formData.motivo.trim()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al registrar movimiento')
      }

      const movimiento = await response.json()

      toast({
        title: 'Movimiento registrado',
        description: `${formData.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} de ${formData.cantidad} ${unidadMedida} registrada correctamente`,
      })

      // Resetear formulario
      setFormData({
        tipo: 'ENTRADA',
        cantidad: 0,
        motivo: ''
      })

      // Llamar callback de éxito
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar el movimiento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const motivosComunes = {
    ENTRADA: [
      'Compra',
      'Devolución',
      'Ajuste de inventario',
      'Donación',
      'Producción interna'
    ],
    SALIDA: [
      'Venta',
      'Uso en producción',
      'Merma',
      'Daño',
      'Ajuste de inventario',
      'Donación'
    ]
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Registrar Movimiento
        </CardTitle>
        <p className="text-sm text-gray-600">
          {insumoNombre}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información actual del stock */}
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800 font-medium">Stock actual:</span>
              <span className="text-blue-900 font-semibold">
                {stockActual} {unidadMedida}
              </span>
            </div>
          </div>

          {/* Tipo de movimiento */}
          <div className="space-y-2">
            <Label>Tipo de Movimiento</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.tipo === 'ENTRADA' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => handleInputChange('tipo', 'ENTRADA')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Entrada
              </Button>
              <Button
                type="button"
                variant={formData.tipo === 'SALIDA' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => handleInputChange('tipo', 'SALIDA')}
              >
                <Minus className="h-4 w-4 mr-2" />
                Salida
              </Button>
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad ({unidadMedida})</Label>
            <Input
              id="cantidad"
              type="number"
              min="0"
              step="0.01"
              value={formData.cantidad || ''}
              onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Previsualización nuevo stock */}
          <div className={`p-3 rounded-md ${nuevoStock < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${nuevoStock < 0 ? 'text-red-800' : 'text-green-800'}`}>
                Nuevo stock:
              </span>
              <span className={`font-semibold ${nuevoStock < 0 ? 'text-red-900' : 'text-green-900'}`}>
                {nuevoStock} {unidadMedida}
                {nuevoStock < 0 && (
                  <AlertTriangle className="inline h-4 w-4 ml-1" />
                )}
              </span>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) => handleInputChange('motivo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosComunes[formData.tipo].map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones adicionales */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Detalles adicionales del movimiento..."
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || nuevoStock < 0}
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
