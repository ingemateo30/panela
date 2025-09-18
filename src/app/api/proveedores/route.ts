import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación
const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  activo: z.boolean().default(true)
})

// GET - Obtener proveedores
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

    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search } },
          { contacto: { contains: search } },
          { email: { contains: search } }
        ]
      }),
      ...(activo !== null && activo !== '' && { activo: activo === 'true' })
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        include: {
          compras: {
            select: {
              id: true,
              total: true,
              fecha: true
            },
            orderBy: { fecha: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.proveedor.count({ where })
    ])

    return NextResponse.json({
      proveedores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching proveedores:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear proveedor
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = proveedorSchema.parse(body)

    // Verificar que no exista otro proveedor con el mismo nombre
    const existingProveedor = await prisma.proveedor.findFirst({
      where: { nombre: validatedData.nombre }
    })

    if (existingProveedor) {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese nombre' },
        { status: 400 }
      )
    }

    const proveedor = await prisma.proveedor.create({
      data: validatedData
    })

    return NextResponse.json(proveedor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating proveedor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}