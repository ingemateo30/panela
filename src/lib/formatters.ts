export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-CO').format(number)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`
  }
  return `${kg} kg`
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

export function getEstadoBadgeVariant(estado: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (estado) {
    case 'DISPONIBLE':
      return 'default'
    case 'PRODUCCION':
      return 'secondary'
    case 'VENDIDO':
      return 'outline'
    case 'CADUCADO':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getEstadoLabel(estado: string): string {
  switch (estado) {
    case 'DISPONIBLE':
      return 'Disponible'
    case 'PRODUCCION':
      return 'En Producción'
    case 'VENDIDO':
      return 'Vendido'
    case 'CADUCADO':
      return 'Caducado'
    default:
      return estado
  }
}
