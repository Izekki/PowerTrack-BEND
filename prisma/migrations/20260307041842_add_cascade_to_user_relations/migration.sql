-- DropForeignKey
ALTER TABLE `sensores` DROP FOREIGN KEY `sensores_usuario_id_fkey`;

-- CreateIndex
CREATE INDEX `usuario_id` ON `dashboard_layouts`(`usuario_id`);

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dashboard_layouts` ADD CONSTRAINT `dashboard_layouts_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `sensores` RENAME INDEX `sensores_usuario_id_idx` TO `usuario_id`;
