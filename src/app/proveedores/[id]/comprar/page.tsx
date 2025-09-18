'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/app/hooks/use-toast'
import { ArrowLeft, Save, Calculator, ShoppingCart } from 'lucide-react'

interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
}

interface CompraFormData {
  cantidad: number
  precioUnitario: number
  observaciones: string
}

export default function ComprarPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState<CompraFormData>({
    cantidad: 0,
    precioUnitario: 0,
    observaciones: ''
  })

  const total = formData.cantidad * formData.precioUnitario

  useEffect(() => {
    // Cargar datos del proveedor
    fetch(`/api/proveedores/${params.id}`)
      .then(res => res.json())
      .then(data => setProveedor(data))
      .catch(console.error)
  }, [params.id])

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
      const compraData = {
        proveedorId: params.id,
        cantidad: formData.cantidad,
        precioUnitario: formData.precioUnitario,
        total,
        observaciones: formData.observaciones
      }

      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compraData),
      })

      if (!response.ok) {
        throw new Error('Error al registrar la compra')
      }

      toast({
        title: 'Éxito',
        description: 'Compra registrada correctamente',
      })

      router.push(`/proveedores/${params.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar la compra',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!proveedor) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Compra</h1>
          <p className="text-gray-600">Registra una compra a {proveedor.nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Detalles de la Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad (kg) *</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioUnitario">Precio por kg ($) *</Label>
                    <Input
                      id="precioUnitario"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData(prev => ({ ...prev, precioUnitario: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Comentarios sobre la compra..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Registrando...' : 'Registrar Compra'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Información */}
        <div className="space-y-6">
          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle>Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">{proveedor.nombre}</p>
                <p className="text-sm text-gray-600">{proveedor.contacto}</p>
              </div>
              {proveedor.telefono && (
                <div className="text-sm">
                  <span className="text-gray-600">Tel: </span>
                  {proveedor.telefono}
                </div>
              )}
              {proveedor.email && (
                <div className="text-sm">
                  <span className="text-gray-600">Email: </span>
                  {proveedor.email}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cálculos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <Badge variant="outline">
                  {formData.cantidad} kg
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Precio por kg:</span>
                <Badge variant="outline">
                  ${formData.precioUnitario.toLocaleString('es-CO')}
                </Badge>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total:</span>
                <Badge variant="default" className="text-lg">
                  ${total.toLocaleString('es-CO')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
