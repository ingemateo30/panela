'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Minus } from 'lucide-react'

interface MovimientoInsumoFormProps {
  insumoId: string
  stockActual: number
  onSuccess?: () => void
}

export function MovimientoInsumoForm({ insumoId, stockActual, onSuccess }: MovimientoInsumoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'ENTRADA' as 'ENTRADA' | 'SALIDA',
    cantidad: 0,
    motivo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        description: 'No hay suficiente stock disponible',
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
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al registrar movimiento')
      }

      toast({
        title: 'Éxito',
        description: `${formData.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada correctamente`,
      })

      // Resetear formulario
      setFormData({
        tipo: 'ENTRADA',
        cantidad: 0,
        motivo: ''
      })

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Movimiento</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: 'ENTRADA' | 'SALIDA') => setFormData(prev => ({ ...prev, tipo: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRADA">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2 text-green-500" />
                  Entrada
                </div>
              </SelectItem>
              <SelectItem value="SALIDA">
                <div className="flex items-center">
                  <Minus className="h-4 w-4 mr-2 text-red-500" />
                  Salida
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            type="number"
            min="1"
            max={formData.tipo === 'SALIDA' ? stockActual : undefined}
            value={formData.cantidad}
            onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            required
          />
          <p className="text-xs text-gray-500">
            Stock actual: {stockActual}
            {formData.tipo === 'SALIDA' && ` (máximo: ${stockActual})`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo (opcional)</Label>
        <Textarea
          id="motivo"
          value={formData.motivo}
          onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
          placeholder="Descripción del motivo del movimiento..."
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading || formData.cantidad <= 0} className="w-full">
        {loading ? 'Registrando...' : `Registrar ${formData.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}`}
      </Button>
    </form>
  )
}