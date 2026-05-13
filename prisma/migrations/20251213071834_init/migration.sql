-- CreateTable
CREATE TABLE `proveedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cargo_fijo` DECIMAL(10, 2) NULL,
    `cargo_variable` DECIMAL(10, 4) NULL,
    `cargo_distribucion` DECIMAL(10, 4) NULL,
    `cargo_capacidad` DECIMAL(10, 4) NULL,
    `region` VARCHAR(191) NULL,
    `demanda_minima` DECIMAL(10, 2) NULL,
    `factor_carga` DECIMAL(6, 4) NULL,

    UNIQUE INDEX `proveedores_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contraseña` VARCHAR(191) NOT NULL,
    `id_proveedor` INTEGER NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `usuario_id` INTEGER NOT NULL,

    INDEX `grupos_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_dispositivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `consumo_minimo_w` INTEGER NULL,
    `consumo_maximo_w` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `ubicacion` VARCHAR(191) NULL,
    `usuario_id` INTEGER NOT NULL,
    `id_grupo` INTEGER NULL,
    `id_tipo_dispositivo` INTEGER NULL,

    INDEX `dispositivos_usuario_id_idx`(`usuario_id`),
    INDEX `dispositivos_id_grupo_idx`(`id_grupo`),
    INDEX `dispositivos_id_tipo_dispositivo_idx`(`id_tipo_dispositivo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mac_address` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NULL,
    `asignado` BOOLEAN NOT NULL DEFAULT false,
    `usuario_id` INTEGER NOT NULL,
    `dispositivo_id` INTEGER NULL,

    INDEX `sensores_usuario_id_idx`(`usuario_id`),
    INDEX `sensores_dispositivo_id_idx`(`dispositivo_id`),
    UNIQUE INDEX `sensores_mac_address_key`(`mac_address`),
    UNIQUE INDEX `sensores_dispositivo_id_key`(`dispositivo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mediciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sensor_id` INTEGER NOT NULL,
    `voltaje` DOUBLE NULL,
    `corriente` DOUBLE NULL,
    `potencia` DOUBLE NULL,
    `factor_potencia` DOUBLE NULL,
    `energia` DOUBLE NULL,
    `frecuencia` DOUBLE NULL,
    `fecha_hora` DATETIME(3) NOT NULL,

    INDEX `mediciones_sensor_id_idx`(`sensor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_alerta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `icono_svg` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `dispositivo_id` INTEGER NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL,
    `id_tipo_dispositivo` INTEGER NULL,
    `tipo_alerta_id` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leida` BOOLEAN NOT NULL DEFAULT false,

    INDEX `alertas_usuario_id_idx`(`usuario_id`),
    INDEX `alertas_dispositivo_id_idx`(`dispositivo_id`),
    INDEX `alertas_id_tipo_dispositivo_idx`(`id_tipo_dispositivo`),
    INDEX `alertas_tipo_alerta_id_idx`(`tipo_alerta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracion_ahorro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `dispositivo_id` INTEGER NOT NULL,
    `minimo` DOUBLE NULL,
    `maximo` DOUBLE NULL,
    `clave_alerta` VARCHAR(191) NULL,
    `mensaje` VARCHAR(191) NULL,

    INDEX `configuracion_ahorro_usuario_id_idx`(`usuario_id`),
    INDEX `configuracion_ahorro_dispositivo_id_idx`(`dispositivo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositivos_agrupados` (
    `grupo_id` INTEGER NOT NULL,
    `dispositivo_id` INTEGER NOT NULL,

    INDEX `dispositivos_agrupados_dispositivo_id_idx`(`dispositivo_id`),
    PRIMARY KEY (`grupo_id`, `dispositivo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recuperacion_passwords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `fecha_expiracion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recuperacion_passwords_token_key`(`token`),
    INDEX `recuperacion_passwords_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupos` ADD CONSTRAINT `grupos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `dispositivos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `dispositivos_id_grupo_fkey` FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `dispositivos_id_tipo_dispositivo_fkey` FOREIGN KEY (`id_tipo_dispositivo`) REFERENCES `tipos_dispositivos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_dispositivo_id_fkey` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mediciones` ADD CONSTRAINT `mediciones_sensor_id_fkey` FOREIGN KEY (`sensor_id`) REFERENCES `sensores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_dispositivo_id_fkey` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_id_tipo_dispositivo_fkey` FOREIGN KEY (`id_tipo_dispositivo`) REFERENCES `tipos_dispositivos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_tipo_alerta_id_fkey` FOREIGN KEY (`tipo_alerta_id`) REFERENCES `tipos_alerta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configuracion_ahorro` ADD CONSTRAINT `configuracion_ahorro_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configuracion_ahorro` ADD CONSTRAINT `configuracion_ahorro_dispositivo_id_fkey` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositivos_agrupados` ADD CONSTRAINT `dispositivos_agrupados_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositivos_agrupados` ADD CONSTRAINT `dispositivos_agrupados_dispositivo_id_fkey` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recuperacion_passwords` ADD CONSTRAINT `recuperacion_passwords_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
