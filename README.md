# 🚴 Canvion Cycling

Aplicación web completa para el seguimiento y análisis de entrenamientos de ciclismo, con integración de Strava.

## 📋 Descripción

Plataforma personal de tracking de entrenamientos que permite:
- Registro y autenticación de usuarios
- Conexión con Strava mediante OAuth2
- Sincronización automática de actividades
- Visualización de entrenamientos en mapas interactivos
- Análisis de progreso con gráficos y estadísticas
- Dashboard personalizado

## 🛠️ Stack Tecnológico

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Lombok
- Docker

### Frontend
- Angular 17+
- TypeScript
- Angular Material
- Chart.js
- Leaflet (mapas)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Render/Railway (Backend)
- Vercel (Frontend)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Java 17 o superior
- Node.js 18+ y npm
- Docker y Docker Compose
- PostgreSQL 15+
- Cuenta de desarrollador en Strava

### 1. Clonar el repositorio
```bash
git clone https://github.com/canvion/canvion-cycling.git
cd canvion-cycling
```

### 2. Configurar Backend

```bash
cd backend
# Copiar el archivo de configuración de ejemplo
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Editar application.properties con tus credenciales
# - Base de datos
# - JWT Secret
# - Strava Client ID y Secret
# - Clave de encriptación
```

### 3. Configurar Frontend

```bash
cd frontend
# Copiar variables de entorno
cp .env.example .env

# Editar .env con tu configuración
npm install
```

### 4. Ejecutar con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080

## 📝 Variables de Entorno

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cycling_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
jwt.secret=tu_jwt_secret_muy_largo_y_seguro
strava.client.id=tu_strava_client_id
strava.client.secret=tu_strava_client_secret
encryption.key=tu_clave_aes_256_bits
```

### Frontend (`.env`)
```
ANGULAR_APP_API_URL=http://localhost:8080/api
```

## 🔐 Obtener credenciales de Strava

1. Ve a https://www.strava.com/settings/api
2. Crea una nueva aplicación
3. Anota tu `Client ID` y `Client Secret`
4. Configura el callback URL: `http://localhost:8080/api/strava/callback`

## 🏗️ Estructura del Proyecto

```
canvion-cycling/
├── backend/              # API Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # Aplicación Angular
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

```bash
# Backend
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```

## 📦 Build para Producción

```bash
# Backend
cd backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

## 🤝 Contribución

Este es un proyecto personal de portfolio. Las sugerencias son bienvenidas mediante issues.

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

## 👤 Autor

**Canvion**
- GitHub: [@canvion](https://github.com/canvion)

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
