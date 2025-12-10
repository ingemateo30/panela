import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Factory,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { EstadoLote } from '@/types/prisma'

async function getProduccionStats() {
  const now = new Date()
  const inicioMes = startOfMonth(now)
  const finMes = endOfMonth(now)
  const hace30Dias = subDays(now, 30)

  // Estadísticas generales
  const [
    totalLotes,
    lotesProduccion,
    lotesDisponibles,
    lotesVendidos,
    produccionMesActual,
    produccionUltimos30Dias,
    ventasMesActual,
    estadisticasPorUsuario
  ] = await Promise.all([
    // Total de lotes
    prisma.lote.count(),

    // Lotes en producción
    prisma.lote.count({ where: { estado: EstadoLote.PRODUCCION } }),

    // Lotes disponibles
    prisma.lote.count({ where: { estado: EstadoLote.DISPONIBLE } }),

    // Lotes vendidos
    prisma.lote.count({ where: { estado: EstadoLote.VENDIDO } }),

    // Producción del mes actual
    prisma.lote.aggregate({
      where: {
        fechaProduccion: {
          gte: inicioMes,
          lte: finMes
        }
      },
      _sum: {
        cantidad: true,
        costoTotal: true
      },
      _count: true
    }),

    // Producción últimos 30 días
    prisma.lote.aggregate({
      where: {
        fechaProduccion: {
          gte: hace30Dias
        }
      },
      _sum: {
        cantidad: true,
        costoTotal: true
      }
    }),

    // Ventas del mes actual
    prisma.venta.aggregate({
      where: {
        fecha: {
          gte: inicioMes,
          lte: finMes
        }
      },
      _sum: {
        cantidad: true,
        total: true
      },
      _count: true
    }),

    // Estadísticas por usuario
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            lotes: true
          }
        },
        lotes: {
          select: {
            cantidad: true,
            costoTotal: true
          }
        }
      },
      where: {
        lotes: {
          some: {}
        }
      }
    })
  ])

  // Producción por mes (últimos 6 meses)
  const ultimosMeses = []
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const inicio = startOfMonth(fecha)
    const fin = endOfMonth(fecha)

    const stats = await prisma.lote.aggregate({
      where: {
        fechaProduccion: {
          gte: inicio,
          lte: fin
        }
      },
      _sum: {
        cantidad: true,
        costoTotal: true
      },
      _count: true
    })

    ultimosMeses.push({
      mes: format(fecha, 'MMM yyyy', { locale: es }),
      lotes: stats._count || 0,
      cantidad: stats._sum.cantidad || 0,
      costo: stats._sum.costoTotal || 0
    })
  }

  // Lotes recientes
  const lotesRecientes = await prisma.lote.findMany({
    take: 10,
    orderBy: { fechaProduccion: 'desc' },
    include: {
      usuario: {
        select: {
          name: true
        }
      }
    }
  })

  // Calcular eficiencia de producción
  const cantidadVendida = ventasMesActual._sum.cantidad || 0
  const cantidadProducida = produccionMesActual._sum.cantidad || 0
  const eficienciaVentas = cantidadProducida > 0
    ? (cantidadVendida / cantidadProducida) * 100
    : 0

  return {
    totalLotes,
    lotesProduccion,
    lotesDisponibles,
    lotesVendidos,
    produccionMesActual: {
      lotes: produccionMesActual._count || 0,
      cantidad: produccionMesActual._sum.cantidad || 0,
      costo: produccionMesActual._sum.costoTotal || 0
    },
    produccionUltimos30Dias: {
      cantidad: produccionUltimos30Dias._sum.cantidad || 0,
      costo: produccionUltimos30Dias._sum.costoTotal || 0
    },
    ventasMesActual: {
      ventas: ventasMesActual._count || 0,
      cantidad: cantidadVendida,
      total: ventasMesActual._sum.total || 0
    },
    eficienciaVentas,
    estadisticasPorUsuario: estadisticasPorUsuario.map((user: any) => ({
      ...user,
      totalCantidad: user.lotes.reduce((acc: number, l: any) => acc + l.cantidad, 0),
      totalCosto: user.lotes.reduce((acc: number, l: any) => acc + l.costoTotal, 0)
    })),
    ultimosMeses,
    lotesRecientes
  }
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'panela'
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ProduccionPage() {
  const session = await getServerSession(authOptions)
  const stats = await getProduccionStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Producción</h1>
          <p className="text-gray-600">
            Monitorea y analiza la producción de panela
          </p>
        </div>
        <Link href="/lotes/nuevo">
          <Button>
            <Factory className="h-4 w-4 mr-2" />
            Registrar Producción
          </Button>
        </Link>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Lotes"
          value={stats.totalLotes}
          subtitle="Lotes totales registrados"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="En Producción"
          value={stats.lotesProduccion}
          subtitle="Lotes en proceso"
          icon={Factory}
          color="orange"
        />
        <StatsCard
          title="Disponibles"
          value={stats.lotesDisponibles}
          subtitle="Listos para venta"
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Vendidos"
          value={stats.lotesVendidos}
          subtitle="Lotes completamente vendidos"
          icon={TrendingUp}
          color="panela"
        />
      </div>

      {/* Estadísticas del mes actual */}
      <Card className="bg-gradient-to-r from-panela-50 to-orange-50 border-panela-200">
        <CardHeader>
          <CardTitle className="flex items-center text-panela-900">
            <Calendar className="h-5 w-5 mr-2" />
            Producción de {format(new Date(), 'MMMM yyyy', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lotes Producidos</p>
              <p className="text-3xl font-bold text-panela-700">
                {stats.produccionMesActual.lotes}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.produccionMesActual.cantidad.toFixed(0)} kg totales
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Costo de Producción</p>
              <p className="text-3xl font-bold text-panela-700">
                {formatCurrency(stats.produccionMesActual.costo)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.produccionMesActual.cantidad > 0
                  ? `${formatCurrency(stats.produccionMesActual.costo / stats.produccionMesActual.cantidad)} por kg`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Eficiencia de Ventas</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.eficienciaVentas.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.ventasMesActual.cantidad.toFixed(0)} kg vendidos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Últimos 6 meses */}
        <Card>
          <CardHeader>
            <CardTitle>Producción por Mes</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ultimosMeses.map((mes) => (
                <div key={mes.mes} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{mes.mes}</p>
                    <p className="text-sm text-gray-500">
                      {mes.lotes} lotes • {mes.cantidad.toFixed(0)} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-panela-700">
                      {formatCurrency(mes.costo)}
                    </p>
                    {mes.cantidad > 0 && (
                      <p className="text-xs text-gray-500">
                        {formatCurrency(mes.costo / mes.cantidad)}/kg
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Producción por operario */}
        <Card>
          <CardHeader>
            <CardTitle>Producción por Operario</CardTitle>
            <CardDescription>Rendimiento del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.estadisticasPorUsuario.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No hay datos de producción por operario
                </p>
              ) : (
                stats.estadisticasPorUsuario.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-panela-100 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-panela-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user._count.lotes} lotes • {user.totalCantidad.toFixed(0)} kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-panela-700">
                        {formatCurrency(user.totalCosto)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lotes recientes */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Producción Reciente</CardTitle>
              <CardDescription>Últimos 10 lotes producidos</CardDescription>
            </div>
            <Link href="/lotes">
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cantidad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Costo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Operario</th>
                </tr>
              </thead>
              <tbody>
                {stats.lotesRecientes.map((lote: any) => (
                  <tr key={lote.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/trazabilidad/${lote.codigo}`} className="text-panela-600 hover:underline font-mono">
                        {lote.codigo}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(lote.fechaProduccion), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {lote.cantidad} kg
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {formatCurrency(lote.costoTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          lote.estado === 'DISPONIBLE' ? 'default' :
                          lote.estado === 'VENDIDO' ? 'secondary' :
                          lote.estado === 'PRODUCCION' ? 'outline' : 'destructive'
                        }
                      >
                        {lote.estado}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {lote.usuario.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
