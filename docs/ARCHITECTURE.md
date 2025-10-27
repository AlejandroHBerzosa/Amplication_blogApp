# 🏗️ Arquitectura del Sistema

Este documento describe la arquitectura técnica del proyecto BlogApp.

## 📐 Arquitectura General

### Patrón Arquitectónico
El sistema sigue una **arquitectura de microservicios** con los siguientes principios:

- **Separación de responsabilidades** por dominio
- **API-First** con GraphQL y REST
- **Event-driven** con Redis como message broker
- **Database-per-service** pattern
- **Containerización** completa

### Diagrama de Componentes

```
┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Mobile App    │
│   (React Admin) │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
              ┌─────────────┐
              │   Gateway   │
              │  (NestJS)   │
              └─────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌───▼────┐ ┌────▼────┐
   │  User   │ │  Post  │ │ Weather │
   │ Service │ │Service │ │ Service │
   └─────────┘ └────────┘ └─────────┘
        │           │           │
        └───────────┼───────────┘
                    │
            ┌──────────────┐
            │ Data Layer   │
            │ PostgreSQL   │
            │ + Redis      │
            └──────────────┘
```

## 🧩 Componentes del Sistema

### 1. **Presentation Layer**
- **Admin Panel**: Interfaz web para administradores
- **API Gateway**: Punto único de entrada para todas las requests

### 2. **Business Logic Layer**
- **User Service**: Gestión de usuarios y autenticación
- **Post Service**: CRUD de publicaciones
- **Weather Service**: Datos meteorológicos asociados

### 3. **Data Access Layer**
- **Prisma ORM**: Abstracción de base de datos
- **Repository Pattern**: Acceso estructurado a datos

### 4. **Infrastructure Layer**
- **PostgreSQL**: Base de datos relacional principal
- **Redis**: Cache y message broker
- **Docker**: Containerización y orquestación

## 🔄 Flujo de Datos

### Request Flow
```
Client Request → API Gateway → Auth Middleware → Service Layer → Repository → Database
     ↓                                                                           ↑
Response ← Serialization ← Business Logic ← Data Access ← Query Results ← ─────┘
```

### Event Flow
```
Service A → Event Bus (Redis) → Service B
    ↓              ↓               ↓
  Database    Event Store    Event Handler
```

## 📦 Módulos del Backend

### Core Modules
```typescript
AppModule
├── AuthModule          // Autenticación y autorización
├── UserModule          // Gestión de usuarios
├── PostModule          // Gestión de posts
├── WeatherDatumModule  // Datos meteorológicos
├── HealthModule        // Health checks
└── PrismaModule        // Configuración ORM
```

### Infrastructure Modules
```typescript
AppModule
├── RedisModule         // Message broker
├── ConfigModule        // Configuración
├── GraphQLModule       // API GraphQL
└── ServeStaticModule   // Archivos estáticos
```

## 🔒 Seguridad

### Layers de Seguridad

1. **Network Security**
   - HTTPS/TLS en producción
   - CORS configurado
   - Rate limiting

2. **Authentication**
   - JWT tokens
   - Bcrypt para passwords
   - Refresh token pattern

3. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Guards en endpoints

4. **Data Security**
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection

### Flujo de Autenticación

```
1. User Login Request
2. Validate Credentials
3. Generate JWT Token
4. Return Token + User Info
5. Client stores token
6. Include token in subsequent requests
7. Validate token on each request
8. Grant/Deny access based on roles
```

## 🚀 Escalabilidad

### Horizontal Scaling
- **Stateless services**: Fácil escalado horizontal
- **Load balancing**: Nginx o cloud load balancers
- **Database scaling**: Read replicas y sharding

### Vertical Scaling
- **Container resources**: CPU y memoria ajustables
- **Database optimization**: Índices y query optimization
- **Caching**: Redis para datos frecuentemente accedidos

### Performance Optimizations
- **Connection pooling**: Prisma connection pool
- **Query optimization**: DataLoader pattern
- **Caching layers**: Redis + in-memory caching
- **CDN**: Para assets estáticos

## 🔍 Monitoring y Observabilidad

### Health Checks
```typescript
/api/health
├── /api/health/database
├── /api/health/redis
└── /api/health/services
```

### Logging Strategy
- **Structured logging**: JSON format
- **Log levels**: Error, Warn, Info, Debug
- **Centralized logs**: ELK Stack (future)

### Metrics
- **Application metrics**: Response times, error rates
- **Business metrics**: User activity, post creation
- **Infrastructure metrics**: CPU, memory, disk

## 🧪 Testing Strategy

### Test Pyramid
```
        E2E Tests
      ┌─────────────┐
      │ Integration │
    ┌─┴─────────────┴─┐
    │   Unit Tests    │
    └─────────────────┘
```

### Testing Layers
- **Unit Tests**: Servicios y funciones puras
- **Integration Tests**: APIs y base de datos
- **E2E Tests**: Flujos completos de usuario

## 📊 Data Architecture

### Database Design Principles
- **Normalization**: 3NF para evitar redundancia
- **Indexing**: Índices en campos de búsqueda frecuente
- **Constraints**: Integridad referencial
- **Migrations**: Versionado de esquema

### Caching Strategy
```
Application → L1 Cache (Memory) → L2 Cache (Redis) → Database
```

### Data Flow
```
Write: App → Database → Cache Invalidation
Read:  App → Cache Hit/Miss → Database (if miss) → Update Cache
```

## 🔄 CI/CD Pipeline

### Development Flow
```
Code → Git Push → GitHub Actions → Tests → Build → Deploy
```

### Environments
- **Development**: Local + Docker
- **Staging**: Cloud deployment
- **Production**: Scaled cloud deployment

Esta arquitectura está diseñada para ser **escalable**, **mantenible** y **segura**, siguiendo las mejores prácticas de desarrollo moderno.