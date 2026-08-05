# 🎯 GUÍA: Migración Segura de Foreign Keys con Prisma

## ✅ Lo que acabo de hacer

Actualicé el `schema.prisma` para agregar `onDelete: Cascade` en las relaciones que faltaban:

1. **Sensor → Usuario**: Ahora tiene `onDelete: Cascade`
2. **DashboardLayout → Usuario**: Ahora tiene relación completa con `onDelete: Cascade`

---

## 🚀 Pasos para Aplicar la Migración (SIN PERDER DATOS)

### ⚠️ IMPORTANTE: Haz Backup Primero

```bash
# Opción 1: Backup completo de MySQL
mysqldump -u root -p powertrack > backup_antes_migracion.sql

# Opción 2: Backup solo estructura (si DB es muy grande)
mysqldump -u root -p powertrack --no-data > backup_estructura.sql
```

---

### 📋 Paso 1: Verificar la Variable de Entorno

Asegúrate que tu `.env` tiene la conexión correcta:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/powertrack"
```

---

### 📋 Paso 2: Crear la Migración

```bash
# Esto crea la migración pero NO la aplica aún
npx prisma migrate dev --name add_cascade_to_user_relations --create-only
```

**Qué hace esto:**
- ✅ Crea una nueva migración en `prisma/migrations/`
- ✅ NO modifica tu base de datos aún
- ✅ Genera el SQL que se aplicará

---

### 📋 Paso 3: Revisar el SQL Generado (Opcional pero recomendado)

La migración se guarda en:
```
prisma/migrations/
  └── [fecha]_add_cascade_to_user_relations/
      └── migration.sql
```

**Ábrelo y verifica que:**
- Solo modifica foreign keys
- NO elimina datos
- Usa `ALTER TABLE` para modificar constraints

**Ejemplo de lo que deberías ver:**
```sql
-- AlterTable sensores
ALTER TABLE `sensores` ADD INDEX `usuario_id`(`usuario_id`);

-- AddForeignKey dashboards
ALTER TABLE `dashboard_layouts` ADD CONSTRAINT `dashboard_layouts_usuario_id_fkey` 
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- RecreateForeignKey sensores
ALTER TABLE `sensores` DROP FOREIGN KEY `sensores_usuario_id_fkey`;
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_usuario_id_fkey` 
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) 
ON DELETE CASCADE ON UPDATE NO ACTION;
```

---

### 📋 Paso 4: Aplicar la Migración

```bash
# Aplica la migración a tu base de datos
npx prisma migrate deploy
```

**Qué hace esto:**
- ✅ Ejecuta el SQL generado
- ✅ Modifica las foreign keys
- ✅ **NO elimina ni modifica datos existentes**
- ✅ Solo cambia las reglas de eliminación en cascada

---

### 📋 Paso 5: Generar el Cliente de Prisma (Opcional)

Si usas Prisma Client en tu código:

```bash
npx prisma generate
```

---

### 📋 Paso 6: Verificar que Funcionó

```bash
# Ver el estado de las migraciones
npx prisma migrate status

# Debería mostrar: "Database schema is up to date!"
```

---

## 🧪 Probar la Eliminación de Usuario

Ahora prueba eliminar un usuario de prueba:

### Opción 1: Desde el Frontend
1. Crea un usuario de prueba
2. Asigna algunos dispositivos/grupos
3. Intenta eliminarlo con el flujo normal
4. Debería funcionar sin errores

### Opción 2: Desde el Backend (cURL)
```bash
curl -X DELETE http://localhost:5051/user/ID_USUARIO_PRUEBA \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmacion": "Confirmar"}'
```

---

## ❓ Preguntas Frecuentes

### ¿Voy a perder datos?
**NO.** Las migraciones de Prisma solo modifican la estructura (foreign keys), no los datos.

### ¿Qué pasa si algo sale mal?
Restaura el backup:
```bash
mysql -u root -p powertrack < backup_antes_migracion.sql
```

### ¿Puedo revertir la migración?
No directamente, pero puedes:
1. Restaurar el backup
2. O modificar manualmente las foreign keys de vuelta

### ¿Esto afecta a producción?
Solo si aplicas la migración en producción. Por ahora está solo en desarrollo.

---

## 🎯 Resumen de Comandos

```bash
# 1. Backup (recomendado)
mysqldump -u root -p powertrack > backup.sql

# 2. Crear migración (sin aplicar)
npx prisma migrate dev --name add_cascade_to_user_relations --create-only

# 3. Revisar SQL generado
cat prisma/migrations/[fecha]_add_cascade_to_user_relations/migration.sql

# 4. Aplicar migración
npx prisma migrate deploy

# 5. Verificar estado
npx prisma migrate status

# 6. Probar eliminación de usuario
curl -X DELETE http://localhost:5051/user/ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmacion": "Confirmar"}'
```

---

## 🚨 Si Tienes Problemas

### Error: "P3009: migrate found failed migration"
```bash
# Marcar como resuelto
npx prisma migrate resolve --applied [nombre_migracion]
```

### Error: "Database is not empty"
Es normal si ya tienes datos. Usa `migrate dev` en lugar de `migrate reset`.

### Error: Foreign key constraint fails
Esto significa que hay datos inconsistentes. Verifica:
```sql
-- Ver usuarios sin proveedor válido (si existe)
SELECT * FROM usuarios WHERE id_proveedor NOT IN (SELECT id FROM proveedores);
```

---

## ✅ Verificación Final

Después de aplicar la migración, ejecuta esto en MySQL:

```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE TABLE_SCHEMA = 'powertrack'
  AND REFERENCED_TABLE_NAME = 'usuarios';
```

**Resultado esperado**: Todas las foreign keys deben tener `DELETE_RULE = 'CASCADE'`

---

## 📝 Notas Importantes

1. **Prisma es la forma correcta** - No uses SQL manual si ya usas Prisma
2. **Las migraciones son seguras** - Solo modifican estructura, no datos
3. **Siempre haz backup** - Por si acaso
4. **Usa `migrate dev`** en desarrollo
5. **Usa `migrate deploy`** en producción (cuando esté listo)

---

¡Listo! Ahora puedes aplicar la migración sin miedo. **NO perderás datos**. 🎉
