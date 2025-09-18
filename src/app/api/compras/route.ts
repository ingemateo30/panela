import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const compraSchema = z.object({
  proveedorId: z.string().min(1, 'El proveedor es obligatorio'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().positive('El precio unitario debe ser mayor a 0'),
  total: z.number().positive('El total debe ser mayor a 0'),
  observaciones: z.string().optional()
})

// POST - Registrar compra
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = compraSchema.parse(body)

    // Verificar que el proveedor existe y está activo
    const proveedor = await prisma.proveedor.findFirst({
      where: {
        id: validatedData.proveedorId,
        activo: true
      }
    })

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado o inactivo' },
        { status: 404 }
      )
    }

    const compra = await prisma.compra.create({
      data: validatedData,
      include: {
        proveedor: {
          select: {
            nombre: true,
            contacto: true
          }
        }
      }
    })

    return NextResponse.json(compra, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating compra:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener compras
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const proveedorId = searchParams.get('proveedorId')

    const where = {
      ...(proveedorId && { proveedorId })
    }

    const [compras, total] = await Promise.all([
      prisma.compra.findMany({
        where,
        include: {
          proveedor: {
            select: {
              nombre: true,
              contacto: true
            }
          }
        },
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.compra.count({ where })
    ])

    return NextResponse.json({
      compras,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching compras:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}