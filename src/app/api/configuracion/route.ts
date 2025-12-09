import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configSchema = z.object({
  margenUtilidadDefecto: z.number().min(0).max(100),
  moneda: z.string().min(1).max(10),
  nombreEmpresa: z.string().min(1),
  descripcionEmpresa: z.string().optional(),
  stockMinimoAlerta: z.number().min(0).max(100),
  diasVencimiento: z.number().min(1),
  notificacionesEmail: z.boolean(),
  notificacionesStockBajo: z.boolean(),
  formatoCodigoLote: z.string().min(1)
})

// GET - Obtener configuración
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario sea admin
    if ((session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // Obtener todas las configuraciones
    const configs = await prisma.configuracion.findMany()

    // Convertir a objeto
    const configObj: any = {}
    configs.forEach((config: typeof configs[0]) => {
      // Intentar parsear valores JSON
      try {
        configObj[config.clave] = JSON.parse(config.valor)
      } catch {
        configObj[config.clave] = config.valor
      }
    })

    return NextResponse.json(configObj)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Guardar configuración
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario sea admin
    if ((session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = configSchema.parse(body)

    // Guardar cada configuración
    const promises = Object.entries(validatedData).map(([clave, valor]) => {
      const valorStr = typeof valor === 'object' ? JSON.stringify(valor) : String(valor)

      return prisma.configuracion.upsert({
        where: { clave },
        update: { valor: valorStr },
        create: { clave, valor: valorStr }
      })
    })

    await Promise.all(promises)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
