'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
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

export default function NuevoLotePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
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

  // Calcular costos automáticamente
  const costoTotal = formData.costoCana + formData.costoManoObra + 
                     formData.costoEnergia + formData.costoEmpaques + 
                     formData.costoTransporte

  const precioSugerido = costoTotal * (1 + formData.margenUtilidad / 100)
  const costoPorKg = formData.cantidad > 0 ? costoTotal / formData.cantidad : 0
  const precioVentaKg = formData.cantidad > 0 ? precioSugerido / formData.cantidad : 0

  useEffect(() => {
    // Obtener configuración del margen por defecto
    fetch('/api/configuracion/MARGEN_UTILIDAD_DEFAULT')
      .then(res => res.json())
      .then(data => {
        if (data.valor) {
          const margen = parseFloat(data.valor)
          setMargenDefault(margen)
          setFormData(prev => ({ ...prev, margenUtilidad: margen }))
        }
      })
      .catch(console.error)
  }, [])

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

    if (costoTotal <= 0) {
      toast({
        title: 'Error de validación',
        description: 'Debe especificar al menos un costo',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const loteData = {
        ...formData,
        costoTotal,
        precioSugerido,
        // Generar código único para el lote
        codigo: `LOTE-${Date.now()}`,
      }

      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loteData),
      })

      if (!response.ok) {
        throw new Error('Error al crear el lote')
      }

      const lote = await response.json()

      toast({
        title: 'Éxito',
        description: `Lote ${lote.codigo} creado correctamente`,
      })

      router.push('/lotes')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el lote',
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
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Lote de Panela</h1>
          <p className="text-gray-600">Registra un nuevo lote de producción</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Lote</CardTitle>
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
                      min="0"
                      value={formData.cantidad}
                      onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaProduccion">Fecha de Producción</Label>
                    <Input
                      id="fechaProduccion"
                      type="date"
                      value={formData.fechaProduccion}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaProduccion: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Costos de Producción</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="costoCana">Costo Caña ($)</Label>
                      <Input
                        id="costoCana"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costoCana}
                        onChange={(e) => setFormData(prev => ({ ...prev, costoCana: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costoManoObra">Mano de Obra ($)</Label>
                      <Input
                        id="costoManoObra"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costoManoObra}
                        onChange={(e) => setFormData(prev => ({ ...prev, costoManoObra: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costoEnergia">Energía ($)</Label>
                      <Input
                        id="costoEnergia"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costoEnergia}
                        onChange={(e) => setFormData(prev => ({ ...prev, costoEnergia: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costoEmpaques">Empaques ($)</Label>
                      <Input
                        id="costoEmpaques"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costoEmpaques}
                        onChange={(e) => setFormData(prev => ({ ...prev, costoEmpaques: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="costoTransporte">Transporte ($)</Label>
                      <Input
                        id="costoTransporte"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costoTransporte}
                        onChange={(e) => setFormData(prev => ({ ...prev, costoTransporte: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margenUtilidad">Margen de Utilidad (%)</Label>
                  <Input
                    id="margenUtilidad"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.margenUtilidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, margenUtilidad: parseFloat(e.target.value) || 0 }))}
                    placeholder="20.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción del lote..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Observaciones adicionales..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Crear Lote'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Cálculos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cálculos Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Costo Total:</span>
                <Badge variant="outline">
                  ${costoTotal.toLocaleString('es-CO')}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Costo por kg:</span>
                <Badge variant="outline">
                  ${costoPorKg.toLocaleString('es-CO')}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Precio Sugerido:</span>
                <Badge variant="default">
                  ${precioSugerido.toLocaleString('es-CO')}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Precio por kg:</span>
                <Badge variant="default">
                  ${precioVentaKg.toLocaleString('es-CO')}
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Los precios incluyen el margen de utilidad</p>
                  <p>• El código del lote se genera automáticamente</p>
                  <p>• Se creará un QR con la trazabilidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}