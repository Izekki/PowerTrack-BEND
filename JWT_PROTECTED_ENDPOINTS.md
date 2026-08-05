# Endpoints Protegidos con JWT - PowerTrack Backend

## Descripción General

Todos los endpoints listados a continuación requieren **autenticación JWT**. El token debe enviarse en el header `Authorization`:

```
Authorization: Bearer <token_jwt>
```

### Estructura del Token JWT

El token contiene:
- `userId`: ID del usuario autenticado
- `email`: Email del usuario
- `nombre`: Nombre del usuario
- `iat`: Fecha de emisión
- `exp`: Fecha de expiración

---

## 1. DISPOSITIVOS (Device)

**Ruta base:** `/device`

### Crear Dispositivo
- **Método:** `POST`
- **Endpoint:** `/device/devices`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "nombre": "TV Sala",
    "descripcion": "Televisor Samsung",
    "usuario_id": "1",
    "grupo_id": "1",
    "tipo_dispositivo": "TV"
  }
  ```
- **Validación:** `usuario_id` debe coincidir con el `userId` del token

---

### Editar Dispositivo
- **Método:** `PUT`
- **Endpoint:** `/device/editar/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)
- **Body:**
  ```json
  {
    "nombre": "TV Sala Nueva",
    "descripcion": "Televisor LG"
  }
  ```
- **Validación:** El dispositivo debe pertenecersele al usuario autenticado

---

### Obtener Dispositivo por ID
- **Método:** `GET`
- **Endpoint:** `/device/obtenerPorId/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Todos los Dispositivos
- **Método:** `GET`
- **Endpoint:** `/device/obtener`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`

---

### Obtener Dispositivos por Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/device/dispositivosPorUsuario/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Validación:** El `id` en la URL debe coincidir con el `userId` del token

---

### Obtener Dispositivos sin Asignar
- **Método:** `GET`
- **Endpoint:** `/device/unassigned/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del usuario)

---

### Actualizar Icono/Tipo de Dispositivo
- **Método:** `PUT`
- **Endpoint:** `/device/editar/icono/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)
- **Body:**
  ```json
  {
    "tipo_dispositivo": "AIRE"
  }
  ```

---

### Eliminar Dispositivo ⚠️ CRÍTICO
- **Método:** `DELETE`
- **Endpoint:** `/device/deleteDevice/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo a eliminar)
- **Validación:** El dispositivo debe pertenecerle al usuario autenticado

---

## 2. GRUPOS (Groups)

**Ruta base:** `/groups`

### Crear Grupo
- **Método:** `POST`
- **Endpoint:** `/groups/create`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Electrodomésticos",
    "devices": [1, 2, 3],
    "usuarioId": "1"
  }
  ```
- **Validación:** `usuarioId` debe coincidir con el `userId` del token

---

### Obtener Todos los Grupos
- **Método:** `GET`
- **Endpoint:** `/groups/group`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`

---

### Editar Grupo
- **Método:** `PUT`
- **Endpoint:** `/groups/edit`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "id": "1",
    "name": "Electrodomésticos Nueva",
    "devices": [1, 2, 3],
    "usuarioId": "1"
  }
  ```
- **Validación:** `usuarioId` debe coincidir con el `userId` del token

---

### Obtener Grupos por Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/groups/byUser/:usuarioId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `usuarioId` (debe ser igual al `userId` del token)
- **Validación:** El `usuarioId` en la URL debe coincidir con el `userId` del token

---

### Obtener Dispositivos de un Grupo
- **Método:** `GET`
- **Endpoint:** `/groups/grupo/:grupoId/dispositivos`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `grupoId` (ID del grupo)

---

### Eliminar Grupo ⚠️ CRÍTICO
- **Método:** `DELETE`
- **Endpoint:** `/groups/deleteGroup/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del grupo a eliminar)
- **Validación:** El grupo debe pertenecerle al usuario autenticado

---

## 3. ALERTAS (Alerts)

**Ruta base:** `/alertas`

### Obtener Alertas del Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/alertas/usuario/:usuarioId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `usuarioId` (debe ser igual al `userId` del token)
- **Validación:** El `usuarioId` debe coincidir con el `userId` del token

---

### Generar Alertas Automáticas
- **Método:** `POST`
- **Endpoint:** `/alertas/generar`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "tipo_dispositivo": "TV",
    "condicion": "consumo_alto"
  }
  ```

