import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@panela.com' },
    update: {},
    create: {
      email: 'admin@panela.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Crear usuario operario
  const operarioPassword = await bcrypt.hash('operario123', 12)
  
  const operario = await prisma.user.upsert({
    where: { email: 'operario@panela.com' },
    update: {},
    create: {
      email: 'operario@panela.com',
      name: 'Operario',
      password: operarioPassword,
      role: 'OPERARIO',
    },
  })

  // Crear proveedores de ejemplo
  const proveedor1 = await prisma.proveedor.create({
    data: {
      nombre: 'Finca La Esperanza',
      contacto: 'Carlos Rodríguez',
      telefono: '+57 300 123 4567',
      email: 'carlos@fincaesperanza.com',
      direccion: 'Vereda El Trapiche, Santander',
    },
  })

  const proveedor2 = await prisma.proveedor.create({
    data: {
      nombre: 'Cooperativa Panelera',
      contacto: 'María González',
      telefono: '+57 301 987 6543',
      email: 'maria@cooppanelera.com',
      direccion: 'Centro, Barbosa, Santander',
    },
  })

  // Crear insumos básicos
  const insumos = [
    {
      nombre: 'Bolsas de 500g',
      descripcion: 'Bolsas plásticas para empaque de panela',
      unidadMedida: 'unidades',
      stockMinimo: 100,
      stockActual: 500,
      costoUnitario: 50,
    },
    {
      nombre: 'Etiquetas adhesivas',
      descripcion: 'Etiquetas con información del producto',
      unidadMedida: 'unidades',
      stockMinimo: 50,
      stockActual: 200,
      costoUnitario: 25,
    },
    {
      nombre: 'Cajas de cartón',
      descripcion: 'Cajas para transporte de panela',
      unidadMedida: 'unidades',
      stockMinimo: 20,
      stockActual: 100,
      costoUnitario: 1500,
    },
  ]

  for (const insumo of insumos) {
    await prisma.insumo.create({ data: insumo })
  }

  // Crear compras de ejemplo
  await prisma.compra.create({
    data: {
      proveedorId: proveedor1.id,
      cantidad: 100,
      precioUnitario: 3500,
      total: 350000,
      observaciones: 'Panela de alta calidad',
    },
  })

  await prisma.compra.create({
    data: {
      proveedorId: proveedor2.id,
      cantidad: 150,
      precioUnitario: 3200,
      total: 480000,
      observaciones: 'Entrega puntual',
    },
  })

  // Configuraciones del sistema
  const configuraciones = [
    { clave: 'MARGEN_UTILIDAD_DEFAULT', valor: '20' },
    { clave: 'EMPRESA_NOMBRE', valor: 'Mi Empresa Panelera' },
    { clave: 'EMPRESA_DIRECCION', valor: 'Socorro, Santander' },
    { clave: 'EMPRESA_TELEFONO', valor: '+57 300 000 0000' },
  ]

  for (const config of configuraciones) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: { valor: config.valor },
      create: config,
    })
  }

  console.log('✅ Seed completado!')
  console.log('👤 Admin: admin@panela.com / admin123')
  console.log('👤 Operario: operario@panela.com / operario123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })