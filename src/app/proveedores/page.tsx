import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExportButton } from '@/components/ui/export-button'
import { Plus, Users, Phone, Mail, MapPin, TrendingUp, ShoppingCart, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ProveedorForm } from '@/components/forms/ProveedorForm'
import { CompraForm } from '@/components/forms/CompraForm'

interface SearchParams {
  page?: string
  search?: string
  activo?: string
}

async function getProveedores(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const search = searchParams.search || ''
  const activo = searchParams.activo

  const where = {
    ...(search && {
      OR: [
        { nombre: { contains: search } },
        { contacto: { contains: search } },
        { email: { contains: search } }
      ]
    }),
    ...(activo !== undefined && activo !== '' && { activo: activo === 'true' })
  }

  const [proveedores, total] = await Promise.all([
    prisma.proveedor.findMany({
      where,
      include: {
        compras: {
          select: {
            id: true,
            cantidad: true,
            total: true,
            fecha: true
          },
          orderBy: { fecha: 'desc' },
          take: 5
        }
      },
      orderBy: { nombre: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.proveedor.count({ where })
  ])

  // Calcular estadísticas para cada proveedor
  const proveedoresConStats = await Promise.all(
    proveedores.map(async (proveedor) => {
      const stats = await prisma.compra.aggregate({
        where: { proveedorId: proveedor.id },
        _sum: {
          cantidad: true,
          total: true
        },
        _count: true
      })

      return {
        ...proveedor,
        totalCompras: stats._count || 0,
        totalCantidad: stats._sum.cantidad || 0,
        totalGastado: stats._sum.total || 0
      }
    })
  )

  return {
    proveedores: proveedoresConStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

function ProveedorCard({ proveedor }: { proveedor: any }) {
  return (
    <Card className={`${!proveedor.activo ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{proveedor.nombre}</CardTitle>
              <Badge variant={proveedor.activo ? "default" : "secondary"}>
                {proveedor.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            {proveedor.contacto && (
              <p className="text-sm text-gray-600">Contacto: {proveedor.contacto}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de contacto */}
        <div className="space-y-2 pb-4 border-b">
          {proveedor.telefono && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {proveedor.telefono}
            </div>
          )}
          {proveedor.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {proveedor.email}
            </div>
          )}
          {proveedor.direccion && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {proveedor.direccion}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600">Compras</p>
            <p className="text-lg font-semibold">{proveedor.totalCompras}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Kg</p>
            <p className="text-lg font-semibold">{proveedor.totalCantidad.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Gastado</p>
            <p className="text-lg font-semibold text-panela-600">
              {formatCurrency(proveedor.totalGastado)}
            </p>
          </div>
        </div>

        {/* Últimas compras */}
        {proveedor.compras && proveedor.compras.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Últimas compras</p>
            <div className="space-y-1">
              {proveedor.compras.slice(0, 3).map((compra: any) => (
                <div key={compra.id} className="flex justify-between text-xs text-gray-600">
                  <span>{new Date(compra.fecha).toLocaleDateString('es-CO')}</span>
                  <span>{compra.cantidad} kg</span>
                  <span className="font-medium">{formatCurrency(compra.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Nueva Compra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Compra - {proveedor.nombre}</DialogTitle>
              </DialogHeader>
              <CompraForm
                proveedorId={proveedor.id}
                onSuccess={() => window.location.reload()}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Proveedor</DialogTitle>
              </DialogHeader>
              <ProveedorForm
                proveedor={proveedor}
                onSuccess={() => window.location.reload()}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ProveedoresPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  const data = await getProveedores(searchParams)

  // Estadísticas generales
  const statsGenerales = await prisma.proveedor.aggregate({
    _count: true,
    where: { activo: true }
  })

  const totalCompras = await prisma.compra.aggregate({
    _sum: {
      total: true,
      cantidad: true
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600">
            Gestiona tus proveedores y registra compras
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={data.proveedores}
            filename="proveedores"
            type="proveedores"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <ProveedorForm onSuccess={() => window.location.reload()} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Proveedores Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-panela-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{statsGenerales._count}</p>
                <p className="text-xs text-gray-500">Total activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalCompras._sum.cantidad?.toFixed(0) || 0}</p>
                <p className="text-xs text-gray-500">Kilogramos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inversión Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCompras._sum.total || 0)}
                </p>
                <p className="text-xs text-gray-500">Total invertido en compras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, contacto o email..."
                defaultValue={searchParams.search}
                name="search"
              />
            </div>
            <Select defaultValue={searchParams.activo || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de proveedores */}
      {data.proveedores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proveedores registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando tu primer proveedor
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                </DialogHeader>
                <ProveedorForm onSuccess={() => window.location.reload()} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.proveedores.map((proveedor) => (
              <ProveedorCard key={proveedor.id} proveedor={proveedor} />
            ))}
          </div>

          {/* Paginación */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/proveedores?page=${page}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.activo ? `&activo=${searchParams.activo}` : ''}`}
                >
                  <Button
                    variant={page === data.pagination.page ? 'default' : 'outline'}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
