import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Factory,
  Calendar,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExportButton } from '@/components/ui/export-button'

async function getReportesData() {
  const now = new Date()
  const inicioMes = startOfMonth(now)
  const finMes = endOfMonth(now)
  const mesAnterior = subMonths(now, 1)
  const inicioMesAnterior = startOfMonth(mesAnterior)
  const finMesAnterior = endOfMonth(mesAnterior)

  // Datos del mes actual
  const [
    lotesData,
    ventasData,
    comprasData,
    insumosData,
    proveedoresData,
    // Mes anterior para comparación
    lotesDataMesAnterior,
    ventasDataMesAnterior
  ] = await Promise.all([
    // Lotes mes actual
    prisma.lote.findMany({
      where: {
        fechaProduccion: {
          gte: inicioMes,
          lte: finMes
        }
      },
      include: {
        usuario: { select: { name: true } },
        ventas: true
      },
      orderBy: { fechaProduccion: 'desc' }
    }),

    // Ventas mes actual
    prisma.venta.findMany({
      where: {
        fecha: {
          gte: inicioMes,
          lte: finMes
        }
      },
      include: {
        lote: { select: { codigo: true } }
      },
      orderBy: { fecha: 'desc' }
    }),

    // Compras mes actual
    prisma.compra.findMany({
      where: {
        fecha: {
          gte: inicioMes,
          lte: finMes
        }
      },
      include: {
        proveedor: { select: { nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    }),

    // Insumos con stock bajo
    prisma.insumo.findMany({
      where: {
        activo: true,
        stockActual: { lte: prisma.insumo.fields.stockMinimo }
      }
    }),

    // Proveedores activos
    prisma.proveedor.findMany({
      where: { activo: true },
      include: {
        compras: {
          where: {
            fecha: {
              gte: inicioMes,
              lte: finMes
            }
          }
        }
      }
    }),

    // Datos mes anterior
    prisma.lote.aggregate({
      where: {
        fechaProduccion: {
          gte: inicioMesAnterior,
          lte: finMesAnterior
        }
      },
      _sum: {
        cantidad: true,
        costoTotal: true
      },
      _count: true
    }),

    prisma.venta.aggregate({
      where: {
        fecha: {
          gte: inicioMesAnterior,
          lte: finMesAnterior
        }
      },
      _sum: {
        cantidad: true,
        total: true
      },
      _count: true
    })
  ])

  // Calcular estadísticas
  const totalProduccionKg = lotesData.reduce((acc: number, lote: any) => acc + lote.cantidad, 0)
  const totalCostoProduccion = lotesData.reduce((acc: number, lote: any) => acc + lote.costoTotal, 0)
  const totalVentasKg = ventasData.reduce((acc: number, venta: any) => acc + venta.cantidad, 0)
  const totalIngresos = ventasData.reduce((acc: number, venta: any) => acc + venta.total, 0)
  const totalComprasKg = comprasData.reduce((acc: number, compra: any) => acc + compra.cantidad, 0)
  const totalGastoCompras = comprasData.reduce((acc: number, compra: any) => acc + compra.total, 0)

  // Calcular variaciones con mes anterior
  const variacionProduccion = lotesDataMesAnterior._count > 0
    ? ((lotesData.length - lotesDataMesAnterior._count) / lotesDataMesAnterior._count) * 100
    : 0

  const variacionVentas = ventasDataMesAnterior._count > 0
    ? ((ventasData.length - ventasDataMesAnterior._count) / ventasDataMesAnterior._count) * 100
    : 0

  // Rentabilidad
  const margenUtilidad = totalCostoProduccion > 0
    ? ((totalIngresos - totalCostoProduccion) / totalCostoProduccion) * 100
    : 0

  return {
    resumenMensual: {
      produccionLotes: lotesData.length,
      produccionKg: totalProduccionKg,
      costoProduccion: totalCostoProduccion,
      ventasRealizadas: ventasData.length,
      ventasKg: totalVentasKg,
      ingresos: totalIngresos,
      compras: comprasData.length,
      comprasKg: totalComprasKg,
      gastoCompras: totalGastoCompras,
      margenUtilidad,
      variacionProduccion,
      variacionVentas
    },
    lotes: lotesData,
    ventas: ventasData,
    compras: comprasData,
    insumosLowStock: insumosData,
    proveedores: proveedoresData
  }
}

function ReportCard({
  title,
  description,
  icon: Icon,
  reportType,
  data,
  color = 'panela'
}: {
  title: string
  description: string
  icon: any
  reportType: 'compras' | 'insumos' | 'lotes' | 'proveedores' | 'ventas'
  data: any[]
  color?: string
}) {
  return (
    <Card className={`hover:shadow-lg transition-shadow border-${color}-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-12 w-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Registros disponibles</p>
            <p className="text-2xl font-bold text-gray-900">{data.length}</p>
          </div>
          <ExportButton
            data={data}
            filename={`${reportType}_${format(new Date(), 'yyyy-MM-dd')}`}
            type={reportType}
            buttonText="Descargar"
            buttonSize="sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon: any
}) {
  const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-600'
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingUp : null

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend !== undefined && trend !== 0 && (
              <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
                {TrendIcon && <TrendIcon className="h-4 w-4 mr-1" />}
                <span>{Math.abs(trend).toFixed(1)}% vs mes anterior</span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-panela-600" />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ReportesPage() {
  const session = await getServerSession(authOptions)

  // Verificar que el usuario sea admin
  if ((session?.user as any)?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              No tienes permisos para acceder a esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const data = await getReportesData()
  const mesActual = format(new Date(), 'MMMM yyyy', { locale: es })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600">
          Genera y descarga reportes detallados de tu operación
        </p>
      </div>

      {/* Resumen del mes */}
      <Card className="bg-gradient-to-r from-panela-50 to-orange-50 border-panela-200">
        <CardHeader>
          <CardTitle className="flex items-center text-panela-900">
            <Calendar className="h-5 w-5 mr-2" />
            Resumen de {mesActual}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Producción"
              value={`${data.resumenMensual.produccionLotes} lotes`}
              subtitle={`${data.resumenMensual.produccionKg.toFixed(0)} kg`}
              trend={data.resumenMensual.variacionProduccion}
              icon={Factory}
            />
            <StatsCard
              title="Ventas"
              value={`${data.resumenMensual.ventasRealizadas} ventas`}
              subtitle={`${data.resumenMensual.ventasKg.toFixed(0)} kg`}
              trend={data.resumenMensual.variacionVentas}
              icon={TrendingUp}
            />
            <StatsCard
              title="Ingresos"
              value={formatCurrency(data.resumenMensual.ingresos)}
              subtitle={`Costo: ${formatCurrency(data.resumenMensual.costoProduccion)}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Rentabilidad"
              value={`${data.resumenMensual.margenUtilidad.toFixed(1)}%`}
              subtitle={`Margen de utilidad`}
              icon={BarChart3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reportes disponibles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Reportes Disponibles
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Reporte de Producción"
            description={`Lotes producidos en ${mesActual}`}
            icon={Package}
            reportType="lotes"
            data={data.lotes}
            color="blue"
          />
          <ReportCard
            title="Reporte de Ventas"
            description={`Ventas realizadas en ${mesActual}`}
            icon={TrendingUp}
            reportType="ventas"
            data={data.ventas}
            color="green"
          />
          <ReportCard
            title="Reporte de Compras"
            description={`Compras realizadas en ${mesActual}`}
            icon={ShoppingCart}
            reportType="compras"
            data={data.compras}
            color="purple"
          />
          <ReportCard
            title="Reporte de Proveedores"
            description="Todos los proveedores activos"
            icon={Users}
            reportType="proveedores"
            data={data.proveedores}
            color="orange"
          />
          <ReportCard
            title="Inventario de Insumos"
            description="Estado actual de insumos"
            icon={Package}
            reportType="insumos"
            data={data.insumosLowStock}
            color="red"
          />
        </div>
      </div>

      {/* Alertas */}
      {data.insumosLowStock.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              Hay {data.insumosLowStock.length} insumo(s) con stock bajo el mínimo:
            </p>
            <div className="space-y-2">
              {data.insumosLowStock.slice(0, 5).map((insumo: any) => (
                <div key={insumo.id} className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="font-medium text-gray-900">{insumo.nombre}</span>
                  <span className="text-sm text-red-600">
                    Stock: {insumo.stockActual} / Mínimo: {insumo.stockMinimo}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información sobre Reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-panela-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Formatos Disponibles</p>
              <p className="text-sm text-gray-600">
                Los reportes se pueden descargar en formato PDF para impresión o Excel para análisis
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-panela-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Periodo de Datos</p>
              <p className="text-sm text-gray-600">
                Los reportes muestran información del mes actual. Próximamente: selector de fechas personalizado
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-5 w-5 text-panela-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Análisis Avanzado</p>
              <p className="text-sm text-gray-600">
                Para análisis más detallados y gráficos interactivos, visita la sección de Analíticas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
