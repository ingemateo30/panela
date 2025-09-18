import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const now = new Date()
    const months = []
    
    // Obtener los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const startDate = startOfMonth(monthDate)
      const endDate = endOfMonth(monthDate)
      
      const [productionData, salesData] = await Promise.all([
        prisma.lote.aggregate({
          _sum: { cantidad: true },
          where: {
            fechaProduccion: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.venta.aggregate({
          _sum: { cantidad: true },
          where: {
            fecha: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ])

      months.push({
        month: format(monthDate, 'MMM', { locale: es }),
        production: productionData._sum.cantidad || 0,
        sales: salesData._sum.cantidad || 0
      })
    }

    return NextResponse.json(months)
  } catch (error) {
    console.error('Error fetching sales stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}