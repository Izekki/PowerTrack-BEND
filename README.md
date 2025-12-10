# PowerTrack-BEND

## Sistema de Visualización de Información de Consumo Eléctrico

**PowerTrack-BEND** es el componente backend del Sistema de Visualización de Información de Consumo Eléctrico, desarrollado como proyecto de tesis de maestría en la **Universidad Veracruzana**. Este sistema proporciona una API RESTful robusta y escalable para la gestión, procesamiento y almacenamiento de datos energéticos en tiempo real, permitiendo el monitoreo y análisis del consumo eléctrico a través de dispositivos IoT.

---

## Descripción del Proyecto

Este backend fue diseñado para recibir, procesar y almacenar mediciones eléctricas provenientes de sensores IoT (ESP32) conectados mediante protocolo HTTP. El sistema implementa comunicación en tiempo real mediante WebSockets, autenticación segura con JWT, y análisis avanzado de consumo energético con soporte para múltiples zonas horarias (UTC).

### Características Principales

- **API RESTful** completa para gestión de dispositivos, usuarios, grupos y mediciones eléctricas
- **Autenticación y autorización** mediante JSON Web Tokens (JWT) con bcrypt para hash de contraseñas
- **Base de datos MySQL** con manejo de timestamps en formato UTC para consistencia temporal
- **Análisis eléctrico avanzado** con cálculo de consumo, costos, promedios por dispositivo y grupo
- **Sistema de alertas** configurable por usuario y dispositivo
- **Configuración de ahorros** con metas personalizadas y cálculo de tarifas
- **Recuperación de contraseñas** mediante correo electrónico con tokens temporales
- **Simulador integrado** para generación de datos de prueba con valores realistas
- **Middleware de seguridad** con Helmet y CORS configurado
- **Manejo robusto de errores** con middleware especializado para JSON

---

## Arquitectura Técnica

### Stack Tecnológico

