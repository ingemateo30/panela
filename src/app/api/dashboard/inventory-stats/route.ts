import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const inventoryStats = await prisma.lote.groupBy({
      by: ['estado'],
      _count: {
        id: true
      }
    })

    const stats = {
      disponible: 0,
      produccion: 0,
      vendido: 0,
      caducado: 0
    }

    inventoryStats.forEach((stat: { estado: string, _count: { id: number } }) => {
      switch (stat.estado) {
        case 'DISPONIBLE':
          stats.disponible = stat._count.id
          break
        case 'PRODUCCION':
          stats.produccion = stat._count.id
          break
        case 'VENDIDO':
          stats.vendido = stat._count.id
          break
        case 'CADUCADO':
          stats.caducado = stat._count.id
          break
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}