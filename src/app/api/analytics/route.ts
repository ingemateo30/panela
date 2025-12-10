import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mesesParam = parseInt(searchParams.get('meses') || '6')
    const meses = Math.min(Math.max(mesesParam, 3), 12) // Entre 3 y 12 meses

    const now = new Date()
    const fechaInicio = subMonths(now, meses)

    // 1. Producción Mensual
    const produccionMensual = []
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = subMonths(now, i)
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

      produccionMensual.push({
        mes: format(fecha, 'MMM yy', { locale: es }),
        cantidad: stats._sum.cantidad || 0,
        lotes: stats._count || 0,
        costo: stats._sum.costoTotal || 0
      })
    }

    // 2. Ventas Mensuales
    const ventasMensuales = []
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = subMonths(now, i)
      const inicio = startOfMonth(fecha)
      const fin = endOfMonth(fecha)

      const stats = await prisma.venta.aggregate({
        where: {
          fecha: {
            gte: inicio,
            lte: fin
          }
        },
        _sum: {
          cantidad: true,
          total: true
        },
        _count: true
      })

      ventasMensuales.push({
        mes: format(fecha, 'MMM yy', { locale: es }),
        cantidad: stats._sum.cantidad || 0,
        ingresos: stats._sum.total || 0,
        ventas: stats._count || 0
      })
    }

    // 3. Costos Detallados (agregado de todos los lotes)
    const lotes = await prisma.lote.findMany({
      where: {
        fechaProduccion: {
          gte: fechaInicio
        }
      },
      select: {
        costoCana: true,
        costoManoObra: true,
        costoEnergia: true,
        costoEmpaques: true,
        costoTransporte: true
      }
    })

    type LoteCosto = {
      costoCana: number
      costoManoObra: number
      costoEnergia: number
      costoEmpaques: number
      costoTransporte: number
    }

    const totalCostos = {
      cana: lotes.reduce((acc: number, l: LoteCosto) => acc + l.costoCana, 0),
      manoObra: lotes.reduce((acc: number, l: LoteCosto) => acc + l.costoManoObra, 0),
      energia: lotes.reduce((acc: number, l: LoteCosto) => acc + l.costoEnergia, 0),
      empaques: lotes.reduce((acc: number, l: LoteCosto) => acc + l.costoEmpaques, 0),
      transporte: lotes.reduce((acc: number, l: LoteCosto) => acc + l.costoTransporte, 0)
    }

    const totalGeneral = Object.values(totalCostos).reduce((acc: number, val: number) => acc + val, 0)

    const costosDetallados = [
      { categoria: 'Caña', total: totalCostos.cana, porcentaje: (totalCostos.cana / totalGeneral) * 100 },
      { categoria: 'Mano de Obra', total: totalCostos.manoObra, porcentaje: (totalCostos.manoObra / totalGeneral) * 100 },
      { categoria: 'Energía', total: totalCostos.energia, porcentaje: (totalCostos.energia / totalGeneral) * 100 },
      { categoria: 'Empaques', total: totalCostos.empaques, porcentaje: (totalCostos.empaques / totalGeneral) * 100 },
      { categoria: 'Transporte', total: totalCostos.transporte, porcentaje: (totalCostos.transporte / totalGeneral) * 100 }
    ].filter(c => c.total > 0).sort((a, b) => b.total - a.total)

    // 4. Comparativo por Estados
    const estadosLotes = await prisma.lote.groupBy({
      by: ['estado'],
      _sum: {
        cantidad: true,
        costoTotal: true
      }
    })

    type EstadoLote = {
      estado: string
      _sum: {
        cantidad: number | null
        costoTotal: number | null
      }
    }

    const comparativoEstados = estadosLotes.map((e: EstadoLote) => ({
      estado: e.estado,
      cantidad: e._sum.cantidad || 0,
      valor: e._sum.costoTotal || 0
    }))

    // 5. Rentabilidad Mensual
    const rentabilidadMensual = []
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = subMonths(now, i)
      const inicio = startOfMonth(fecha)
      const fin = endOfMonth(fecha)

      const [costosStats, ventasStats] = await Promise.all([
        prisma.lote.aggregate({
          where: {
            fechaProduccion: {
              gte: inicio,
              lte: fin
            }
          },
          _sum: {
            costoTotal: true
          }
        }),
        prisma.venta.aggregate({
          where: {
            fecha: {
              gte: inicio,
              lte: fin
            }
          },
          _sum: {
            total: true
          }
        })
      ])

      const costos = costosStats._sum.costoTotal || 0
      const ingresos = ventasStats._sum.total || 0
      const utilidad = ingresos - costos
      const margen = costos > 0 ? (utilidad / costos) * 100 : 0

      rentabilidadMensual.push({
        mes: format(fecha, 'MMM yy', { locale: es }),
        ingresos,
        costos,
        utilidad,
        margen
      })
    }

    // 6. Top Proveedores
    const proveedoresStats = await prisma.compra.groupBy({
      by: ['proveedorId'],
      where: {
        fecha: {
          gte: fechaInicio
        }
      },
      _sum: {
        total: true
      },
      _count: true
    })

    type ProveedorStat = {
      proveedorId: string
      _sum: {
        total: number | null
      }
      _count: number
    }

    type TopProveedorData = {
      nombre: string
      compras: number
      total: number
    }

    const topProveedoresData = await Promise.all(
      proveedoresStats.map(async (p: ProveedorStat) => {
        const proveedor = await prisma.proveedor.findUnique({
          where: { id: p.proveedorId },
          select: { nombre: true }
        })
        return {
          nombre: proveedor?.nombre || 'Desconocido',
          compras: p._count,
          total: p._sum.total || 0
        }
      })
    )

    const topProveedores = topProveedoresData
      .sort((a: TopProveedorData, b: TopProveedorData) => b.total - a.total)
      .slice(0, 10)

    // 7. Rendimiento de Operarios
    const operariosStats = await prisma.lote.groupBy({
      by: ['usuarioId'],
      where: {
        fechaProduccion: {
          gte: fechaInicio
        }
      },
      _sum: {
        cantidad: true
      },
      _count: true
    })

    type OperarioStat = {
      usuarioId: string
      _sum: {
        cantidad: number | null
      }
      _count: number
    }

    const rendimientoOperarios = await Promise.all(
      operariosStats.map(async (o: OperarioStat) => {
        const usuario = await prisma.user.findUnique({
          where: { id: o.usuarioId },
          select: { name: true }
        })
        return {
          nombre: usuario?.name || 'Desconocido',
          lotes: o._count,
          cantidad: o._sum.cantidad || 0
        }
      })
    )

    return NextResponse.json({
      produccionMensual,
      ventasMensuales,
      costosDetallados,
      comparativoEstados,
      rentabilidadMensual,
      topProveedores,
      rendimientoOperarios
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
