'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ExportButton } from '@/components/ui/export-button'
import { useToast } from '@/app/hooks/use-toast'
import { Plus, Search, Package, AlertTriangle, Edit, Eye } from 'lucide-react'

interface Insumo {
  id: string
  nombre: string
  descripcion: string | null
  unidadMedida: string
  stockMinimo: number
  stockActual: number
  costoUnitario: number
  activo: boolean
  createdAt: string
  updatedAt: string
  movimientos: Array<{
    id: string
    tipo: 'ENTRADA' | 'SALIDA'
    cantidad: number
    fecha: string
    motivo: string | null
  }>
}

interface InsumosResponse {
  insumos: Insumo[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function InsumosPage() {
  const { toast } = useToast()
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

  useEffect(() => {
    fetchInsumos()
  }, [searchTerm, filterLowStock, filterActive])

  const fetchInsumos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterLowStock) params.append('lowStock', 'true')
      if (filterActive !== null) params.append('activo', filterActive.toString())
      
      const response = await fetch(`/api/insumos?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar insumos')
      }

      const data: InsumosResponse = await response.json()
      setInsumos(data.insumos)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los insumos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStockBadge = (insumo: Insumo) => {
    if (insumo.stockActual <= insumo.stockMinimo) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Stock Bajo
      </Badge>
    }
    return <Badge variant="secondary">Stock Normal</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cargando insumos...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Insumos</h1>
          <p className="text-gray-600">
            Controla el inventario de insumos y materiales
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={insumos}
            filename="insumos"
            type="insumos"
          />
          <Button asChild>
            <Link href="/insumos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Insumo
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar insumos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterLowStock ? "default" : "outline"}
                onClick={() => setFilterLowStock(!filterLowStock)}
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stock Bajo
              </Button>
              <Button
                variant={filterActive === true ? "default" : "outline"}
                onClick={() => setFilterActive(filterActive === true ? null : true)}
                size="sm"
              >
                Activos
              </Button>
              <Button
                variant={filterActive === false ? "default" : "outline"}
                onClick={() => setFilterActive(filterActive === false ? null : false)}
                size="sm"
              >
                Inactivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Insumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insumos.length > 0 ? insumos.map((insumo) => (
          <Card key={insumo.id} className={`transition-all hover:shadow-lg ${!insumo.activo ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    {insumo.nombre}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {insumo.descripcion || 'Sin descripción'}
                  </p>
                </div>
                {getStockBadge(insumo)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Stock Actual</p>
                    <p className="font-semibold text-lg">
                      {insumo.stockActual} {insumo.unidadMedida}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Stock Mínimo</p>
                    <p className="font-medium">
                      {insumo.stockMinimo} {insumo.unidadMedida}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-gray-500">Costo Unitario</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(insumo.costoUnitario)}
                  </p>
                </div>

                {insumo.movimientos.length > 0 && (
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">Último Movimiento</p>
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant={insumo.movimientos[0].tipo === 'ENTRADA' ? 'default' : 'secondary'}>
                        {insumo.movimientos[0].tipo}
                      </Badge>
                      <span>{insumo.movimientos[0].cantidad} {insumo.unidadMedida}</span>
                      <span className="text-gray-500">
                        {new Date(insumo.movimientos[0].fecha).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/insumos/${insumo.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/insumos/${insumo.id}/editar`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay insumos</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No se encontraron insumos con esos criterios.' : 'Comienza creando tu primer insumo.'}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/insumos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Insumo
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}