---

### Crear Alerta Manual
- **Método:** `POST`
- **Endpoint:** `/alertas/`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "usuarioId": "1",
    "mensaje": "Consumo elevado detectado",
    "nivel": "ALTO",
    "id_tipo_dispositivo": "1",
    "tipo_alerta_id": "1"
  }
  ```
- **Validación:** `usuarioId` debe coincidir con el `userId` del token

---

### Eliminar Alerta
- **Método:** `DELETE`
- **Endpoint:** `/alertas/:id/usuario/:usuarioId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** 
  - `id` (ID de la alerta)
  - `usuarioId` (debe ser igual al `userId` del token)
- **Validación:** El `usuarioId` debe coincidir con el `userId` del token

---

### Marcar Alertas como Leídas
- **Método:** `PUT`
- **Endpoint:** `/alertas/marcar-leidas/:usuarioId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `usuarioId` (debe ser igual al `userId` del token)
- **Body:**
  ```json
  {
    "alertasIds": [1, 2, 3]
  }
  ```
- **Validación:** El `usuarioId` debe coincidir con el `userId` del token

---

### Verificar Alertas No Leídas
- **Método:** `GET`
- **Endpoint:** `/alertas/verificar-nuevas/:usuarioId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `usuarioId` (debe ser igual al `userId` del token)
- **Validación:** El `usuarioId` debe coincidir con el `userId` del token

---

### Marcar Una Alerta como Leída ⚠️ CRÍTICO
- **Método:** `PUT`
- **Endpoint:** `/alertas/marcar-una/:alertaId`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Validación interna el controlador
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `alertaId` (ID de la alerta)
- **Validación:** La alerta debe pertenecerle al usuario autenticado (validación en controlador)

---

## 4. USUARIOS (User)

**Ruta base:** `/user`

### Registrar Nuevo Usuario
- **Método:** `POST`
- **Endpoint:** `/user/register`
- **Autenticación:** ✗ No requerida (sin token)
- **Body:**
  ```json
  {
    "email": "usuario@example.com",
    "password": "contraseña123",
    "nombre": "Juan Pérez"
  }
  ```

---

### Obtener Perfil del Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/user/show/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Validación:** El `id` debe coincidir con el `userId` del token

---

### Editar Perfil del Usuario ⚠️ CRÍTICO
- **Método:** `PUT`
- **Endpoint:** `/user/edit/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Body:**
  ```json
  {
    "nombre": "Juan Pérez Updated",
    "email": "juan.updated@example.com"
  }
  ```
- **Validación:** El `id` debe coincidir con el `userId` del token

---

### Cambiar Contraseña ⚠️ CRÍTICO
- **Método:** `POST`
- **Endpoint:** `/user/:id/change-password`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Body:**
  ```json
  {
    "currentPassword": "contraseña123",
    "newPassword": "nuevacontraseña456"
  }
  ```
- **Validación:** El `id` debe coincidir con el `userId` del token

---

### Generar Reporte de Usuario
- **Método:** `POST`
- **Endpoint:** `/user/reports/:idUsuario`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `idUsuario` (ID del usuario)
- **Body:** Vacío o configuración del reporte

---

## 5. ANÁLISIS ELÉCTRICO (Electrical Analysis)

**Ruta base:** `/electrical_analysis`

### Información de la API
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/`
- **Autenticación:** ✗ No requerida

---

### Obtener Voltaje de Dispositivo
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/voltaje_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Corriente
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/corriente_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Potencia Activa
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/potencia_activa_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Frecuencia
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/frecuencia_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Factor de Potencia
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/factor_potencia_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Consumo
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/consumo_d/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Consumo Actual de Dispositivo
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/dispositivo/:id/consumo-actual`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)

---

### Obtener Consumo Actual por Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/dispositivosPorUsuarios/:idUsuario/consumo-actual`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `idUsuario` (debe ser igual al `userId` del token)
- **Validación:** El `idUsuario` debe coincidir con el `userId` del token

