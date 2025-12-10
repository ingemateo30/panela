// Tipos de Prisma generados manualmente basados en schema.prisma
// Este archivo es temporal hasta que se pueda ejecutar prisma generate

export enum Role {
  ADMIN = 'ADMIN',
  OPERARIO = 'OPERARIO'
}

export enum EstadoLote {
  PRODUCCION = 'PRODUCCION',
  DISPONIBLE = 'DISPONIBLE',
  VENDIDO = 'VENDIDO',
  CADUCADO = 'CADUCADO'
}

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export interface User {
  id: string
  email: string
  name: string | null
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Lote {
  id: string
  codigo: string
  cantidad: number
  fechaProduccion: Date
  costoCana: number
  costoManoObra: number
  costoEnergia: number
  costoEmpaques: number
  costoTransporte: number
  costoTotal: number
  margenUtilidad: number
  precioSugerido: number
  estado: EstadoLote
  descripcion: string | null
  observaciones: string | null
  usuarioId: string
  createdAt: Date
  updatedAt: Date
}

export interface Venta {
  id: string
  loteId: string
  cantidad: number
  precioUnitario: number
  total: number
  cliente: string | null
  fecha: Date
  observaciones: string | null
}

export interface Proveedor {
  id: string
  nombre: string
  contacto: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Compra {
  id: string
  proveedorId: string
  cantidad: number
  precioUnitario: number
  total: number
  fecha: Date
  observaciones: string | null
}

export interface Insumo {
  id: string
  nombre: string
  descripcion: string | null
  unidadMedida: string
  stockMinimo: number
  stockActual: number
  costoUnitario: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InsumoMovimiento {
  id: string
  insumoId: string
  tipo: TipoMovimiento
  cantidad: number
  motivo: string | null
  fecha: Date
  usuarioId: string
}

export interface Configuracion {
  id: string
  clave: string
  valor: string
}
