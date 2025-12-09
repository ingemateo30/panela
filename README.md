# 🍯 Sistema de Gestión de Inventario para Fincas Paneleras

Sistema completo y profesional de gestión de inventarios, producción y ventas para fincas paneleras colombianas. Desarrollado con tecnologías modernas para facilitar el control total de tu operación.

## 🎯 Características Principales

### 📦 Gestión de Producción
- Registro detallado de lotes de panela con códigos QR únicos
- Control de costos por categorías (caña, mano de obra, energía, empaques, transporte)
- Cálculo automático de precios con márgenes de utilidad configurables
- Trazabilidad completa de cada lote producido
- Estados de lote: Producción → Disponible → Vendido/Caducado

### 👥 Gestión de Proveedores
- Registro completo de proveedores con información de contacto
- Historial de compras y transacciones
- Estadísticas de desempeño por proveedor
- Control de proveedores activos/inactivos

### 📊 Inventario de Insumos
- Control de stock en tiempo real
- Alertas automáticas de stock bajo
- Registro de movimientos (entradas/salidas)
- Seguimiento de costos unitarios
- Historial completo de movimientos

### 💰 Ventas y Rentabilidad
- Registro de ventas por lote
- Seguimiento de clientes
- Análisis de rentabilidad por lote
- Cálculo automático de márgenes de utilidad

### 📈 Analíticas Avanzadas
- Gráficos interactivos de producción mensual
- Análisis de costos por categoría
- Comparativo de ventas vs producción
- Rendimiento por operario
- Top proveedores por volumen y gasto
- Análisis de rentabilidad mensual

### 📄 Reportes Profesionales
- Exportación a PDF y Excel
- Reportes de producción, ventas, compras
- Reportes de inventario de insumos
- Reportes de proveedores activos
- Comparativas mes a mes

### 🔐 Seguridad y Roles
- Autenticación con NextAuth.js
- Dos roles: ADMIN y OPERARIO
- Control de acceso por páginas
- Sesiones seguras con JWT

### ⚙️ Configuración
- Parámetros personalizables del negocio
- Configuración de márgenes de utilidad
- Alertas configurables de stock
- Formato de códigos de lote personalizable

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **Recharts** - Gráficos interactivos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend
- **Next.js API Routes** - Endpoints RESTful
- **Prisma ORM** - Gestión de base de datos
- **MySQL** - Base de datos relacional
- **NextAuth.js** - Autenticación
- **bcryptjs** - Hash de contraseñas

### Utilidades
- **jsPDF** - Generación de PDFs
- **xlsx** - Exportación a Excel
- **qrcode** - Generación de códigos QR
- **date-fns** - Manejo de fechas

## 📋 Requisitos Previos

- Node.js 18+
- MySQL 8+
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd panela
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/panela_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aleatorio-muy-seguro"

# Node Environment
NODE_ENV="development"
```

4. **Configurar la base de datos**

```bash
# Crear la base de datos y ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de prueba
npx prisma db seed
```

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

6. **Abrir en el navegador**

Visitar [http://localhost:3000](http://localhost:3000)

## 👤 Usuarios de Prueba

El sistema incluye usuarios de prueba después de ejecutar el seed:

### Administrador
- **Email:** admin@panela.com
- **Contraseña:** admin123
- **Permisos:** Acceso completo a todas las funcionalidades

### Operario
- **Email:** operario@panela.com
- **Contraseña:** operario123
- **Permisos:** Acceso a operaciones diarias (sin reportes ni configuración)

## 📁 Estructura del Proyecto

```
panela/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts                # Datos de prueba
├── public/                    # Archivos estáticos
├── src/
│   ├── app/                   # Pages y API Routes (App Router)
│   │   ├── api/              # Endpoints de la API
│   │   │   ├── analytics/    # Analíticas
│   │   │   ├── auth/         # Autenticación
│   │   │   ├── compras/      # Gestión de compras
│   │   │   ├── configuracion/# Configuración
│   │   │   ├── dashboard/    # Stats del dashboard
│   │   │   ├── insumos/      # Gestión de insumos
│   │   │   ├── lotes/        # Gestión de lotes
│   │   │   ├── proveedores/  # Gestión de proveedores
│   │   │   └── ventas/       # Gestión de ventas
│   │   ├── analytics/        # Página de analíticas
│   │   ├── configuracion/    # Página de configuración
│   │   ├── dashboard/        # Página principal
│   │   ├── insumos/          # Gestión de insumos
│   │   ├── login/            # Autenticación
│   │   ├── lotes/            # Gestión de lotes
│   │   ├── produccion/       # Vista de producción
│   │   ├── proveedores/      # Gestión de proveedores
│   │   ├── reportes/         # Reportes
│   │   └── trazabilidad/     # Trazabilidad por QR
│   ├── components/           # Componentes React
│   │   ├── charts/          # Gráficos
│   │   ├── forms/           # Formularios
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Componentes base
│   └── lib/                 # Utilidades y helpers
│       ├── auth.ts          # Configuración de auth
│       ├── calculations.ts  # Cálculos de negocio
│       ├── cost-calculator.ts # Calculadora de costos
│       ├── exporters.ts     # Exportación PDF/Excel
│       ├── formatters.ts    # Formateadores
│       ├── prisma.ts        # Cliente Prisma
│       ├── qr-generator.ts  # Generador de QR
│       ├── utils.ts         # Utilidades generales
│       └── validations.ts   # Validaciones
└── tailwind.config.ts       # Configuración de Tailwind
```

## 🎨 Paleta de Colores "Panela"

El sistema utiliza una paleta de colores inspirada en la panela:

- **Panela 50-900:** Tonos cálidos de marrón y caramelo
- **Diseño:** Interfaz limpia y profesional con énfasis en usabilidad

## 🗄️ Modelo de Datos

### Entidades Principales

1. **User** - Usuarios del sistema (Admin/Operario)
2. **Lote** - Lotes de panela producidos
3. **Proveedor** - Proveedores de materias primas
4. **Compra** - Compras a proveedores
5. **Insumo** - Insumos para producción
6. **InsumoMovimiento** - Movimientos de insumos
7. **Venta** - Ventas de lotes
8. **Configuracion** - Configuraciones del sistema

Ver `prisma/schema.prisma` para el esquema completo.

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión

### Lotes
- `GET /api/lotes` - Listar lotes
- `POST /api/lotes` - Crear lote
- `GET /api/lotes/:id` - Obtener lote
- `PUT /api/lotes/:id` - Actualizar lote
- `DELETE /api/lotes/:id` - Eliminar lote

### Proveedores
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores` - Crear proveedor
- `PUT /api/proveedores/:id` - Actualizar proveedor
- `DELETE /api/proveedores/:id` - Desactivar proveedor

