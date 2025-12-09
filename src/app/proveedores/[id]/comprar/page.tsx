'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Calculator, ShoppingCart, User, Phone, Mail } from 'lucide-react'

interface Proveedor {
  id: string
  nombre: string
  contacto: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: boolean
}

interface CompraFormData {
  cantidad: number
  precioUnitario: number
  observaciones: string
}

interface RouteParams {
  id: string
}

export default function ComprarPage() {
  const router = useRouter()
  const params = useParams<RouteParams>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingProveedor, setLoadingProveedor] = useState(true)
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState<CompraFormData>({
    cantidad: 0,
    precioUnitario: 0,
    observaciones: ''
  })

  const total = formData.cantidad * formData.precioUnitario

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        setLoadingProveedor(true)
        const response = await fetch(`/api/proveedores/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Proveedor no encontrado')
        }

        const data: Proveedor = await response.json()
        setProveedor(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del proveedor',
          variant: 'destructive'
        })
        router.push('/proveedores')
      } finally {
        setLoadingProveedor(false)
      }
    }

    if (params.id) {
      fetchProveedor()
    }
  }, [params.id, router, toast])

  const handleInputChange = (field: keyof CompraFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        total: total,
        observaciones: formData.observaciones || null
      }

      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compraData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al registrar la compra')
      }

      const compra = await response.json()

      toast({
        title: 'Compra registrada',
        description: `Compra de ${formData.cantidad} kg por ${formatCurrency(total)} registrada exitosamente`,
      })

      router.push(`/proveedores/${params.id}`)
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loadingProveedor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proveedor no encontrado</h1>
            <p className="text-gray-600">El proveedor solicitado no existe</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Compra</h1>
          <p className="text-gray-600">
            Registra una nueva compra de panela a {proveedor.nombre}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Información del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{proveedor.nombre}</h3>
                <Badge variant={proveedor.activo ? "default" : "secondary"}>
                  {proveedor.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {proveedor.contacto && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{proveedor.contacto}</span>
                </div>
              )}

              {proveedor.telefono && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{proveedor.telefono}</span>
                </div>
              )}

              {proveedor.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{proveedor.email}</span>
                </div>
              )}

              {proveedor.direccion && (
                <div className="text-sm text-gray-600">
                  <strong>Dirección:</strong> {proveedor.direccion}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulario de Compra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Datos de la Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad (kg) *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.cantidad || ''}
                  onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
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
                  placeholder="0.00"
                  value={formData.precioUnitario || ''}
                  onChange={(e) => handleInputChange('precioUnitario', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total a pagar:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || formData.cantidad <= 0 || formData.precioUnitario <= 0}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registrando Compra...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Compra
                    </>
                  )}
                </Button>

                {(formData.cantidad <= 0 || formData.precioUnitario <= 0) && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md mt-3">
                    {formData.cantidad <= 0 && (
                      <p>• Ingrese la cantidad a comprar</p>
                    )}
                    {formData.precioUnitario <= 0 && (
                      <p>• Ingrese el precio por kilogramo</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}