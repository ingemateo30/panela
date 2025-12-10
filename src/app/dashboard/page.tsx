import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Factory, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { InventoryChart } from '@/components/charts/inventory-chart'
import { SalesChart } from '@/components/charts/sales-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ComponentType } from 'react';
import { ElementType } from 'react';
import { EstadoLote } from '@/types/prisma'

async function getDashboardStats() {
  const [
    totalLotes,
    totalProveedores,
    insumosCount,
    lotesDisponibles,
    allInsumos,
    totalInventoryValue,
    recentLotes,
    recentCompras
  ] = await Promise.all([
    prisma.lote.count(),
    prisma.proveedor.count({ where: { activo: true } }),
    prisma.insumo.count({ where: { activo: true } }),
    prisma.lote.count({ where: { estado: EstadoLote.DISPONIBLE } }),
    // Obtener todos los insumos activos para filtrar en memoria
    prisma.insumo.findMany({
      where: { activo: true },
      select: { stockActual: true, stockMinimo: true }
    }),
    prisma.lote.aggregate({
      _sum: { costoTotal: true },
      where: { estado: EstadoLote.DISPONIBLE }
    }),
    prisma.lote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { usuario: { select: { name: true } } }
    }),
    prisma.compra.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { proveedor: { select: { nombre: true } } }
    })
  ])

  // Filtrar insumos con stock bajo en memoria
  const insumosLowStock = allInsumos.filter(
    insumo => insumo.stockActual <= insumo.stockMinimo
  ).length

  return {
    totalLotes,
    totalProveedores,
    insumosCount,
    lotesDisponibles,
    insumosLowStock,
    totalInventoryValue: totalInventoryValue._sum.costoTotal || 0,
    recentLotes,
    recentCompras
  }
}

function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: {
  title: string
  value: string | number
  description: string
 icon: ElementType;
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Resumen general de tu sistema de gestión de panela
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Lotes"
          value={stats.totalLotes}
          description="Lotes registrados en el sistema"
          icon={Package}
        />
        <StatsCard
          title="Lotes Disponibles"
          value={stats.lotesDisponibles}
          description="Listos para venta"
          icon={Factory}
        />
        <StatsCard
          title="Proveedores Activos"
          value={stats.totalProveedores}
          description="Proveedores registrados"
          icon={Users}
        />
        <StatsCard
          title="Valor Inventario"
          value={formatCurrency(stats.totalInventoryValue)}
          description="Valor total del inventario"
          icon={DollarSign}
        />
      </div>

      {/* Alertas */}
      {stats.insumosLowStock > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerta de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {stats.insumosLowStock} insumo(s) tienen stock bajo el mínimo requerido.
              <a href="/insumos" className="ml-2 font-medium underline">
                Ver detalles
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventario por Estado</CardTitle>
            <CardDescription>
              Distribución de lotes según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando gráfico...</div>}>
              <InventoryChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Producción Mensual</CardTitle>
            <CardDescription>
              Cantidad de panela producida por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando gráfico...</div>}>
              <SalesChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimos movimientos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity 
            recentLotes={stats.recentLotes}
            recentCompras={stats.recentCompras}
          />
        </CardContent>
      </Card>
    </div>
  )
}