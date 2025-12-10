# Simulador de Sensores PowerTrack

## Descripción

El simulador de sensores es una herramienta de desarrollo que genera mediciones eléctricas realistas para pruebas del sistema PowerTrack sin necesidad de hardware físico (ESP32). Replica el comportamiento de un sensor conectado a un dispositivo eléctrico, generando datos de voltaje, corriente, potencia, factor de potencia, energía y frecuencia.

Este componente es esencial para:
- Desarrollo y pruebas del frontend sin dependencia de hardware
- Validación de lógica de análisis de consumo eléctrico
- Generación de datos históricos para pruebas de visualización
- Simulación de escenarios de consumo realistas

---

## Características Técnicas

### Configuración Actual (Versión 2)

- **Intervalo de medición en tiempo real**: 5 segundos
- **Relleno histórico**: 6 horas con intervalos de 5 minutos
- **Usuario de prueba**: ID 24
- **Sensor asociado**: ID 6
- **Valores eléctricos realistas**:
  - Voltaje: 126V ±2V (rango típico en México)
  - Corriente: 2.0A ±0.2A
  - Potencia: ~260W (calculada: V × A)
  - Factor de potencia: 0.95 ±0.03
  - Frecuencia: 60Hz ±0.5Hz
  - Energía: Acumulativa en Wh

### Formato de Datos

El simulador genera datos en formato JSON compatible con el payload del ESP32:

```json
{
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "voltaje": 126,
  "corriente": 2.0,
  "potencia": 252,
  "factor_potencia": 0.95,
  "energia": 1234.5,
  "frecuencia": 60.0,
  "timestamp": "2024-12-10T15:30:00.000Z"
}
```

---

## Instalación y Uso

### Requisitos Previos

- Backend PowerTrack ejecutándose en `http://localhost:5051`
- Base de datos MySQL configurada con usuario ID 24 y sensor ID 6
- Node.js v18+ instalado

### Inicio Rápido

#### 1. Iniciar el Backend

```bash
# Desde la raíz del proyecto PowerTrack-BEND
node app.js
```

Esperar mensaje: `Server listening on port http://localhost:5051`

#### 2. Ejecutar el Simulador

```bash
# Desde la raíz del proyecto
node utils/simulator.js
```

#### 3. Verificar Funcionamiento

El simulador mostrará en consola:
```
Simulador de sensor iniciado
Generando 6 horas de datos históricos...
✓ Datos históricos generados
Enviando mediciones cada 5 segundos...
✓ Medición enviada: 126V, 2.0A, 252W
```

---

## Uso Avanzado

### Configuración Personalizada

Editar constantes en `utils/simulator.js`:

```javascript
const CONFIG = {
  USUARIO_ID: 24,              // ID del usuario de prueba
  SENSOR_ID: 6,                // ID del sensor asociado
  MAC_ADDRESS: 'AA:BB:CC:DD:EE:FF',
  VOLTAJE_BASE: 126,           // Voltaje promedio (V)
  CORRIENTE_BASE: 2.0,         // Corriente promedio (A)
  FACTOR_POTENCIA_BASE: 0.95,
  FRECUENCIA_BASE: 60.0,       // Hz
  INTERVALO_MS: 5000,          // Intervalo entre mediciones (ms)
  HORAS_HISTORIAL: 6,          // Horas de datos históricos
  PASO_TIEMPO_MINUTOS: 5       // Intervalo del histórico
};
```

### Modificar Intervalo de Envío

```bash
# Windows PowerShell
$env:INTERVALO=3000; node utils/simulator.js

# Windows CMD
set INTERVALO=3000 && node utils/simulator.js
```

### Detener el Simulador

Presionar `Ctrl+C` en la terminal donde se ejecuta

---

## Validación de Datos

### Verificar en Base de Datos

```sql
-- Ver últimas 10 mediciones
SELECT 
  id, sensor_id, voltaje, corriente, potencia, 
  fecha_hora, energia 
FROM mediciones 
WHERE sensor_id = 6 
ORDER BY fecha_hora DESC 
LIMIT 10;

-- Verificar datos históricos
SELECT 
  DATE_FORMAT(fecha_hora, '%Y-%m-%d %H:%i') as momento,
  AVG(potencia) as potencia_promedio,
  COUNT(*) as num_mediciones
FROM mediciones
WHERE sensor_id = 6
  AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
GROUP BY DATE_FORMAT(fecha_hora, '%Y-%m-%d %H:%i')
ORDER BY momento DESC;
```

### Verificar en API

