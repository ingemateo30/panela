import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Download, Eye, QrCode } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LotesFilters } from '@/components/lotes/lotes-filters'
import { ExportButton } from '@/components/ui/export-button'

interface SearchParams {
    estado?: string
    fechaDesde?: string
    fechaHasta?: string
    page?: string
}
interface Where {
    estado?: string;
    fechaProduccion?: {
        gte?: Date;
        lte?: Date;
    };
}

interface Lote {
  id: string;
  codigo: string;
  estado: string;
  fechaProduccion: Date;
  cantidad: number;
  costoTotal: number;
  precioSugerido: number;
  usuario: {
    name: string;
  };
  _count: {
    ventas: number;
  };
  descripcion: string;
}

async function getLotes(searchParams: SearchParams) {
    const page = parseInt(searchParams.page || '1')
    const limit = 12
    const skip = (page - 1) * limit

    const where: Where = {};
    if (searchParams.estado && searchParams.estado !== 'todos') {
        where.estado = searchParams.estado
    }

    if (searchParams.fechaDesde) {
        where.fechaProduccion = {
            gte: new Date(searchParams.fechaDesde)
        }
    }

    if (searchParams.fechaHasta) {
        where.fechaProduccion = {
            ...where.fechaProduccion,
            lte: new Date(searchParams.fechaHasta)
        }
    }

    const [lotes, total] = await Promise.all([
        prisma.lote.findMany({
            where,
            include: {
                usuario: {
                    select: { name: true }
                },
                _count: {
                    select: { ventas: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.lote.count({ where })
    ])

    return {
        lotes,
        pagination: {
            current: page,
            total: Math.ceil(total / limit),
            totalItems: total
        }
    }
}

function getStatusBadge(estado: string) {
    const variants = {
        DISPONIBLE: { variant: 'default' as const, label: 'Disponible' },
        PRODUCCION: { variant: 'secondary' as const, label: 'En Producción' },
        VENDIDO: { variant: 'outline' as const, label: 'Vendido' },
        CADUCADO: { variant: 'destructive' as const, label: 'Caducado' }
    }

    return variants[estado as keyof typeof variants] || variants.DISPONIBLE
}

function LoteCard({ lote }: { lote: Lote }) {
    const status = getStatusBadge(lote.estado)

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        {lote.codigo}
                    </CardTitle>
                    <Badge variant={status.variant}>
                        {status.label}
                    </Badge>
                </div>
                <CardDescription>
                    Producido el {format(new Date(lote.fechaProduccion), 'dd/MM/yyyy', { locale: es })}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-gray-500">Cantidad:</span>
                        <div className="font-medium">{formatNumber(lote.cantidad)} kg</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Costo Total:</span>
                        <div className="font-medium">{formatCurrency(lote.costoTotal)}</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Precio Sugerido:</span>
                        <div className="font-medium">{formatCurrency(lote.precioSugerido)}</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Usuario:</span>
                        <div className="font-medium">{lote.usuario?.name || 'N/A'}</div>
                    </div>
                </div>

                {lote.descripcion && (
                    <div className="text-sm">
                        <span className="text-gray-500">Descripción:</span>
                        <p className="text-gray-700 mt-1">{lote.descripcion}</p>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/lotes/${(lote as { id: string }).id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/trazabilidad/${lote.codigo}`}>
                            <QrCode className="h-4 w-4 mr-1" />
                            QR
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default async function LotesPage({
    searchParams
}: {
    searchParams: Promise<SearchParams>
}) {
    const session = await getServerSession(authOptions)
    const params = await searchParams
    const { lotes, pagination } = await getLotes(params)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Lotes de Panela</h1>
                    <p className="text-gray-600">
                        Gestiona la producción y el inventario de panela
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton
                        data={lotes}
                        filename="lotes-panela"
                        type="lotes"
                    />
                    <Button asChild>
                        <Link href="/lotes/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Lote
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Cargando filtros...</div>}>
                        <LotesFilters />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Total Lotes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Cantidad Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(lotes.reduce((sum: number, l: Lote) => sum + l.costoTotal, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Valor Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {formatCurrency(lotes.reduce((sum: number, l: Lote) => sum + l.costoTotal, 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de lotes */}
            {lotes.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay lotes registrados
                        </h3>
                        <p className="text-gray-500 text-center mb-4">
                            Comienza creando tu primer lote de panela
                        </p>
                        <Button asChild>
                            <Link href="/lotes/nuevo">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Primer Lote
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                   {lotes.map((lote: Lote) => (
    <LoteCard key={lote.id} lote={lote} />
))}
                </div>
            )}

            {/* Paginación */}
            {pagination.total > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={page === pagination.current ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href={`/lotes?page=${page}`}>
                                {page}
                            </Link>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}