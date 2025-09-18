-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OPERARIO') NOT NULL DEFAULT 'OPERARIO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `contacto` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` VARCHAR(191) NOT NULL,
    `proveedorId` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `precioUnitario` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotes` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `fechaProduccion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `costoCana` DOUBLE NOT NULL,
    `costoManoObra` DOUBLE NOT NULL,
    `costoEnergia` DOUBLE NOT NULL,
    `costoEmpaques` DOUBLE NOT NULL,
    `costoTransporte` DOUBLE NOT NULL,
    `costoTotal` DOUBLE NOT NULL,
    `margenUtilidad` DOUBLE NOT NULL DEFAULT 20,
    `precioSugerido` DOUBLE NOT NULL,
    `estado` ENUM('PRODUCCION', 'DISPONIBLE', 'VENDIDO', 'CADUCADO') NOT NULL DEFAULT 'PRODUCCION',
    `descripcion` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lotes_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumos` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `unidadMedida` VARCHAR(191) NOT NULL,
    `stockMinimo` INTEGER NOT NULL DEFAULT 0,
    `stockActual` INTEGER NOT NULL DEFAULT 0,
    `costoUnitario` DOUBLE NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `insumos_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumo_movimientos` (
    `id` VARCHAR(191) NOT NULL,
    `insumoId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ENTRADA', 'SALIDA') NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventas` (
    `id` VARCHAR(191) NOT NULL,
    `loteId` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `precioUnitario` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `cliente` VARCHAR(191) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observaciones` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracion` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `configuracion_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `proveedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumo_movimientos` ADD CONSTRAINT `insumo_movimientos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumo_movimientos` ADD CONSTRAINT `insumo_movimientos_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `insumos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `lotes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
