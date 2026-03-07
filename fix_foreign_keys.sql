-- ============================================
-- Script para Configurar DELETE CASCADE
-- PowerTrack - Eliminación de Usuarios
-- ============================================

-- ⚠️⚠️⚠️ ADVERTENCIA ⚠️⚠️⚠️
-- 
-- SI YA USAS PRISMA, NO EJECUTES ESTE ARCHIVO
-- 
-- En su lugar:
-- 1. El schema.prisma ya fue actualizado
-- 2. Sigue la guía en MIGRACION_SEGURA_PRISMA.md
-- 3. Ejecuta: npx prisma migrate dev --name add_cascade_to_user_relations
--
-- Este archivo SQL manual es SOLO para proyectos sin Prisma
--
-- ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

-- IMPORTANTE: 
-- 1. Haz un BACKUP de tu base de datos antes de ejecutar este script
-- 2. Reemplaza 'powertrack' con el nombre real de tu base de datos
-- 3. Ejecuta este script en MySQL Workbench o desde la consola de MySQL

USE powertrack; -- Reemplaza con tu DB

-- ============================================
-- PASO 1: Verificar Foreign Keys Actuales
-- ============================================

SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'usuarios'
ORDER BY TABLE_NAME;

-- NOTA: Anota los nombres exactos de las constraints que aparezcan
-- Los nombres pueden ser diferentes a los que uso abajo

-- ============================================
-- PASO 2: Desactivar Checks Temporalmente
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- ============================================
-- PASO 3: Actualizar Foreign Keys
-- ============================================

-- TABLA: dispositivos
-- Usuario propietario del dispositivo
ALTER TABLE dispositivos 
DROP FOREIGN KEY IF EXISTS dispositivos_ibfk_1;

ALTER TABLE dispositivos 
ADD CONSTRAINT dispositivos_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: grupos
-- Usuario propietario del grupo
ALTER TABLE grupos 
DROP FOREIGN KEY IF EXISTS fk_grupos_usuario;

ALTER TABLE grupos 
ADD CONSTRAINT fk_grupos_usuario 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: sensores
-- Usuario propietario del sensor
-- NOTA: Verifica el nombre de la constraint en tu DB
ALTER TABLE sensores 
DROP FOREIGN KEY IF EXISTS sensores_ibfk_1;

ALTER TABLE sensores 
ADD CONSTRAINT sensores_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: alertas
-- Usuario propietario de la alerta
ALTER TABLE alertas 
DROP FOREIGN KEY IF EXISTS alertas_ibfk_1;

ALTER TABLE alertas 
ADD CONSTRAINT alertas_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: configuracion_ahorro
-- Usuario propietario de la configuración
ALTER TABLE configuracion_ahorro 
DROP FOREIGN KEY IF EXISTS configuracion_ahorro_ibfk_1;

ALTER TABLE configuracion_ahorro 
ADD CONSTRAINT configuracion_ahorro_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: recuperacion_password
-- Tokens de recuperación del usuario
ALTER TABLE recuperacion_password 
DROP FOREIGN KEY IF EXISTS recuperacion_password_ibfk_1;

ALTER TABLE recuperacion_password 
ADD CONSTRAINT recuperacion_password_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: reportes
-- Reportes generados por el usuario
ALTER TABLE reportes 
DROP FOREIGN KEY IF EXISTS reportes_ibfk_1;

ALTER TABLE reportes 
ADD CONSTRAINT reportes_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- TABLA: dashboard_layouts (si existe)
-- Layouts del dashboard del usuario
ALTER TABLE dashboard_layouts 
DROP FOREIGN KEY IF EXISTS dashboard_layouts_ibfk_1;

ALTER TABLE dashboard_layouts 
ADD CONSTRAINT dashboard_layouts_ibfk_1 
FOREIGN KEY (usuario_id) 
REFERENCES usuarios(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- ============================================
-- PASO 4: Reactivar Checks
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ============================================
-- PASO 5: Verificar Cambios
-- ============================================

SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'usuarios'
ORDER BY TABLE_NAME;

-- RESULTADO ESPERADO: Todas las constraints deben tener DELETE_RULE = 'CASCADE'

-- ============================================
-- PASO 6: Test (OPCIONAL - Solo en desarrollo)
-- ============================================

-- Crear usuario de prueba
-- INSERT INTO usuarios (nombre, correo, contraseña, id_proveedor) 
-- VALUES ('Test Delete', 'testdelete@test.com', '$2b$08$hashedpassword', 1);

-- Obtener el ID del usuario de prueba
-- SELECT id FROM usuarios WHERE correo = 'testdelete@test.com';

-- Eliminar usuario de prueba (reemplaza 999 con el ID real)
-- DELETE FROM usuarios WHERE id = 999;

-- Verificar que los datos relacionados también se eliminaron
-- SELECT * FROM dispositivos WHERE usuario_id = 999; -- Debe estar vacío
-- SELECT * FROM grupos WHERE usuario_id = 999; -- Debe estar vacío

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. Si recibes error "Cannot drop constraint", es porque el nombre 
   de la constraint es diferente. Usa el query de verificación 
   para obtener el nombre exacto.

2. Si recibes error "Unknown table", esa tabla no existe en tu DB.
   Comenta esa sección del script.

3. Si usas Prisma, es mejor usar:
   npx prisma db push
   
4. Este script es seguro porque usa "IF EXISTS" para evitar errores
   si las constraints no existen.

5. SIEMPRE haz backup antes de modificar la estructura de la BD.

6. Después de ejecutar, prueba eliminar un usuario de prueba 
   para verificar que funciona correctamente.
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Si algo sale mal, puedes ver todas las foreign keys así:
/*
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
*/

-- Para ver constraints específicas de una tabla:
/*
SHOW CREATE TABLE dispositivos;
*/
