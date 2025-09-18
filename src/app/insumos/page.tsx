import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExportButton } from '@/components/ui/export-button'
import { MovimientoInsumoForm } from '@/components/forms/MovimientoInsumoForm'
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface SearchParams {
  page?: string
  search?: string
  activo?: string
  lowStock?: string
}

async function getInsumos(searchParams: SearchParams) {
  const params = new URLSearchParams()
  
  if (searchParams.page) params.append('page', searchParams.page)
  if (searchParams.search) params.append('search', searchParams.search)
  if (searchParams.activo) params.append('activo', searchParams.activo)
  if (searchParams.lowStock) params.append('lowStock', searchParams.lowStock)

  // En un entorno real, esto sería una llamada a la API
  // Por ahora retornamos datos de ejemplo
  return {
    insumos: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
  }
}

function InsumoCard({ insumo }: { insumo: any}) {
  const stockBajo = insumo.stockActual <= insumo.stockMinimo
  const stockCritico = insumo.stockActual <= insumo.stockMinimo * 0.5

  return (
    <Card className={`${stockCritico ? 'border-red-200 bg-red-50' : stockBajo ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{insumo.nombre}</CardTitle>
            <p className="text-sm text-gray-600">{insumo.descripcion}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={insumo.activo ? "default" : "secondary"}>
              {insumo.activo ? "Activo" : "Inactivo"}
            </Badge>
            {stockCritico && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Crítico
              </Badge>
            )}
            {stockBajo && !stockCritico && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Bajo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Stock Actual</p>
            <p className="text-lg font-semibold">
              {insumo.stockActual} {insumo.unidadMedida}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stock Mínimo</p>
            <p className="text-lg font-semibold">
              {insumo.stockMinimo} {insumo.unidadMedida}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Costo Unitario</p>
            <p className="text-lg font-semibold">
              ${insumo.costoUnitario.toLocaleString('es-CO')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-lg font-semibold">
              ${(insumo.stockActual * insumo.costoUnitario).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <TrendingUp className="h-4 w-4 mr-1" />
                Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento - {insumo.nombre}</DialogTitle>
              </DialogHeader>
              <MovimientoInsumoForm
                insumoId={insumo.id}
                stockActual={insumo.stockActual}
                onSuccess={() => window.location.reload()}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <TrendingDown className="h-4 w-4 mr-1" />
                Salida
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento - {insumo.nombre}</DialogTitle>
              </DialogHeader>
              <MovimientoInsumoForm
                insumoId={insumo.id}
                stockActual={insumo.stockActual}
                onSuccess={() => window.location.reload()}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
