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

// PUT - Actualizar proveedor
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = proveedorSchema.parse(body)

    // Verificar que el proveedor existe
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { id: params.id }
    })

    if (!existingProveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no exista otro proveedor con el mismo nombre (excepto el actual)
    const duplicateProveedor = await prisma.proveedor.findFirst({
      where: {
        nombre: validatedData.nombre,
        id: { not: params.id }
      }
    })

    if (duplicateProveedor) {
      return NextResponse.json(
        { error: 'Ya existe otro proveedor con ese nombre' },
        { status: 400 }
      )
    }

    const proveedor = await prisma.proveedor.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(proveedor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating proveedor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar proveedor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el proveedor existe
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { id: params.id }
    })

    if (!existingProveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // En lugar de eliminar, desactivamos el proveedor
    const proveedor = await prisma.proveedor.update({
      where: { id: params.id },
      data: { activo: false }
    })

    return NextResponse.json(proveedor)
  } catch (error) {
    console.error('Error deleting proveedor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
