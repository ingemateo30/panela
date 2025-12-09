'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

interface ProveedorFormProps {
  proveedor?: any
  onSuccess?: () => void
}

export function ProveedorForm({ proveedor, onSuccess }: ProveedorFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: proveedor?.nombre || '',
    contacto: proveedor?.contacto || '',
    telefono: proveedor?.telefono || '',
    email: proveedor?.email || '',
    direccion: proveedor?.direccion || '',
    activo: proveedor?.activo ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre del proveedor es obligatorio',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const url = proveedor ? `/api/proveedores/${proveedor.id}` : '/api/proveedores'
      const method = proveedor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar proveedor')
      }

      toast({
        title: 'Éxito',
        description: `Proveedor ${proveedor ? 'actualizado' : 'creado'} correctamente`,
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar el proveedor',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Proveedor *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Ej: Distribuidora La Caña"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contacto">Persona de Contacto</Label>
        <Input
          id="contacto"
          value={formData.contacto}
          onChange={(e) => setFormData(prev => ({ ...prev, contacto: e.target.value }))}
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
            placeholder="Ej: 3001234567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Ej: contacto@proveedor.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Textarea
          id="direccion"
          value={formData.direccion}
          onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
          placeholder="Dirección completa del proveedor..."
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="activo"
          checked={formData.activo}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
        />
        <Label htmlFor="activo" className="cursor-pointer">
          Proveedor activo
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando...' : proveedor ? 'Actualizar Proveedor' : 'Crear Proveedor'}
      </Button>
    </form>
  )
}