### Insumos
- `GET /api/insumos` - Listar insumos
- `POST /api/insumos` - Crear insumo
- `POST /api/insumos/:id/movimientos` - Registrar movimiento

### Compras y Ventas
- `GET /api/compras` - Listar compras
- `POST /api/compras` - Registrar compra
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Registrar venta

### Analytics y Reportes
- `GET /api/analytics` - Datos de analíticas
- `GET /api/dashboard/inventory-stats` - Stats de inventario
- `GET /api/dashboard/sales-stats` - Stats de ventas

### Configuración
- `GET /api/configuracion` - Obtener configuración
- `POST /api/configuracion` - Guardar configuración

## 📱 Funcionalidades por Página

### Dashboard (`/dashboard`)
- Resumen de estadísticas principales
- Alertas de stock bajo
- Gráficos de inventario y producción
- Actividad reciente

### Lotes (`/lotes`)
- Listado de lotes con filtros
- Creación de nuevos lotes
- Exportación a PDF/Excel
- Visualización de costos y precios

### Proveedores (`/proveedores`)
- Gestión completa de proveedores
- Historial de compras
- Estadísticas por proveedor
- Registro de nuevas compras

### Insumos (`/insumos`)
- Control de inventario
- Movimientos de entrada/salida
- Alertas de stock bajo
- Seguimiento de costos

### Producción (`/produccion`)
- Vista general de producción
- Estadísticas mensuales
- Producción por operario
- Lotes recientes

### Reportes (`/reportes`)
- Generación de reportes
- Exportación múltiple
- Comparativas mensuales
- Alertas de inventario

### Analíticas (`/analytics`)
- Gráficos interactivos
- Análisis de rentabilidad
- Distribución de costos
- Rendimiento por operario
- Top proveedores

### Configuración (`/configuracion`)
- Información de la empresa
- Márgenes de utilidad
- Configuración de alertas
- Formato de códigos

### Trazabilidad (`/trazabilidad/:codigo`)
- Vista pública de lotes
- Información completa del lote
- Código QR generado
- Historial de ventas

## 🚢 Despliegue en Producción

### 1. Variables de Entorno

Configurar las siguientes variables en tu servicio de hosting:

```env
DATABASE_URL="mysql://[usuario]:[contraseña]@[host]:[puerto]/[database]"
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="[generar-secret-seguro]"
NODE_ENV="production"
```

### 2. Build del Proyecto

```bash
npm run build
```

### 3. Iniciar en Producción

```bash
npm start
```

### Plataformas Recomendadas

- **Vercel** - Deploy automático con integración Git
- **Railway** - Fácil deploy con base de datos incluida
- **DigitalOcean App Platform** - Control completo con droplets
- **AWS/Azure/GCP** - Para empresas con necesidades específicas

## 🧪 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm start            # Iniciar servidor de producción
npm run lint         # Linter de código
npx prisma studio    # Interfaz visual de la DB
npx prisma migrate   # Gestionar migraciones
npx prisma generate  # Generar cliente Prisma
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Soporte y Contribuciones

Para reportar bugs o solicitar funcionalidades, por favor crear un issue en el repositorio.

## 🙏 Agradecimientos

Desarrollado con ❤️ para apoyar a las fincas paneleras colombianas en la digitalización de sus procesos.

---

**Sistema de Gestión de Inventario para Fincas Paneleras** - v1.0.0
