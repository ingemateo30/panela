import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { EstadoLote } from '@/types/prisma'

// Esquema de validación para lotes
const loteSchema = z.object({
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  fechaProduccion: z.string().transform((str) => new Date(str)),
  costoCana: z.number().min(0),
  costoManoObra: z.number().min(0),
  costoEnergia: z.number().min(0),
  costoEmpaques: z.number().min(0),
  costoTransporte: z.number().min(0),
  costoTotal: z.number().positive(),
  margenUtilidad: z.number().min(0).max(100),
  precioSugerido: z.number().positive(),
  codigo: z.string().min(1),
  descripcion: z.string().optional(),
  observaciones: z.string().optional()
})

// GET - Obtener lotes
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
    const estadoParam = searchParams.get('estado')

    // Validar que el estado sea un valor válido del enum
    const estadoValido = estadoParam && Object.values(EstadoLote).includes(estadoParam as EstadoLote)
      ? (estadoParam as EstadoLote)
      : undefined

    const where = {
      ...(search && {
        OR: [
          { codigo: { contains: search } },
          { descripcion: { contains: search } }
        ]
      }),
      ...(estadoValido && { estado: estadoValido })
    }

    const [lotes, total] = await Promise.all([
      prisma.lote.findMany({
        where,
        include: {
          usuario: {
            select: { name: true, email: true }
          },
          ventas: {
            select: {
              id: true,
              cantidad: true,
              total: true,
              fecha: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.lote.count({ where })
    ])

    return NextResponse.json({
      lotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching lotes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear lote
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = loteSchema.parse(body)

    // Generar un código único basado en fecha y contador
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = Date.now().toString().slice(-6)
    const uniqueCode = `LOTE-${dateStr}-${timeStr}`
    
    // Asignar el código generado (o usar el del validatedData si existe)
    const codigoFinal = validatedData.codigo || uniqueCode

    const lote = await prisma.lote.create({
      data: {
        ...validatedData,
        codigo: codigoFinal,
        estado: 'PRODUCCION',
        usuarioId: (session.user as any).id
      },
      include: {
        usuario: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(lote, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating lote:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