```bash
# Windows PowerShell
curl http://localhost:5051/electrical_analysis/consumoPorDispositivosGrupos/24

# Verificar con rango de fechas (UTC)
curl "http://localhost:5051/electrical_analysis/historial_detallado/24?fechaInicio=2024-12-10T00:00:00&fechaFin=2024-12-10T23:59:59"
```

### Verificar en Frontend

1. Iniciar frontend: `cd ../PowerTrack-FEND && npm run dev`
2. Acceder a dashboard del usuario 24
3. Observar actualización de KPIs cada 5 segundos
4. Verificar gráficas de consumo en tiempo real

---

## Desarrollo con Frontend

### Flujo de Trabajo Completo

```bash
# Terminal 1: Backend
cd PowerTrack-BEND
node app.js

# Terminal 2: Simulador
cd PowerTrack-BEND
node utils/simulator.js

# Terminal 3: Frontend
cd PowerTrack-FEND
npm run dev
```

### Escenarios de Prueba

**Consumo Constante:**
- Valores estables ideales para probar visualizaciones básicas
- Verificar cálculos de costos y promedios

**Variación Natural:**
- El simulador añade variación aleatoria pequeña (±2%)
- Simula comportamiento real de electrodomésticos

**Datos Históricos:**
- 6 horas de datos pre-poblados
- Útil para probar gráficas de tendencias y análisis de rangos

---

## Troubleshooting

### El simulador no envía datos

**Verificar:**
1. Backend ejecutándose: `curl http://localhost:5051`
2. Usuario 24 existe en BD: `SELECT * FROM usuarios WHERE id_usuario = 24;`
3. Sensor 6 existe y está asociado: `SELECT * FROM sensores WHERE id_sensor = 6;`

**Solución:**
```sql
-- Crear usuario de prueba si no existe
INSERT INTO usuarios (id_usuario, nombre, email, password) 
VALUES (24, 'Usuario Prueba', 'test@powertrack.com', 'hash');

-- Crear sensor si no existe
INSERT INTO sensores (id_sensor, mac_address, id_dispositivo) 
VALUES (6, 'AA:BB:CC:DD:EE:FF', 1);
```

### Error de conexión a base de datos

**Verificar configuración en `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=powertrack
DB_PORT=3306
```

### Datos no aparecen en frontend

1. Verificar WebSocket conectado (consola del navegador)
2. Verificar que frontend apunta a `http://localhost:5051`
3. Limpiar caché del navegador
4. Verificar que el usuario 24 tiene permisos

---

## Especificaciones Técnicas

### Algoritmo de Generación

1. **Inicialización**: Genera 6 horas de datos históricos
2. **Variación**: Añade ruido gaussiano a valores base (σ = 1-2%)
3. **Correlación**: Potencia calculada como V × A × FP
4. **Energía**: Acumulación basada en potencia y tiempo
5. **Timestamp**: UTC para consistencia con backend

### Rendimiento

- **Memoria**: ~50MB durante generación de histórico
- **CPU**: <5% durante operación continua
- **Red**: ~1KB por medición, ~12KB/min
- **Base de datos**: ~72 inserts iniciales, luego 1 insert/5s

### Compatibilidad

- Compatible con estructura de BD `mediciones`
- Formato idéntico a payload ESP32 real
- Timestamps en UTC (formato ISO 8601)
- Valores numéricos con precisión de 2 decimales

---

## Notas de Desarrollo

### Diferencias con Versión 1

La versión 2 del simulador (actual) incluye mejoras sobre la versión 1:

| Característica | V1 | V2 |
|---------------|-----|-----|
| Histórico | 24 horas | 6 horas |
| Intervalo histórico | 1 minuto | 5 minutos |
| Valores | Genéricos | Realistas (126V, 2A) |
| Formato potencia | Float | Integer |
| Operación | Con límite de tiempo | Continua |

**Razón del cambio**: La V2 optimiza el llenado inicial (menos registros) y usa valores más cercanos a la realidad eléctrica mexicana.

### Roadmap

- [ ] Modo multi-sensor (simular varios dispositivos)
- [ ] Perfiles de consumo (nevera, aire acondicionado, etc.)
- [ ] Simulación de eventos (picos, caídas de voltaje)
- [ ] Interfaz CLI interactiva
- [ ] Exportación de datos simulados a CSV

---

## Referencias

- **Especificación ESP32**: Compatible con formato de payload definido en firmware
- **Normas eléctricas México**: Voltaje 127V ±10%, Frecuencia 60Hz
- **Timestamps UTC**: Implementación según ISO 8601 para análisis correcto

---

## Contacto y Soporte

Este simulador es parte del proyecto de tesis **"Sistema de Visualización de Información de Consumo Eléctrico"** de la Universidad Veracruzana.

Para reportes de bugs o sugerencias, abrir un issue en el repositorio de GitHub.

