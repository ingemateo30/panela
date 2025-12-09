import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ clave: string }>
}

// GET - Obtener configuración por clave
export async function GET(request: Request, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clave } = await context.params
    
    const configuracion = await prisma.configuracion.findUnique({
      where: { clave }
    })

    if (!configuracion) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(configuracion)
  } catch (error) {
    console.error('Error fetching configuracion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración
export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clave } = await context.params
    const body = await request.json()
    const { valor } = body

    if (!valor) {
      return NextResponse.json(
        { error: 'El valor es obligatorio' },
        { status: 400 }
      )
    }

    const configuracion = await prisma.configuracion.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor }
    })

    return NextResponse.json(configuracion)
  } catch (error) {
    console.error('Error updating configuracion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
