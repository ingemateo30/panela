import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RecentLote {
  id: string
  codigo: string
  cantidad: number
  costoTotal: number
  estado: string
  createdAt: string
  usuario: { name: string } | null
}

interface RecentCompra {
  id: string
  cantidad: number
  total: number
  fecha: string
  proveedor: { nombre: string }
}

interface RecentActivityProps {
  recentLotes: RecentLote[]
  recentCompras: RecentCompra[]
}

export function RecentActivity({ recentLotes, recentCompras }: RecentActivityProps) {
  // Combinar y ordenar actividades
  const activities = [
    ...recentLotes.map(lote => ({
      type: 'lote' as const,
      id: lote.id,
      title: `Nuevo lote ${lote.codigo}`,
      description: `${lote.cantidad} kg - ${formatCurrency(lote.costoTotal)}`,
      user: lote.usuario?.name || 'Usuario desconocido',
      date: new Date(lote.createdAt),
      icon: Package
    })),
    ...recentCompras.map(compra => ({
      type: 'compra' as const,
      id: compra.id,
      title: `Compra a ${compra.proveedor.nombre}`,
      description: `${compra.cantidad} kg - ${formatCurrency(compra.total)}`,
      user: 'Sistema',
      date: new Date(compra.fecha),
      icon: ShoppingCart
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8)

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-panela-100">
              <activity.icon className="h-4 w-4 text-panela-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {activity.title}
            </div>
            <div className="text-sm text-gray-500">
              {activity.description}
            </div>
            <div className="text-xs text-gray-400">
              {activity.user} • {formatDistanceToNow(activity.date, { 
                addSuffix: true, 
                locale: es 
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}