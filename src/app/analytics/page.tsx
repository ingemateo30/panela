'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react'

const COLORS = ['#a67c52', '#8d5f3c', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

interface AnalyticsData {
  produccionMensual: Array<{ mes: string; cantidad: number; lotes: number; costo: number }>
  ventasMensuales: Array<{ mes: string; cantidad: number; ingresos: number; ventas: number }>
  costosDetallados: Array<{ categoria: string; total: number; porcentaje: number }>
  comparativoEstados: Array<{ estado: string; cantidad: number; valor: number }>
  rentabilidadMensual: Array<{ mes: string; ingresos: number; costos: number; utilidad: number; margen: number }>
  topProveedores: Array<{ nombre: string; compras: number; total: number }>
  rendimientoOperarios: Array<{ nombre: string; lotes: number; cantidad: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('6')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/analytics?meses=${periodo}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [periodo])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-panela-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              No se pudieron cargar los datos de análisis
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-gray-600">
            Análisis profundo del desempeño de tu finca panelera
          </p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráfico de Rentabilidad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rentabilidad Mensual</CardTitle>
              <CardDescription>Análisis de ingresos, costos y utilidad</CardDescription>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.rentabilidadMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`$${value.toLocaleString('es-CO')}`, '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  name="Ingresos"
                />
                <Area
                  type="monotone"
                  dataKey="costos"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  name="Costos"
                />
                <Line
                  type="monotone"
                  dataKey="utilidad"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Utilidad"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Producción Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Producción Mensual</CardTitle>
            <CardDescription>Cantidad y costos de producción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.produccionMensual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" orientation="left" stroke="#a67c52" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8d5f3c" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="cantidad"
                    fill="#a67c52"
                    name="Cantidad (kg)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="lotes"
                    fill="#8d5f3c"
                    name="Lotes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ventas Mensuales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Evolución de las ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === 'ingresos' ? `$${value.toLocaleString('es-CO')}` : value,
                      name === 'ingresos' ? 'Ingresos' : name === 'cantidad' ? 'Kg vendidos' : 'Ventas'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Cantidad (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="# Ventas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución de Costos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Costos</CardTitle>
            <CardDescription>Desglose por categoría de costo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.costosDetallados}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.categoria}: ${entry.porcentaje.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.costosDetallados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${value.toLocaleString('es-CO')}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Estados de Lotes */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario por Estado</CardTitle>
            <CardDescription>Distribución del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.comparativoEstados} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="estado" type="category" />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === 'valor' ? `$${value.toLocaleString('es-CO')}` : `${value} kg`,
                      name === 'valor' ? 'Valor' : 'Cantidad'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#a67c52" name="Cantidad (kg)" />
                  <Bar dataKey="valor" fill="#10B981" name="Valor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Proveedores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Proveedores</CardTitle>
            <CardDescription>Proveedores con más transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProveedores.slice(0, 5).map((prov, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-panela-100 flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-panela-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{prov.nombre}</p>
                      <p className="text-sm text-gray-500">{prov.compras} compras</p>
                    </div>
                  </div>
                  <p className="font-semibold text-panela-700">
                    ${prov.total.toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rendimiento Operarios */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Operarios</CardTitle>
            <CardDescription>Producción por operario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.rendimientoOperarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lotes" fill="#8d5f3c" name="Lotes" />
                  <Bar dataKey="cantidad" fill="#a67c52" name="Cantidad (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <TrendingUp className="h-5 w-5 mr-2" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.rentabilidadMensual.length > 0 && (
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Margen Promedio</p>
                <p className="text-sm text-gray-600">
                  Tu margen de utilidad promedio es del{' '}
                  {(
                    data.rentabilidadMensual.reduce((acc, m) => acc + m.margen, 0) /
                    data.rentabilidadMensual.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          )}
          {data.costosDetallados.length > 0 && (
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Mayor Costo</p>
                <p className="text-sm text-gray-600">
                  Tu mayor costo es {data.costosDetallados[0].categoria} con un{' '}
                  {data.costosDetallados[0].porcentaje.toFixed(1)}% del total
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start space-x-3">
            <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
            <div>
              <p className="font-medium text-gray-900">Optimización</p>
              <p className="text-sm text-gray-600">
                Considera negociar mejores precios con tus proveedores principales para mejorar márgenes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
