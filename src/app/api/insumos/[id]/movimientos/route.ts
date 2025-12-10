import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'



const movimientoSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  motivo: z.string().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Crear movimiento de insumo
export async function POST(request: Request, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validatedData = movimientoSchema.parse(body)

    // Verificar que el insumo existe
    const insumo = await prisma.insumo.findUnique({
      where: { id }
    })

    if (!insumo) {
      return NextResponse.json(
        { error: 'Insumo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar stock para salidas
    if (validatedData.tipo === 'SALIDA') {
      if (insumo.stockActual < validatedData.cantidad) {
        return NextResponse.json(
          { error: 'Stock insuficiente' },
          { status: 400 }
        )
      }
    }

    // Calcular nuevo stock
    const nuevoStock = validatedData.tipo === 'ENTRADA' 
      ? insumo.stockActual + validatedData.cantidad
      : insumo.stockActual - validatedData.cantidad

    // Crear movimiento y actualizar stock en una transacción
    const [movimiento] = await prisma.$transaction([
      prisma.insumoMovimiento.create({
        data: {
          insumoId: id,
          usuarioId: (session.user as any).id,
          tipo: validatedData.tipo,
          cantidad: validatedData.cantidad,
          motivo: validatedData.motivo,
        },
        include: {
          usuario: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.insumo.update({
        where: { id },
        data: { stockActual: nuevoStock }
      })
    ])

    return NextResponse.json(movimiento, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating movimiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
