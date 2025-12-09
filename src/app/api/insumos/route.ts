import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación para insumos
const insumoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  unidadMedida: z.string().min(1, 'La unidad de medida es obligatoria'),
  stockMinimo: z.number().min(0),
  stockActual: z.number().min(0),
  costoUnitario: z.number().min(0),
  activo: z.boolean().default(true)
})

// GET - Obtener insumos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const activo = searchParams.get('activo')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { descripcion: { contains: search } }
        ]
      }),
      ...(activo !== null && activo !== '' && { activo: activo === 'true' }),
      ...(lowStock && {
        stockActual: { lte: prisma.insumo.fields.stockMinimo }
      })
    }

    const [insumos, total] = await Promise.all([
      prisma.insumo.findMany({
        where,
        include: {
          movimientos: {
            select: {
              id: true,
              tipo: true,
              cantidad: true,
              fecha: true,
              motivo: true
            },
            orderBy: { fecha: 'desc' },
            take: 5
          }
        },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.insumo.count({ where })
    ])

    return NextResponse.json({
      insumos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching insumos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear insumo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = insumoSchema.parse(body)

    // Verificar que no exista otro insumo con el mismo nombre
    const existingInsumo = await prisma.insumo.findFirst({
      where: { nombre: validatedData.nombre }
    })

    if (existingInsumo) {
      return NextResponse.json(
        { error: 'Ya existe un insumo con ese nombre' },
        { status: 400 }
      )
    }

    const insumo = await prisma.insumo.create({
      data: validatedData
    })

    // Si hay stock inicial, crear movimiento de entrada
    if (validatedData.stockActual > 0) {
      await prisma.insumoMovimiento.create({
        data: {
          insumoId: insumo.id,
          tipo: 'ENTRADA',
          cantidad: validatedData.stockActual,
          motivo: 'Stock inicial',
          usuarioId: (session.user as any).id
        }
      })
    }

    return NextResponse.json(insumo, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating insumo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}