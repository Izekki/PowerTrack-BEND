-- CreateTable
CREATE TABLE `preferencias_usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `nivel_contraste` VARCHAR(20) NOT NULL DEFAULT 'normal',
    `theme` VARCHAR(10) NOT NULL DEFAULT 'light',
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `preferencias_usuario_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `preferencias_usuario` ADD CONSTRAINT `preferencias_usuario_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
