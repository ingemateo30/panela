'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/app/hooks/use-toast'
import { ArrowLeft, Save, Calculator } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LoteFormData {
  cantidad: number
  fechaProduccion: string
  costoCana: number
  costoManoObra: number
  costoEnergia: number
  costoEmpaques: number
  costoTransporte: number
  margenUtilidad: number
  descripcion: string
  observaciones: string
}

interface Configuracion {
  clave: string
  valor: string
}

export default function NuevoLotePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [margenDefault, setMargenDefault] = useState(20)
  const [formData, setFormData] = useState<LoteFormData>({
    cantidad: 0,
    fechaProduccion: new Date().toISOString().split('T')[0],
    costoCana: 0,
    costoManoObra: 0,
    costoEnergia: 0,
    costoEmpaques: 0,
    costoTransporte: 0,
    margenUtilidad: 20,
    descripcion: '',
    observaciones: ''
  })

  // Cargar configuración por defecto
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/configuracion/MARGEN_UTILIDAD_DEFAULT')
        if (response.ok) {
          const config: Configuracion = await response.json()
          const margin = parseFloat(config.valor) || 20
          setMargenDefault(margin)
          setFormData(prev => ({ ...prev, margenUtilidad: margin }))
        }
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoadingConfig(false)
      }
    }

    fetchConfig()
  }, [])

  // Calcular costos automáticamente
  const costoTotal = formData.costoCana + formData.costoManoObra + 
                     formData.costoEnergia + formData.costoEmpaques + 
                     formData.costoTransporte

  const precioSugerido = costoTotal * (1 + formData.margenUtilidad / 100)
  const costoPorKg = formData.cantidad > 0 ? costoTotal / formData.cantidad : 0
  const precioVentaKg = formData.cantidad > 0 ? precioSugerido / formData.cantidad : 0

  const handleInputChange = (field: keyof LoteFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

    if (costoTotal <= 0) {
      toast({
        title: 'Error de validación',
        description: 'Debe ingresar al menos un costo',
        variant: 'destructive'
      })
      return
    }

    if (formData.margenUtilidad < 0 || formData.margenUtilidad > 1000) {
      toast({
        title: 'Error de validación',
        description: 'El margen de utilidad debe estar entre 0% y 1000%',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const loteData = {
        ...formData,
        costoTotal,
        precioSugerido
      }

      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loteData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el lote')
      }

      const lote = await response.json()

      toast({
        title: 'Éxito',
        description: `Lote creado correctamente con código: ${lote.codigo}`,
      })

      router.push('/lotes')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el lote',
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

  if (loadingConfig) {
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
              {[...Array(8)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Lote de Panela</h1>
          <p className="text-gray-600">
            Registra un nuevo lote de producción con todos sus costos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Datos del Lote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad (kg) *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cantidad || ''}
                    onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaProduccion">Fecha de Producción *</Label>
                  <Input
                    id="fechaProduccion"
                    type="date"
                    value={formData.fechaProduccion}
                    onChange={(e) => handleInputChange('fechaProduccion', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Costos de Producción</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="costoCana">Costo de Caña</Label>
                  <Input
                    id="costoCana"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.costoCana || ''}
                    onChange={(e) => handleInputChange('costoCana', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costoManoObra">Costo de Mano de Obra</Label>
                  <Input
                    id="costoManoObra"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.costoManoObra || ''}
                    onChange={(e) => handleInputChange('costoManoObra', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costoEnergia">Costo de Energía</Label>
                  <Input
                    id="costoEnergia"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.costoEnergia || ''}
                    onChange={(e) => handleInputChange('costoEnergia', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costoEmpaques">Costo de Empaques</Label>
                  <Input
                    id="costoEmpaques"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.costoEmpaques || ''}
                    onChange={(e) => handleInputChange('costoEmpaques', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costoTransporte">Costo de Transporte</Label>
                  <Input
                    id="costoTransporte"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.costoTransporte || ''}
                    onChange={(e) => handleInputChange('costoTransporte', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margenUtilidad">Margen de Utilidad (%)</Label>
                  <Input
                    id="margenUtilidad"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1000"
                    placeholder="20.0"
                    value={formData.margenUtilidad || ''}
                    onChange={(e) => handleInputChange('margenUtilidad', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500">
                    Margen por defecto: {margenDefault}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Información Adicional</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción del lote..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
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
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Cálculos */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cálculos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Costo Total:</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(costoTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Precio Sugerido:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {formatCurrency(precioSugerido)}
                  </span>
                </div>

                {formData.cantidad > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Costo por kg:</span>
                      <span className="font-medium">
                        {formatCurrency(costoPorKg)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Precio venta por kg:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(precioVentaKg)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Ganancia estimada:</span>
                  <Badge variant="default" className="text-sm">
                    {formatCurrency(precioSugerido - costoTotal)}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || costoTotal <= 0 || formData.cantidad <= 0}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando Lote...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Lote
                    </>
                  )}
                </Button>
              </div>

              {(costoTotal <= 0 || formData.cantidad <= 0) && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  {costoTotal <= 0 && (
                    <p>• Ingrese al menos un costo de producción</p>
                  )}
                  {formData.cantidad <= 0 && (
                    <p>• Ingrese la cantidad del lote</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}