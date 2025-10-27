# 📚 Documentación del Proyecto BlogApp

> **Aplicación de Blog Full-Stack desarrollada con Amplication**

---

## 📋 Tabla de Contenidos

- [🎯 Descripción General](#-descripción-general)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [📊 Modelo de Datos](#-modelo-de-datos)
- [🔧 Stack Tecnológico](#-stack-tecnológico)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [💻 Desarrollo](#-desarrollo)
- [🐳 Docker](#-docker)
- [📡 API Documentation](#-api-documentation)
- [🔐 Autenticación y Autorización](#-autenticación-y-autorización)
- [🌐 Frontend Admin](#-frontend-admin)
- [📝 Scripts Disponibles](#-scripts-disponibles)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [📚 Referencias](#-referencias)

---

## 🎯 Descripción General

**BlogApp** es una aplicación full-stack de gestión de blog que permite a los usuarios crear, editar y gestionar publicaciones con datos meteorológicos asociados. El proyecto está construido siguiendo una arquitectura de microservicios moderna y escalable.

### Características Principales

- ✅ **CRUD completo** para usuarios, posts y datos meteorológicos
- ✅ **API GraphQL y REST** autogeneradas
- ✅ **Panel de administración** web completo
- ✅ **Autenticación JWT** con control de acceso basado en roles
- ✅ **Base de datos relacional** con PostgreSQL
- ✅ **Cache y messaging** con Redis
- ✅ **Containerización** completa con Docker
- ✅ **Documentación Swagger** integrada

---

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    Client[Cliente Web] --> LB[Load Balancer]
    LB --> Admin[Admin Panel<br/>React Admin]
    LB --> API[API Gateway<br/>NestJS]
    
    API --> Auth[Auth Service]
    API --> User[User Service]
    API --> Post[Post Service]
    API --> Weather[Weather Service]
    
    User --> DB[(PostgreSQL)]
    Post --> DB
    Weather --> DB
    
    API --> Redis[(Redis)]
    API --> Prisma[Prisma ORM]
    Prisma --> DB
    
    subgraph "Backend Services"
        Auth
        User
        Post
        Weather
    end
    
    subgraph "Data Layer"
        DB
        Redis
        Prisma
    end
```

### Componentes Principales

| Componente | Tecnología | Puerto | Descripción |
|------------|------------|--------|-------------|
| **Backend API** | NestJS + GraphQL | 3000 | API principal del sistema |
| **Admin Panel** | React Admin | 3001 | Panel de administración web |
| **Database** | PostgreSQL | 5432 | Base de datos principal |
| **Cache/Broker** | Redis | 6379 | Cache y message broker |

---

## 📊 Modelo de Datos

### Diagrama de Entidades

```mermaid
erDiagram
    User ||--o{ Post : "creates"
    Post ||--|| WeatherDatum : "has"
    
    User {
        string id PK
        string email UK
        string username UK
        string password
        json roles
        datetime createdAt
        datetime updatedAt
    }
    
    Post {
        string id PK
        string title UK
        string content
        datetime date UK
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    WeatherDatum {
        string id PK
        json currentWeather
        string postsId FK
        datetime createdAt
        datetime updatedAt
    }
```

### Descripción de Entidades

#### 👤 **User (Usuario)**
```typescript
interface User {
  id: string;          // CUID único
  email: string;       // Email único del usuario
  username?: string;   // Nombre de usuario opcional
  password: string;    // Contraseña encriptada (bcrypt)
  roles?: Json;        // Roles y permisos del usuario
  posts: Post[];       // Posts creados por el usuario
  createdAt: DateTime; // Fecha de creación
  updatedAt: DateTime; // Última actualización
}
```

#### 📝 **Post (Publicación)**
```typescript
interface Post {
  id: string;          // CUID único
  title: string;       // Título único del post
  content: string;     // Contenido del post
  date?: DateTime;     // Fecha de publicación
  userId?: string;     // ID del autor
  user?: User;         // Relación con el usuario
  weather?: WeatherDatum; // Datos meteorológicos
  createdAt: DateTime; // Fecha de creación
  updatedAt: DateTime; // Última actualización
}
```

#### 🌤️ **WeatherDatum (Datos Meteorológicos)**
```typescript
interface WeatherDatum {
  id: string;             // CUID único
  currentWeather?: Json;  // Datos meteorológicos en JSON
  postsId?: string;       // ID del post asociado
  posts?: Post;           // Relación con el post
  createdAt: DateTime;    // Fecha de creación
  updatedAt: DateTime;    // Última actualización
}
```

---

## 🔧 Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x
- **API**: GraphQL + Apollo Server
- **ORM**: Prisma 5.x
- **Base de Datos**: PostgreSQL 12
- **Cache**: Redis 7
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: React Admin 5.x + Material-UI
- **State Management**: React Admin integrado
- **HTTP Client**: Apollo Client (GraphQL)

### DevOps
- **Containerización**: Docker + Docker Compose
- **Build Tool**: Vite (Frontend) + NestJS CLI (Backend)
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Docker y Docker Compose
- PostgreSQL 12+ (si no usas Docker)
- Redis 7+ (si no usas Docker)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/AlejandroHBerzosa/Amplication_blogApp.git
cd Amplication_blogApp
```

### 2. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=blog_db
DB_PORT=5432
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Server
PORT=3000
BCRYPT_SALT=10

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_BROKER_HOST=localhost
REDIS_BROKER_PORT=6379

# GraphQL
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
```

### 3. Instalación de Dependencias

#### Backend
```bash
cd apps/mi-backend-server
npm install
```

#### Frontend Admin
```bash
cd apps/mi-backend-admin
npm install
```

---

## 💻 Desarrollo

### Opción 1: Desarrollo con Docker (Recomendado)

```bash
# Levantar todos los servicios
cd apps/mi-backend-server
npm run docker:dev

# En otra terminal - inicializar BD
npm run db:init
```

### Opción 2: Desarrollo Local

#### Backend
```bash
cd apps/mi-backend-server

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run db:migrate-up

# Poblar base de datos
npm run seed

# Iniciar en modo desarrollo
npm run start:watch
```

#### Frontend Admin
```bash
cd apps/mi-backend-admin

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### URLs de Desarrollo

- **API Backend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Swagger Documentation**: http://localhost:3000/api
- **Admin Panel**: http://localhost:3001

---

## 🐳 Docker

### Estructura de Contenedores

```yaml
services:
  server:     # Backend NestJS
  migrate:    # Migración de BD
  db:         # PostgreSQL
  redis_broker: # Redis
```

### Comandos Docker

```bash
# Desarrollo - Solo servicios externos
npm run docker:dev

# Producción - Todo el stack
docker-compose up -d

# Ver logs
docker-compose logs -f server

# Detener servicios
docker-compose down

# Limpiar volúmenes
docker-compose down --volumes
```

### Variables Docker

Crear `.env` con:
```env
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=blog_db
DB_PORT=5432
PORT=3000
BCRYPT_SALT=10
REDIS_BROKER_HOST=redis_broker
REDIS_BROKER_PORT=6379
```

---

## 📡 API Documentation

### GraphQL API

#### Endpoints Principales
- **GraphQL Endpoint**: `POST /graphql`
- **GraphQL Playground**: `GET /graphql` (solo desarrollo)

#### Queries Ejemplo

```graphql
# Obtener todos los posts
query GetPosts {
  posts {
    id
    title
    content
    date
    user {
      username
      email
    }
    weather {
      currentWeather
    }
  }
}

# Crear un post
mutation CreatePost($data: PostCreateInput!) {
  createPost(data: $data) {
    id
    title
    content
    date
  }
}
```

### REST API

La API REST está disponible automáticamente en `/api`:

```bash
# Usuarios
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id

# Posts
GET    /api/posts
POST   /api/posts
GET    /api/posts/:id
PATCH  /api/posts/:id
DELETE /api/posts/:id

# Weather Data
GET    /api/weather-data
POST   /api/weather-data
GET    /api/weather-data/:id
PATCH  /api/weather-data/:id
DELETE /api/weather-data/:id
```

### Swagger Documentation

Acceder a `http://localhost:3000/api` para ver la documentación interactiva completa.

---

## 🔐 Autenticación y Autorización

### Sistema de Autenticación

#### 1. **Registro de Usuario**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username"
}
```

#### 2. **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 3. **Uso del Token**
```bash
GET /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Control de Acceso (RBAC)

#### Roles Disponibles
- **Admin**: Acceso completo al sistema
- **User**: Acceso a recursos propios
- **Guest**: Solo lectura

#### Configuración de Permisos
```typescript
// En grants.json
{
  "user": {
    "post": {
      "create:own": ["*"],
      "read:own": ["*"],
      "update:own": ["*"],
      "delete:own": ["*"]
    }
  },
  "admin": {
    "post": {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"]
    }
  }
}
```

---

## 🌐 Frontend Admin

### Características del Panel Admin

- **Dashboard**: Vista general del sistema
- **Gestión de Usuarios**: CRUD completo con roles
- **Gestión de Posts**: Editor con preview
- **Datos Meteorológicos**: Asociación automática
- **Autenticación**: Login/logout integrado

### Estructura de Componentes

```
src/
├── App.tsx                 # Componente principal
├── Login.tsx              # Página de login
├── auth-provider/         # Proveedores de autenticación
├── data-provider/         # Conexión GraphQL
├── pages/
│   └── Dashboard.tsx      # Dashboard principal
├── user/                  # Componentes de usuario
│   ├── UserList.tsx
│   ├── UserCreate.tsx
│   ├── UserEdit.tsx
│   └── UserShow.tsx
├── post/                  # Componentes de posts
└── weatherDatum/          # Componentes de datos meteorológicos
```

### Personalización

#### Tema Personalizado
```typescript
// src/theme/theme.ts
export const theme = {
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
};
```

#### Data Provider Personalizado
```typescript
// src/data-provider/graphqlDataProvider.ts
import buildGraphQLProvider from "ra-data-graphql-amplication";

const dataProvider = buildGraphQLProvider({
  clientOptions: { uri: "http://localhost:3000/graphql" }
});
```

---

## 📝 Scripts Disponibles

### Backend (`apps/mi-backend-server`)

| Script | Descripción |
|--------|-------------|
| `npm start` | Iniciar servidor en producción |
| `npm run start:watch` | Desarrollo con hot reload |
| `npm run start:debug` | Desarrollo con debugger |
| `npm run build` | Build para producción |
| `npm test` | Ejecutar tests |
| `npm run db:migrate-save` | Crear nueva migración |
| `npm run db:migrate-up` | Aplicar migraciones |
| `npm run db:clean` | Reset completo de BD |
| `npm run db:init` | Inicializar BD + seed |
| `npm run seed` | Poblar BD con datos de prueba |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run docker:dev` | Levantar servicios en Docker |

### Frontend (`apps/mi-backend-admin`)

| Script | Descripción |
|--------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build para producción |
| `npm run serve` | Preview del build |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Linting del código |
| `npm run format` | Formatear código |

---

## 🧪 Testing

### Backend Testing

```bash
cd apps/mi-backend-server

# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:cov
```

### Estructura de Tests

```
src/
├── user/
│   └── user.service.spec.ts
├── post/
│   └── post.service.spec.ts
└── weatherDatum/
    └── weatherDatum.service.spec.ts
```

### Ejemplo de Test

```typescript
describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, PrismaService],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a post', async () => {
    const postData = {
      title: 'Test Post',
      content: 'Test content',
    };

    const result = await service.create(postData);
    
    expect(result).toBeDefined();
    expect(result.title).toBe(postData.title);
  });
});
```

---

## 🚢 Deployment

### Producción con Docker

#### 1. Build de Imágenes
```bash
# Backend
cd apps/mi-backend-server
docker build -t blog-backend .

# Frontend
cd apps/mi-backend-admin
docker build -t blog-admin .
```

#### 2. Docker Compose Producción
```yaml
version: "3.8"
services:
  backend:
    image: blog-backend:latest
    environment:
      - NODE_ENV=production
      - DB_URL=postgresql://user:pass@db:5432/blog
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis

  admin:
    image: blog-admin:latest
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:12
    environment:
      POSTGRES_DB: blog
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Variables de Entorno Producción

```env
NODE_ENV=production
DB_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secure-secret
REDIS_URL=redis://redis:6379
GRAPHQL_PLAYGROUND=false
GRAPHQL_INTROSPECTION=false
```

### Health Checks

El sistema incluye health checks en `/api/health`:

```typescript
// Verificar estado de la aplicación
GET /api/health

// Response
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 3600
}
```

---

## 📚 Referencias

### Documentación Oficial
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Admin Documentation](https://marmelab.com/react-admin/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)

### Amplication
- [Amplication Platform](https://amplication.com/)
- [Amplication Documentation](https://docs.amplication.com/)

### Herramientas de Desarrollo
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**📞 Soporte y Contribuciones**

Para reportar bugs o contribuir al proyecto, por favor crea un issue en el repositorio de GitHub.

**📄 Licencia**

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

*Documentación generada automáticamente - Última actualización: Octubre 2025*