---

### Obtener Consumo Detallado por Dispositivo ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/dispositivo/:id/consumo-detallado`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del dispositivo)
- **Query (Opcional):**
  ```
  ?inicio=2025-01-01&fin=2025-02-01
  ```

---

### Obtener Consumo por Dispositivos y Grupos ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/consumoPorDispositivosGrupos/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Validación:** El `id` debe coincidir con el `userId` del token

---

### Obtener Consumo por Dispositivos y Grupos (Real) ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/consumoPorDispositivosGruposReal/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Validación:** El `id` debe coincidir con el `userId` del token

---

### Obtener Consumo por Usuario con Rango
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/consumoPorDispositivosYGruposPorUsuarioConRango/:id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (debe ser igual al `userId` del token)
- **Query:**
  ```
  ?inicio=2025-01-01&fin=2025-02-01
  ```

---

### Obtener Historial Resumido por Usuario
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/historial_resumen/:idUsuario`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `idUsuario` (debe ser igual al `userId` del token)
- **Query:**
  ```
  ?inicio=2025-01-01&fin=2025-02-01
  ```

---

### Obtener Historial Detallado por Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/historial_detallado/:idUsuario`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `idUsuario` (debe ser igual al `userId` del token)
- **Query:**
  ```
  ?inicio=2025-01-01&fin=2025-02-01
  ```
- **Validación:** El `idUsuario` debe coincidir con el `userId` del token

---

### Obtener Consumo por Rango
- **Método:** `GET`
- **Endpoint:** `/electrical_analysis/dispositivo/:idSensor/consumo-actual-por-rango`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `idSensor` (ID del sensor/dispositivo)
- **Query:**
  ```
  ?inicio=2025-01-01&fin=2025-02-01
  ```

---

### Guardar Mediciones
- **Método:** `POST`
- **Endpoint:** `/electrical_analysis/mediciones/guardar`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "dispositivo_id": "1",
    "voltaje": 120.5,
    "corriente": 2.3,
    "potencia_activa": 277.15,
    "frecuencia": 60,
    "factor_potencia": 0.9,
    "consumo": 0.277
  }
  ```

---

## 6. SENSORES (Sensors)

**Ruta base:** `/sensor`

### Obtener Todos los Sensores
- **Método:** `GET`
- **Endpoint:** `/sensor/obtener`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`

---

### Obtener Sensor por ID
- **Método:** `GET`
- **Endpoint:** `/sensor/byId/:id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `id` (ID del sensor)

---

### Verificar Sensor
- **Método:** `POST`
- **Endpoint:** `/sensor/verify`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "sensorId": "1",
    "verificacion": "codigo123"
  }
  ```

---

### Crear Medición
- **Método:** `POST`
- **Endpoint:** `/sensor/measurements`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "sensor_id": "1",
    "valor": 45.2
  }
  ```

---

## 7. CONFIGURACIÓN DE AHORROS (Savings Settings)

**Ruta base:** `/savsetting`

### Crear Configuración
- **Método:** `POST`
- **Endpoint:** `/savsetting/create`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "dispositivo_id": "1",
    "usuario_id": "1",
    "consumo_maximo": 100
  }
  ```

---

### Obtener Configuración por Dispositivo
- **Método:** `GET`
- **Endpoint:** `/savsetting/:dispositivo_id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `dispositivo_id` (ID del dispositivo)

---

### Actualizar Configuración por Dispositivo
- **Método:** `PUT`
- **Endpoint:** `/savsetting/:dispositivo_id`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `dispositivo_id` (ID del dispositivo)
- **Body:**
  ```json
  {
    "consumo_maximo": 150
  }
  ```

---

### Obtener Configuraciones por Usuario ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/savsetting/configuraciones/usuario/:usuario_id`
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `usuario_id` (debe ser igual al `userId` del token)
- **Validación:** El `usuario_id` debe coincidir con el `userId` del token

