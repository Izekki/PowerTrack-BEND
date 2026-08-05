# 🧪 GUÍA DE TESTING - Validación de Seguridad

**Objetivo:** Validar que todos los endpoints están protegidos y solo los usuarios autenticados pueden acceder a sus propios datos.

---

## 📋 Preparación Inicial

### 1. Iniciar el servidor
```bash
cd c:\Proyectos\PowerTrack-BEND
npm install  # Si es la primera vez
node app.js
```

### 2. Obtener tokens de dos usuarios diferentes

Asume que tienes dos usuarios registrados (Usuario 1 e Usuario 2).

**Registrar Usuario 1:**
```bash
POST http://localhost:5051/user/register
Content-Type: application/json

{
  "nombre": "Usuario Test 1",
  "correo": "usuario1@test.com",
  "contraseña": "Password123!",
  "proveedor": 1
}
```

**Registrar Usuario 2:**
```bash
POST http://localhost:5051/user/register
Content-Type: application/json

{
  "nombre": "Usuario Test 2",
  "correo": "usuario2@test.com",
  "contraseña": "Password123!",
  "proveedor": 1
}
```

**Login Usuario 1 (Obtener Token):**
```bash
POST http://localhost:5051/login/login
Content-Type: application/json

{
  "email": "usuario1@test.com",
  "password": "Password123!"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "userId": 1,
  "nombre": "Usuario Test 1",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Login Usuario 2 (Obtener Token):**
```bash
POST http://localhost:5051/login/login
Content-Type: application/json

{
  "email": "usuario2@test.com",
  "password": "Password123!"
}
```

---

## ✅ Test Cases

### Test 1: Acceso SIN Token (Debe retornar 401)

**Descripción:** Un endpoint debe rechazar requests sin token

```bash
GET http://localhost:5051/device/dispositivosPorUsuario/1

# SIN header Authorization
```

**Respuesta Esperada:**
```
Status: 401 Unauthorized
{
  "success": false,
  "message": "Token no proporcionado. Acceso no autorizado."
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 2: Token Inválido (Debe retornar 401)

**Descripción:** Un token expirado o inválido debe ser rechazado

```bash
GET http://localhost:5051/device/dispositivosPorUsuario/1
Authorization: Bearer invalid_token_here
```

**Respuesta Esperada:**
```
Status: 401 Unauthorized
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 3: Acceso a Datos Propios (Debe retornar 200)

**Descripción:** Usuario 1 puede acceder a sus propios dispositivos

```bash
GET http://localhost:5051/device/dispositivosPorUsuario/1
Authorization: Bearer TOKEN_USUARIO_1
```

**Respuesta Esperada:**
```
Status: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Mi Dispositivo",
      "usuario_id": 1,
      ...
    }
  ]
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 4: 🚨 CRÍTICO - Acceso a Datos de Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta acceder a dispositivos del Usuario 1 - DEBE FALLAR

```bash
GET http://localhost:5051/device/dispositivosPorUsuario/1
Authorization: Bearer TOKEN_USUARIO_2
Content-Type: application/json
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "message": "No tienes permiso para acceder a estos datos"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 5: Crear Dispositivo como Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta crear dispositivo para Usuario 1 - DEBE FALLAR

```bash
POST http://localhost:5051/device/devices
Authorization: Bearer TOKEN_USUARIO_2
Content-Type: application/json

