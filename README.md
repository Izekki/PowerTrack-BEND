# 🔌 PowerTrack-BEND

**PowerTrack-BEND** es el backend de la solución **PowerTrack**, desarrollado con **Node.js** y **Express**. Su objetivo es proporcionar una API robusta y escalable para gestionar, procesar y almacenar datos energéticos en tiempo real, facilitando la integración con el frontend y otras aplicaciones relacionadas.

---

## 🚀 Características

- ⚙️ **API RESTful** para operaciones CRUD de datos energéticos
- 🔐 **Autenticación y autorización** mediante JWT
- 🗄️ **Conexión a bases de datos** (por ejemplo, MongoDB o PostgreSQL)
- 📈 **Procesamiento y análisis de datos** para obtener métricas clave
- 🌐 **Integración con servicios externos** y APIs de terceros

---

## 🛠️ Tecnologías Utilizadas

- 🟢 **[Node.js](https://nodejs.org/)** – Entorno de ejecución para JavaScript en el servidor
- 🚂 **[Express](https://expressjs.com/)** – Framework web minimalista para Node.js
- 🛢️ **[MongoDB](https://www.mongodb.com/)** o **[PostgreSQL](https://www.postgresql.org/)** – Bases de datos para almacenamiento de datos
- 🔐 **[JWT](https://jwt.io/)** – Autenticación segura mediante tokens
- 🧪 **[Jest](https://jestjs.io/)** – Framework de pruebas para asegurar la calidad del código

---

## 📁 Estructura del Proyecto

```plaintext
PowerTrack-BEND/
├── src/
│   ├── controllers/    # Lógica de manejo de rutas
│   ├── models/         # Definición de esquemas de datos
│   ├── routes/         # Definición de endpoints de la API
│   ├── services/       # Lógica de negocio y procesamiento de datos
│   └── app.js          # Configuración principal de la aplicación
├── tests/              # Pruebas unitarias y de integración
├── .env                # Variables de entorno
├── .gitignore
├── package.json
└── README.md

```
---

## 🧪 Simulador de Mediciones

Para pruebas y desarrollo, se incluye un simulador de mediciones eléctricas:

```bash
# Windows (Recomendado)
simulate

# Modo simple (sin BD)
simulate simple AA:BB:CC:DD:EE:FF

# Modo rápido (cada 2 segundos) - Ideal para frontend
simulate fast

# Ver ayuda
simulate help
```

### 📊 Para Desarrollo con Frontend

Si estás desarrollando gráficas en tiempo real:

```bash
# Terminal 1: Backend
node app.js

# Terminal 2: Simulador (envía datos cada 5s)
simulate

# Terminal 3: Tu frontend
npm run dev
```

**Documentación:**
- [Guía de Simulador](utils/README_SIMULATOR.md)
- [Guía para Frontend (Gráficas)](utils/FRONTEND_GUIDE.md) ⭐

---

## 👥 Autores

- [@Izekki](https://github.com/Izekki)
- [@ElMilaneso-69](https://github.com/ElMilaneso-69)
- [@McFlyer-00](https://github.com/McFlyer-00)
- [@Transformiuo](https://github.com/Transformiuo)