- **[Node.js](https://nodejs.org/)** v18+ – Entorno de ejecución JavaScript
- **[Express](https://expressjs.com/)** v4.21 – Framework web para Node.js
- **[MySQL](https://www.mysql.com/)** v8+ – Sistema de gestión de base de datos relacional
- **[mysql2](https://github.com/sidorares/node-mysql2)** – Driver MySQL para Node.js con soporte para promesas
- **[JSON Web Tokens (JWT)](https://jwt.io/)** – Autenticación stateless
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** – Hash seguro de contraseñas
- **[Helmet](https://helmetjs.github.io/)** – Middleware de seguridad HTTP
- **[CORS](https://www.npmjs.com/package/cors)** – Control de acceso cross-origin
- **[Nodemailer](https://nodemailer.com/)** – Envío de correos electrónicos
- **[dotenv](https://www.npmjs.com/package/dotenv)** – Gestión de variables de entorno

### Decisiones Técnicas Clave

1. **Manejo de Zona Horaria UTC**: Las fechas se procesan como UTC en el backend antes de realizar consultas SQL, garantizando consistencia en análisis de datos históricos independientemente de la zona horaria del cliente.

2. **Formato de Fechas**: Conversión de fechas usando `.toISOString().slice(0, 19).replace("T", " ")` para compatibilidad con formato DATETIME de MySQL.

3. **Agrupación Temporal**: Uso de `DATE_FORMAT(fecha_hora, '%Y-%m-%d')` en consultas SQL para agrupación consistente respetando UTC.

4. **Arquitectura Modular**: Separación clara entre controladores, modelos, rutas y middlewares siguiendo el patrón MVC.

---

## Estructura del Proyecto

```plaintext
PowerTrack-BEND/
├── app.js                          # Punto de entrada principal
├── package.json                    # Dependencias y scripts
├── .env                           # Variables de entorno (no incluido en repo)
├── controllers/                   # Lógica de control de peticiones
│   ├── AlertaController.js        # Gestión de alertas
│   ├── deviceController.js        # Operaciones de dispositivos
│   ├── ElectricalAnalysisController.js  # Análisis de consumo
│   ├── groupController.js         # Gestión de grupos
│   ├── loginController.js         # Autenticación
│   ├── measurementController.js   # Registro de mediciones
│   ├── passwordRecoveryController.js  # Recuperación de contraseñas
│   ├── reportController.js        # Generación de reportes
│   ├── savingsSettinsController.js  # Configuración de ahorros
│   ├── sensorController.js        # Gestión de sensores
│   ├── supplierController.js      # Proveedores eléctricos
│   └── userController.js          # Gestión de usuarios
├── models/                        # Capa de acceso a datos
│   ├── alertModel.js
│   ├── deviceModel.js
│   ├── ElectricalAnalysisModel.js
│   ├── groupModel.js
│   ├── loginModel.js
│   ├── measurementModel.js
│   ├── passwordRecoveryModel.js
│   ├── savingsSettinsModel.js
│   ├── sensorModel.js
│   ├── supplierModel.js
│   ├── userModel.js
│   └── modelserror/               # Errores personalizados
│       ├── DBConnectionError.js
│       └── DBElementAlredyExists.js
├── routes/                        # Definición de endpoints
│   ├── alertRouter.js
│   ├── deviceRouter.js
│   ├── ElectricalAnalysisRouter.js
│   ├── groupRouter.js
│   ├── loginRouter.js
│   ├── passwordRecoveryRouter.js
│   ├── savingsSettingsRouter.js
│   ├── sensorRouter.js
│   ├── supplierRouter.js
│   └── UserRouter.js
├── middlewares/                   # Middleware personalizado
│   ├── authMiddleware.js          # Verificación JWT
│   ├── corsMiddleware.js          # Configuración CORS
│   ├── corsMiddlewareNoSecure.js  # CORS para desarrollo
│   ├── jsonErrorMiddleware.js     # Manejo de errores JSON
│   ├── loginMiddleware.js         # Validación de login
│   ├── registerMiddleware.js      # Validación de registro
│   └── validateDeviceMiddleware.js  # Validación de dispositivos
├── sockets/                       # Comunicación WebSocket
│   └── sensorSocket.js            # Socket para datos de sensores
├── db/                            # Configuración de base de datos
│   └── connection.js              # Pool de conexiones MySQL
└── utils/                         # Utilidades
    ├── mailService.js             # Servicio de correo electrónico
    ├── simulator.js               # Simulador de sensores
    └── README.md                  # Documentación del simulador
```

---

## Instalación y Configuración

### Requisitos Previos

- **Node.js** v18.0.0 o superior
- **MySQL** v8.0 o superior
- **npm** v9.0.0 o superior

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Izekki/PowerTrack-BEND.git
cd PowerTrack-BEND

# Instalar dependencias
npm install
```

### Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=powertrack
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# Servidor
PORT=5051

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_aplicacion
```

### Inicialización de Base de Datos

Ejecutar el script SQL de creación de tablas (disponible en documentación complementaria).

---

## Uso

### Iniciar el Servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

El servidor estará disponible en `http://localhost:5051`

### Simulador de Mediciones

Para desarrollo y pruebas, se incluye un simulador que genera mediciones eléctricas realistas:

```bash
# Ejecutar simulador
node utils/simulator.js
```

**Características del Simulador:**
- Genera mediciones cada 5 segundos
- Relleno histórico de 6 horas con intervalos de 5 minutos
- Valores realistas: 126V ±2V, 2.0A ±0.2A, ~260W
- Compatible con sensor_id 6 (usuario 24)
- Formato de datos coincide con payload de ESP32

**Documentación completa:** [utils/README.md](utils/README.md)

---

## Endpoints Principales

### Autenticación

- `POST /login` - Autenticación de usuario
- `POST /psR/request` - Solicitar recuperación de contraseña
- `POST /psR/reset` - Restablecer contraseña

### Usuarios

- `GET /user/:id` - Obtener información de usuario
- `POST /user` - Crear nuevo usuario
- `PUT /user/:id` - Actualizar usuario
- `DELETE /user/:id` - Eliminar usuario

### Dispositivos

- `GET /device` - Listar dispositivos
- `GET /device/:id` - Obtener dispositivo específico
- `POST /device` - Registrar nuevo dispositivo
- `PUT /device/:id` - Actualizar dispositivo
- `DELETE /device/:id` - Eliminar dispositivo

### Sensores

- `GET /sensor` - Listar sensores
- `POST /sensor` - Registrar sensor
- `PUT /sensor/:id` - Actualizar sensor

### Análisis Eléctrico

- `GET /electrical_analysis/consumoPorDispositivosYGruposPorUsuarioConRango/:id` - Consumo por dispositivos y grupos con rango de fechas (UTC)
- `GET /electrical_analysis/historial_detallado/:idUsuario` - Historial detallado de mediciones (UTC)
- `GET /electrical_analysis/consumoPorDispositivosGrupos/:idUsuario` - Análisis de consumo por dispositivo

### Grupos

- `GET /groups` - Listar grupos
- `POST /groups` - Crear grupo
- `PUT /groups/:id` - Actualizar grupo
- `DELETE /groups/:id` - Eliminar grupo

### Alertas

- `GET /alertas/:idUsuario` - Obtener alertas de usuario
- `POST /alertas` - Crear alerta
- `PUT /alertas/:id` - Actualizar alerta
- `DELETE /alertas/:id` - Eliminar alerta

### Configuración de Ahorros

- `GET /savsetting/:idUsuario` - Obtener configuración de ahorros
- `POST /savsetting` - Crear configuración
- `PUT /savsetting/:id` - Actualizar configuración

---

## Seguridad

- **JWT**: Tokens con expiración configurable para autenticación stateless
- **bcrypt**: Hash de contraseñas con salt rounds = 10
- **Helmet**: Headers de seguridad HTTP configurados
- **CORS**: Control de orígenes permitidos
- **Validación**: Middleware de validación en todas las rutas críticas
- **Sanitización**: Prevención de inyección SQL mediante consultas preparadas

---

## Desarrollo

### Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar con nodemon (auto-reload)
npm test           # Ejecutar pruebas (por implementar)
```

### Flujo de Desarrollo con Frontend

```bash
# Terminal 1: Backend
npm start

# Terminal 2: Simulador (opcional)
node utils/simulator.js

# Terminal 3: Frontend
cd ../PowerTrack-FEND
npm run dev
```

---

## Contribuciones

Este proyecto fue desarrollado como parte de un trabajo de tesis de maestría en la Universidad Veracruzana.

### Equipo de Desarrollo

- **Julio Aldair Morales Romero** - [@Izekki](https://github.com/Izekki) - Colaborador
- **Pedro David Pérez Delfín** - [@Petruccini](https://github.com/Petruccini) - Colaborador
- **Rodrigo Holguín** - [@RodrigoHol](https://github.com/RodrigoHol) - Colaborador
- **Jerry Romero** - [@xib4lb4](https://github.com/xib4lb4) - Creador

---

## Licencia

Este proyecto es parte de una tesis de maestría de la Universidad Veracruzana. 

**Universidad Veracruzana**  
Facultad de Estadística e Informática  
Maestría en Ingeniería de Software  
2024-2025

---

## Contacto

Para consultas académicas o técnicas sobre este proyecto, contactar a través de los repositorios de GitHub de los colaboradores.