{
  "nombre": "Dispositivo Hacker",
  "ubicacion": "Sala",
  "usuario_id": 1,
  "id_grupo": null,
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "message": "No tienes permiso para crear dispositivos para otros usuarios"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 6: Crear Dispositivo con ID Correcto (Debe retornar 201)

**Descripción:** Usuario 1 crea dispositivo para sí mismo

```bash
POST http://localhost:5051/device/devices
Authorization: Bearer TOKEN_USUARIO_1
Content-Type: application/json

{
  "nombre": "Mi Dispositivo",
  "ubicacion": "Sala",
  "usuario_id": 1,
  "id_grupo": null,
  "mac": "11:22:33:44:55:66"
}
```

**Respuesta Esperada:**
```
Status: 201 Created
{
  "success": true,
  "message": "Dispositivo, sensor y configuración creados exitosamente",
  "dispositivo_id": 1,
  "sensor_id": 1
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 7: Eliminar Dispositivo de Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta eliminar dispositivo del Usuario 1 - DEBE FALLAR

```bash
DELETE http://localhost:5051/device/deleteDevice/1
Authorization: Bearer TOKEN_USUARIO_2
Content-Type: application/json
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "error": "No tienes permiso para eliminar este dispositivo"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 8: Obtener Alertas de Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta obtener alertas del Usuario 1 - DEBE FALLAR

```bash
GET http://localhost:5051/alertas/usuario/1
Authorization: Bearer TOKEN_USUARIO_2
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "error": "No tienes permiso para ver alertas de otros usuarios"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 9: Obtener Consumo de Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta obtener consumo del Usuario 1 - DEBE FALLAR

```bash
GET http://localhost:5051/electrical_analysis/consumoPorDispositivosGrupos/1
Authorization: Bearer TOKEN_USUARIO_2
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "message": "No tienes permiso para acceder a estos datos"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

### Test 10: Cambiar Contraseña de Otro Usuario (Debe retornar 403)

**Descripción:** Usuario 2 intenta cambiar contraseña del Usuario 1 - DEBE FALLAR

```bash
POST http://localhost:5051/user/1/change-password
Authorization: Bearer TOKEN_USUARIO_2
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Respuesta Esperada:**
```
Status: 403 Forbidden
{
  "success": false,
  "message": "No tienes permiso para realizar esta acción"
}
```

**Resultado:** ✅ PASS / ❌ FAIL

---

## 📊 Resumen de Testing

| # | Test | Esperado | Resultado | Nota |
|---|------|----------|-----------|------|
| 1 | Sin Token | 401 | ✅/❌ | |
| 2 | Token Inválido | 401 | ✅/❌ | |
| 3 | Datos Propios | 200 | ✅/❌ | |
| 4 | Datos Otro Usuario | 403 | ✅/❌ | **CRÍTICO** |
| 5 | Crear para Otro Usuario | 403 | ✅/❌ | **CRÍTICO** |
| 6 | Crear para Sí Mismo | 201 | ✅/❌ | |
| 7 | Eliminar Otro Usuario | 403 | ✅/❌ | **CRÍTICO** |
| 8 | Obtener Alertas Otro | 403 | ✅/❌ | **CRÍTICO** |
| 9 | Obtener Consumo Otro | 403 | ✅/❌ | **CRÍTICO** |
| 10 | Cambiar Contraseña Otro | 403 | ✅/❌ | **CRÍTICO** |

---

## 🔍 Debugging

### Si Test 4 retorna 200 (PROBLEMA)

Significa que el middleware `authorizeByUserId` no está siendo aplicado o no funciona.

**Checklist:**
1. ¿El router tiene `authorizeByUserId('id')`?
2. ¿El nombre del parámetro es correcto? (id, usuarioId, idUsuario, etc.)
3. ¿El middleware está en el orden correcto? (authenticate primero, luego authorize)

**Ejemplo correcto:**
```javascript
router.get('/dispositivosPorUsuario/:id', 
  authenticate,                    // Primero
  authorizeByUserId('id'),         // Segundo
  allDeviceForUser
);
```

### Si Test 5 retorna 201 (PROBLEMA)

Significa que el validador en el controlador no está funcionando.

**Checklist:**
```javascript
// En addDevice():
const authenticatedUserId = req.user.userId;
if (parseInt(usuario_id) !== authenticatedUserId) {
  return res.status(403).json({ ... });
}
```

¿Está presente esta validación?

---

## 🚀 Próximos Pasos

**Fase 2: Pruebas Avanzadas**
- [ ] Test con múltiples usuarios simultáneamente
- [ ] Test de modificación de dispositivos después de obtener el ID
- [ ] Test de transacciones (crear grupo, asignar dispositivos, eliminar grupo)

**Fase 3: Integración Frontend**
- [ ] Validar que el frontend envía Authorization header
- [ ] Validar que el frontend maneja respuestas 403
- [ ] Validar que el frontend no guarda userId en localStorage/sessionStorage

---

## 📝 Reporte de Testing

Guardar los resultados aquí para futura referencia:

```
Fecha de Testing: __/__/____
Usuario 1 Token: ________________________
Usuario 2 Token: ________________________

Test 4 (Crítico): [ ] PASS [ ] FAIL
Test 5 (Crítico): [ ] PASS [ ] FAIL
Test 7 (Crítico): [ ] PASS [ ] FAIL
Test 8 (Crítico): [ ] PASS [ ] FAIL
Test 9 (Crítico): [ ] PASS [ ] FAIL
Test 10 (Crítico): [ ] PASS [ ] FAIL

Total Tests Passed: ___ / 10

Notas:
________________________________
________________________________
________________________________
```

---

**Última actualización:** 19 de Febrero, 2026