---

### Actualizar Min y Max
- **Método:** `POST`
- **Endpoint:** `/savsetting/update-minmax`
- **Autenticación:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "dispositivo_id": "1",
    "minimo": 10,
    "maximo": 200
  }
  ```

---

## 8. CONFIGURACIÓN DEL DASHBOARD

**Ruta base:** (Rutas dentro de `/user`)

### Obtener Configuración del Dashboard ⚠️ CRÍTICO
- **Método:** `GET`
- **Endpoint:** `/user/dashboard-config/:userId` (o similar según enrutador)
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `userId` (debe ser igual al `userId` del token)
- **Validación:** El `userId` debe coincidir con el `userId` del token

---

### Guardar Configuración del Dashboard ⚠️ CRÍTICO
- **Método:** `POST`
- **Endpoint:** `/user/dashboard-config/:userId` (o similar según enrutador)
- **Autenticación:** Requerida ✓
- **Validación de Propiedad:** Requerida ✓
- **Headers:** `Authorization: Bearer <token>`
- **Parámetros:** `userId` (debe ser igual al `userId` del token)
- **Body:**
  ```json
  {
    "layout": "grid",
    "widgets": ["consumo", "alertas", "dispositivos"]
  }
  ```
- **Validación:** El `userId` debe coincidir con el `userId` del token

---

## Resumen de Validaciones

### Tipos de Validación

| Tipo | Descripción |
|------|-------------|
| **Autenticación** | Token JWT válido en header `Authorization: Bearer <token>` |
| **Validación de Propiedad** | El parámetro `userId`/`usuarioId`/similar debe coincidir con el `userId` del token |
| **Interna en Controlador** | Validación adicional dentro del controlador para mayor seguridad |

### Niveles de Crítica

- **⚠️ CRÍTICO**: Endpoints que fueron modificados para proteger acceso a datos sensibles
- **🟠 ALTO**: Endpoints de cambio de datos personales que requieren validación
- **✓ Standard**: Endpoints de lectura con autenticación básica

---

## Ejemplo de Implementación en Frontend

### JavaScript/Fetch API

```javascript
// Obtener dispositivos del usuario
async function getDevices(userId, token) {
  const response = await fetch(
    `http://localhost:5051/device/dispositivosPorUsuario/${userId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.status === 401) {
    console.error('Token inválido o expirado');
    // Redirigir a login
  } else if (response.status === 403) {
    console.error('No tienes permiso para acceder a estos datos');
  }
  
  return response.json();
}
```

### Axios

```javascript
// Configurar Axios con token
const api = axios.create({
  baseURL: 'http://localhost:5051',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usar en endpoints
async function getDevices(userId) {
  try {
    const response = await api.get(`/device/dispositivosPorUsuario/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Token inválido');
    } else if (error.response?.status === 403) {
      console.error('Acceso denegado');
    }
  }
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| **200** | OK - Solicitud exitosa |
| **400** | Bad Request - Datos inválidos |
| **401** | Unauthorized - Token ausente o inválido |
| **403** | Forbidden - No tienes permiso para acceder a este recurso |
| **404** | Not Found - Recurso no encontrado |
| **500** | Internal Server Error - Error del servidor |

---

## Notas Importantes

1. **Token Expirado**: Si recibes un error 401, es probable que tu token haya expirado. Deberás volver a hacer login.

2. **Propiedad de Recursos**: No intentes acceder a recursos que no te pertenecen usando parámetros modificados. El servidor los rechazará con un error 403.

3. **Headers Requeridos**: Siempre incluye el header `Authorization: Bearer <token>` en tus solicitudes autenticadas.

4. **CORS**: Asegúrate de que tu frontend esté configurado para enviar credenciales si es necesario.

5. **Seguridad**: Nunca guardes el token en variables globales sin cifrar. Usa localStorage de forma segura o cookies httpOnly.

---

**Última actualización:** Febrero 2026  
**Versión API:** 1.0
