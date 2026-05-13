/*
  Warnings:

  - You are about to alter the column `nivel` on the `alertas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `clave_alerta` on the `configuracion_ahorro` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `nombre` on the `dispositivos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `ubicacion` on the `dispositivos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - The primary key for the `dispositivos_agrupados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `nombre` on the `grupos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `proveedores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `region` on the `proveedores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `mac_address` on the `sensores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `clave` on the `tipos_alerta` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `nombre` on the `tipos_alerta` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `tipos_dispositivos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `correo` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - A unique constraint covering the columns `[mac_address,usuario_id]` on the table `sensores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clave]` on the table `tipos_alerta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `dispositivos_agrupados` table without a default value. This is not possible if the table is not empty.
  - Made the column `cargo_fijo` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cargo_variable` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cargo_distribucion` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cargo_capacidad` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `demanda_minima` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `factor_carga` on table `proveedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo` on table `sensores` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `alertas` DROP FOREIGN KEY `alertas_dispositivo_id_fkey`;

-- DropForeignKey
ALTER TABLE `alertas` DROP FOREIGN KEY `alertas_id_tipo_dispositivo_fkey`;

-- DropForeignKey
ALTER TABLE `alertas` DROP FOREIGN KEY `alertas_tipo_alerta_id_fkey`;

-- DropForeignKey
ALTER TABLE `alertas` DROP FOREIGN KEY `alertas_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `configuracion_ahorro` DROP FOREIGN KEY `configuracion_ahorro_dispositivo_id_fkey`;

-- DropForeignKey
ALTER TABLE `configuracion_ahorro` DROP FOREIGN KEY `configuracion_ahorro_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `dispositivos` DROP FOREIGN KEY `dispositivos_id_grupo_fkey`;

-- DropForeignKey
ALTER TABLE `dispositivos` DROP FOREIGN KEY `dispositivos_id_tipo_dispositivo_fkey`;

-- DropForeignKey
ALTER TABLE `dispositivos` DROP FOREIGN KEY `dispositivos_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `dispositivos_agrupados` DROP FOREIGN KEY `dispositivos_agrupados_dispositivo_id_fkey`;

-- DropForeignKey
ALTER TABLE `dispositivos_agrupados` DROP FOREIGN KEY `dispositivos_agrupados_grupo_id_fkey`;

-- DropForeignKey
ALTER TABLE `grupos` DROP FOREIGN KEY `grupos_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `mediciones` DROP FOREIGN KEY `mediciones_sensor_id_fkey`;

-- DropForeignKey
ALTER TABLE `recuperacion_passwords` DROP FOREIGN KEY `recuperacion_passwords_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `sensores` DROP FOREIGN KEY `sensores_dispositivo_id_fkey`;

-- DropForeignKey
ALTER TABLE `sensores` DROP FOREIGN KEY `sensores_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_id_proveedor_fkey`;

-- DropIndex
DROP INDEX `proveedores_nombre_key` ON `proveedores`;

-- DropIndex
DROP INDEX `sensores_mac_address_key` ON `sensores`;

-- AlterTable
ALTER TABLE `alertas` MODIFY `mensaje` VARCHAR(255) NOT NULL,
    MODIFY `nivel` ENUM('Bajo', 'Medio', 'Alto') NOT NULL,
    MODIFY `fecha` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `configuracion_ahorro` MODIFY `minimo` DECIMAL(10, 2) NULL,
    MODIFY `maximo` DECIMAL(10, 2) NULL,
    MODIFY `clave_alerta` VARCHAR(20) NULL,
    MODIFY `mensaje` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `dispositivos` ADD COLUMN `id_sensor` INTEGER NULL,
    MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `ubicacion` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `dispositivos_agrupados` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `grupos` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `mediciones` MODIFY `sensor_id` INTEGER NULL,
    MODIFY `voltaje` DECIMAL(5, 2) NULL,
    MODIFY `corriente` DECIMAL(5, 2) NULL,
    MODIFY `potencia` DECIMAL(6, 2) NULL,
    MODIFY `factor_potencia` DECIMAL(4, 2) NULL,
    MODIFY `fecha_hora` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `proveedores` MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `cargo_fijo` DECIMAL(10, 2) NOT NULL,
    MODIFY `cargo_variable` DECIMAL(10, 2) NOT NULL,
    MODIFY `cargo_distribucion` DECIMAL(10, 2) NOT NULL,
    MODIFY `cargo_capacidad` DECIMAL(10, 2) NOT NULL,
    MODIFY `region` VARCHAR(100) NULL,
    MODIFY `demanda_minima` DECIMAL(10, 2) NOT NULL,
    MODIFY `factor_carga` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `recuperacion_passwords` ADD COLUMN `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `token` VARCHAR(255) NOT NULL,
    MODIFY `fecha_expiracion` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `sensores` ADD COLUMN `fecha_instalacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `mac_address` VARCHAR(50) NOT NULL,
    MODIFY `tipo` VARCHAR(50) NOT NULL,
    MODIFY `asignado` BOOLEAN NULL DEFAULT false,
    MODIFY `usuario_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `tipos_alerta` ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `fecha_creacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `clave` VARCHAR(50) NOT NULL,
    MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `icono_svg` TEXT NULL;

-- AlterTable
ALTER TABLE `tipos_dispositivos` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `correo` VARCHAR(100) NOT NULL,
    MODIFY `contraseña` VARCHAR(255) NOT NULL,
    MODIFY `fecha_registro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `reportes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `tipo_reporte` ENUM('Diario', 'Semanal', 'Mensual') NULL,
    `fecha_generacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `datos` BLOB NOT NULL,

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboard_layouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `layout_json` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `dashboard_layouts_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `clave_alerta` ON `configuracion_ahorro`(`clave_alerta`);

-- CreateIndex
CREATE INDEX `grupo_id` ON `dispositivos_agrupados`(`grupo_id`);

-- CreateIndex
CREATE UNIQUE INDEX `mac_address` ON `sensores`(`mac_address`, `usuario_id`);

-- CreateIndex
CREATE UNIQUE INDEX `tipos_alerta_clave_key` ON `tipos_alerta`(`clave`);

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_proveedor_fkey` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grupos` ADD CONSTRAINT `fk_grupos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `dispositivos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `dispositivos_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupos`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dispositivos` ADD CONSTRAINT `fk_dispositivo_tipo` FOREIGN KEY (`id_tipo_dispositivo`) REFERENCES `tipos_dispositivos`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dispositivos_agrupados` ADD CONSTRAINT `dispositivos_agrupados_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dispositivos_agrupados` ADD CONSTRAINT `dispositivos_agrupados_ibfk_2` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_ibfk_1` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mediciones` ADD CONSTRAINT `mediciones_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_dispositivo` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_tipo_alertas` FOREIGN KEY (`tipo_alerta_id`) REFERENCES `tipos_alerta`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `alertas` ADD CONSTRAINT `fk_alertas_tipo_dispositivo` FOREIGN KEY (`id_tipo_dispositivo`) REFERENCES `tipos_dispositivos`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `configuracion_ahorro` ADD CONSTRAINT `configuracion_ahorro_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `configuracion_ahorro` ADD CONSTRAINT `configuracion_ahorro_ibfk_2` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `configuracion_ahorro` ADD CONSTRAINT `configuracion_ahorro_ibfk_3` FOREIGN KEY (`clave_alerta`) REFERENCES `tipos_alerta`(`clave`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `recuperacion_passwords` ADD CONSTRAINT `recuperacion_passwords_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `alertas` RENAME INDEX `alertas_dispositivo_id_idx` TO `fk_alertas_dispositivo`;

-- RenameIndex
ALTER TABLE `alertas` RENAME INDEX `alertas_id_tipo_dispositivo_idx` TO `fk_alertas_tipo_dispositivo`;

-- RenameIndex
ALTER TABLE `alertas` RENAME INDEX `alertas_tipo_alerta_id_idx` TO `fk_alertas_tipo_alertas`;

-- RenameIndex
ALTER TABLE `alertas` RENAME INDEX `alertas_usuario_id_idx` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `configuracion_ahorro` RENAME INDEX `configuracion_ahorro_dispositivo_id_idx` TO `dispositivo_id`;

-- RenameIndex
ALTER TABLE `configuracion_ahorro` RENAME INDEX `configuracion_ahorro_usuario_id_idx` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `dispositivos` RENAME INDEX `dispositivos_id_grupo_idx` TO `id_grupo`;

-- RenameIndex
ALTER TABLE `dispositivos` RENAME INDEX `dispositivos_usuario_id_idx` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `dispositivos_agrupados` RENAME INDEX `dispositivos_agrupados_dispositivo_id_idx` TO `dispositivo_id`;

-- RenameIndex
ALTER TABLE `grupos` RENAME INDEX `grupos_usuario_id_idx` TO `fk_grupos_usuario`;

-- RenameIndex
ALTER TABLE `mediciones` RENAME INDEX `mediciones_sensor_id_idx` TO `sensor_id`;

-- RenameIndex
ALTER TABLE `recuperacion_passwords` RENAME INDEX `recuperacion_passwords_token_key` TO `token_unique`;

-- RenameIndex
ALTER TABLE `recuperacion_passwords` RENAME INDEX `recuperacion_passwords_usuario_id_idx` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `sensores` RENAME INDEX `sensores_dispositivo_id_idx` TO `dispositivo_id`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `usuarios_id_proveedor_fkey` TO `id_proveedor`;
