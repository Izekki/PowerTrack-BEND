# Preferencias de Accesibilidad - Resumen para Frontend

## Objetivo
Se agrego soporte backend para guardar y leer preferencias de accesibilidad por usuario autenticado.

Estas preferencias incluyen:
- `contrastLevel`: nivel de contraste
- `theme`: tema visual

## Endpoints nuevos
Base path en backend:
- `/preferences`

### 1. Obtener preferencias
- Metodo: `GET /preferences/:userId`
- Auth: JWT obligatorio (`Authorization: Bearer <token>`)
- Seguridad: el `userId` del token debe coincidir con `:userId`
- Comportamiento: si el usuario no tiene preferencias, se crean automaticamente con valores por defecto y se retornan

Respuesta exitosa (`200`):
```json
{
  "contrastLevel": "normal",
  "theme": "light"
}
```

### 2. Actualizar preferencias
- Metodo: `PUT /preferences/:userId`
- Auth: JWT obligatorio (`Authorization: Bearer <token>`)
- Seguridad: el `userId` del token debe coincidir con `:userId`

Body permitido:
```json
{
  "contrastLevel": "high",
  "theme": "dark"
}
```

Campos opcionales:
- Se puede enviar solo `contrastLevel`
- Se puede enviar solo `theme`
- Se pueden enviar ambos

Respuesta exitosa (`200`):
```json
{
  "contrastLevel": "high",
  "theme": "dark"
}
```

## Validaciones backend
### `contrastLevel`
Solo acepta:
- `normal`
- `high`
- `very-high`

### `theme`
Solo acepta:
- `light`
- `dark`

Si no se envia ninguno de los dos campos en `PUT`, responde `400`.

## Defaults del sistema
Cuando se crean preferencias por primera vez:
- `contrastLevel = "normal"`
- `theme = "light"`

## Errores esperables para frontend
### `401 Unauthorized`
- Token ausente
- Token invalido o expirado

### `403 Forbidden`
- El usuario intenta leer/modificar preferencias de otro `userId`

### `400 Bad Request`
- `userId` invalido
- `contrastLevel` o `theme` fuera de valores permitidos
- Body vacio en `PUT`

### `404 Not Found`
- Usuario no existe

## Cambios en persistencia
Se agrego nueva entidad en Prisma:
- Modelo: `UserPreferences`
- Tabla real: `preferencias_usuario`
- Relacion 1:1 con `usuarios`
- `ON DELETE CASCADE` al eliminar usuario

## Que debe ajustar el frontend
1. Cargar preferencias al iniciar sesion o al montar configuracion de usuario:
- `GET /preferences/:userId`
- Guardar resultado en estado global/local

2. Aplicar preferencias al UI:
- `theme` para modo claro/oscuro
- `contrastLevel` para clases/variables CSS de contraste

3. Guardar cambios del usuario:
- `PUT /preferences/:userId` con cambios parciales o completos
- Actualizar estado local con la respuesta del backend

4. Manejar errores de auth:
- Si `401`, forzar re-login o refresh de sesion
- Si `403`, no permitir acceso cruzado de perfiles

## Contrato recomendado para agente frontend
- Siempre tomar `userId` desde sesion/token actual
- No hardcodear valores: usar listas permitidas
- Al no existir preferencias, confiar en defaults devueltos por backend
- Mantener sincronizado el estado UI con la respuesta del `PUT`
