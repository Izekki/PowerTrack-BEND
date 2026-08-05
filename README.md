# PowerTrack-BEND ⚡

## Sistema de Monitoreo y Gestión Inteligente de Consumo Eléctrico IoT

**PowerTrack-BEND** es el motor backend para el Sistema de Monitoreo y Análisis de Consumo Eléctrico, diseñado para ofrecer centralización, procesamiento en tiempo real y analítica avanzada del consumo energético a través de dispositivos y sensores IoT.

Este sistema en producción permite a hogares, empresas e instituciones supervisar activamente su infraestructura eléctrica, identificar desperdicios energéticos, automatizar alertas por sobreconsumo y controlar costos conforme a las tarifas de la Comisión Federal de Electricidad (CFE).

---

## 🎯 Propósito Principal y Problema que Resuelve

### ¿Qué problema resuelve?
La falta de visibilidad detallada sobre el consumo eléctrico diario genera recibos de luz con cobros inesperados, desperdicios por consumo pasivo o "fantasma" en electrodomésticos y equipos industriales, e imprevistos por sobrecargas en la red eléctrica.

PowerTrack resuelve esta problemática ofreciendo:
- **Transparencia energética en tiempo real**: Visibilidad precisa del consumo en voltios, amperios, watts y su equivalente monetario estimado.
- **Detección temprana de anomalías**: Alertas instantáneas configurables cuando un dispositivo sobrepasa los umbrales seguros o deseados.
- **Control presupuestal y metas de ahorro**: Proyecciones de gasto e integración directa con las tarifas oficiales de la CFE para prevenir brincos de tarifa.

---

## ✨ Funcionalidades Principales para el Usuario y Sistema

### 📡 1. Ingesta y Monitoreo IoT en Tiempo Real
- Conexión segura con sensores y gateways IoT (ej. ESP32) para la captura continua de mediciones eléctricas (voltaje, corriente, potencia).
- Actualización fluida en tiempo real para alimentar paneles de control y dashboards interactivos.

### 📊 2. Análisis Histórico y Métricas de Consumo
- Desglose detallado de lecturas históricas por hora, día, mes o rangos de fecha personalizados.
- Normalización temporal en formato UTC para garantizar consistencia en análisis históricos y consultas comparativas.
- Análisis comparativo de consumo por dispositivos individuales y por grupos funcionales (ej. Cocina, Laboratorio, Área Industrial).

### 💡 3. Cálculo y Gestión de Tarifas Eléctricas CFE
- Motor de cálculo dinámico para estimar costos de facturación basándose en las tarifas CFE vigentes según región, mes y categoría.
- Seguimiento continuo para evitar superar los límites de consumo subsidiado.

### 🚨 4. Sistema Configurable de Alertas
- Reglas personalizadas por usuario y dispositivo para notificar automáticamente situaciones de riesgo o sobreconsumo de potencia.
- Historial interactivo de alertas registradas con estados de revisión y niveles de severidad.

### 🎯 5. Metas y Ajustes de Ahorro Energético
- Establecimiento de presupuestos de energía y metas de ahorro mensual por usuario.
- Indicadores visuales de progreso para promover hábitos de consumo eficiente y sostenible.

### 🔐 6. Gestión de Usuarios, Perfiles y Seguridad
- Autenticación y autorización mediante tokens de seguridad (JWT).
- Recuperación segura de contraseñas mediante correo electrónico con tokens de un solo uso.
- Gestión de perfil de usuario y preferencias personalizadas de interfaz y accesibilidad.

---

## 🏛️ Arquitectura del Sistema

El backend está estructurado bajo un patrón de diseño desacoplado (MVC / API RESTful) pensado para alta disponibilidad y rendimiento:

- **Capa de Controladores (Controllers)**: Manejo estructurado de solicitudes HTTP, lógica de negocio y respuestas estandarizadas en formato JSON.
- **Capa de Modelos (Models & ORM)**: Acceso a datos relacionales en MySQL con soporte de transacciones y consistencia temporal.
- **Capa de Seguridad y Middleware**: Protección mediante cabeceras de seguridad (Helmet), control de origen (CORS), limitación de tasa de solicitudes (rate limiting) y sanitización contra vulnerabilidades SQL.

---

## 📜 Adscripción

Este proyecto forma parte de los trabajos de investigación y desarrollo tecnológico de la **Universidad Veracruzana** (Facultad de Estadística e Informática, Maestría en Ingeniería de Software).

**PowerTrack-BEND** — *Transformando la gestión energética en una experiencia inteligente, transparente y eficiente.*
