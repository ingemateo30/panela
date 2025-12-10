'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/app/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

interface CompraFormProps {
  proveedorId: string
  onSuccess?: () => void
}

export function CompraForm({ proveedorId, onSuccess }: CompraFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cantidad: 0,
    precioUnitario: 0,
    observaciones: ''
  })

  const total = formData.cantidad * formData.precioUnitario

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

    if (formData.precioUnitario <= 0) {
      toast({
        title: 'Error de validación',
        description: 'El precio unitario debe ser mayor a 0',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedorId,
          cantidad: formData.cantidad,
          precioUnitario: formData.precioUnitario,
          total,
          observaciones: formData.observaciones
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al registrar compra')
      }

      toast({
        title: 'Éxito',
        description: 'Compra registrada correctamente',
      })

      // Resetear formulario
      setFormData({
        cantidad: 0,
        precioUnitario: 0,
        observaciones: ''
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar la compra',
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
          <Label htmlFor="cantidad">Cantidad (kg) *</Label>
          <Input
            id="cantidad"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.cantidad || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="precioUnitario">Precio por kg *</Label>
          <Input
            id="precioUnitario"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.precioUnitario || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, precioUnitario: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {total > 0 && (
        <div className="bg-panela-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total de la compra:</span>
            <span className="text-2xl font-bold text-panela-700">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
          placeholder="Notas adicionales sobre la compra..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading || formData.cantidad <= 0 || formData.precioUnitario <= 0} className="w-full">
        {loading ? 'Registrando...' : 'Registrar Compra'}
      </Button>
    </form>
  )
}
