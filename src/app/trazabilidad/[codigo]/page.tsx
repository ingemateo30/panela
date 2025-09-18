import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QRGenerator } from '@/components/qr/QRGenerator'
import { Package, Calendar, User, DollarSign, Truck, Factory, Zap, Tag } from 'lucide-react'

interface Lote {
  id: string
  codigo: string
  cantidad: number
  fechaProduccion: string
  costoCana: number
  costoManoObra: number
  costoEnergia: number
  costoEmpaques: number
  costoTransporte: number
  costoTotal: number
  precioSugerido: number
  estado: string
  descripcion: string
  observaciones: string
  usuario: {
    name: string
    email: string
  }
  ventas: Array<{
    id: string
    cantidad: number
    total: number
    cliente: string
    fecha: string
  }>
}

async function getLoteByCode(codigo: string): Promise<Lote | null> {
  // En un entorno real, esto sería una llamada a la API
  // Para efectos de demostración, retornamos null
  return null
}

export default async function TrazabilidadPage({ 
  params 
}: { 
  params: { codigo: string } 
}) {
  const lote = await getLoteByCode(params.codigo)

  if (!lote) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lote no encontrado
          </h1>
          <p className="text-gray-600">
            No se encontró información para el código: {params.codigo}
          </p>
        </div>
      </div>
    )
  }

  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/trazabilidad/${lote.codigo}`
  const cantidadVendida = lote.ventas.reduce((sum, venta) => sum + venta.cantidad, 0)
  const cantidadDisponible = lote.cantidad - cantidadVendida

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trazabilidad del Lote
        </h1>
        <p className="text-gray-600">
          Información completa del lote {lote.codigo}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Código QR</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRGenerator value={qrValue} size={200} />
            </CardContent>
          </Card>
        </div>

        {/* Información Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Información del Lote</CardTitle>
                <Badge 
                  variant={lote.estado === 'DISPONIBLE' ? 'default' : 
                          lote.estado === 'VENDIDO' ? 'destructive' : 'secondary'}
                >
                  {lote.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Cantidad Total</p>
                      <p className="text-gray-600">{lote.cantidad} kg</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Fecha de Producción</p>
                      <p className="text-gray-600">
                        {new Date(lote.fechaProduccion).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Registrado por</p>
                      <p className="text-gray-600">{lote.usuario.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Costo Total</p>
                      <p className="text-gray-600">
                        ${lote.costoTotal.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Precio Sugerido</p>
                      <p className="text-gray-600">
                        ${lote.precioSugerido.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold">Disponible</p>
                      <p className="text-gray-600">{cantidadDisponible} kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {lote.descripcion && (
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-600">{lote.descripcion}</p>
                </div>
              )}

              {lote.observaciones && (
                <div>
                  <h3 className="font-semibold mb-2">Observaciones</h3>
                  <p className="text-gray-600">{lote.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desglose de Costos */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Costos de Producción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <Factory className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Caña</p>
              <p className="font-semibold">
                ${lote.costoCana.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="text-center">
              <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Mano de Obra</p>
              <p className="font-semibold">
                ${lote.costoManoObra.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="text-center">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Energía</p>
              <p className="font-semibold">
                ${lote.costoEnergia.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="text-center">
              <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Empaques</p>
              <p className="font-semibold">
                ${lote.costoEmpaques.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="text-center">
              <Truck className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Transporte</p>
              <p className="font-semibold">
                ${lote.costoTransporte.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Ventas */}
      {lote.ventas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-right p-2">Cantidad (kg)</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lote.ventas.map((venta) => (
                    <tr key={venta.id} className="border-b">
                      <td className="p-2">
                        {new Date(venta.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="p-2">{venta.cliente || 'N/A'}</td>
                      <td className="text-right p-2">{venta.cantidad}</td>
                      <td className="text-right p-2">
                        ${venta.total.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
