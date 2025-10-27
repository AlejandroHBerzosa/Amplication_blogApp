# 📖 Guía de API

Esta guía documenta todas las APIs disponibles en el sistema BlogApp.

## 🎯 Información General

- **Base URL**: `http://localhost:3000`
- **API Prefix**: `/api`
- **GraphQL Endpoint**: `/graphql`
- **Swagger Docs**: `/api`

## 🔐 Autenticación

### Obtener Token de Acceso

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clk123...",
    "email": "user@example.com",
    "username": "user123"
  }
}
```

### Uso del Token

Incluir en el header de todas las requests protegidas:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👤 API de Usuarios

### Obtener Todos los Usuarios

```http
GET /api/users
Authorization: Bearer {token}
```

**Query Parameters:**
- `skip`: número de registros a saltar (paginación)
- `take`: número de registros a tomar (límite)
- `where`: filtros en formato JSON

**Respuesta:**
```json
[
  {
    "id": "clk123...",
    "email": "user@example.com",
    "username": "user123",
    "createdAt": "2025-10-27T10:00:00Z",
    "updatedAt": "2025-10-27T10:00:00Z"
  }
]
```

### Obtener Usuario por ID

```http
GET /api/users/{id}
Authorization: Bearer {token}
```

### Crear Usuario

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "username": "newuser"
}
```

### Actualizar Usuario

```http
PATCH /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "updatedUsername"
}
```

### Eliminar Usuario

```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

## 📝 API de Posts

### Obtener Todos los Posts

```http
GET /api/posts
```

**Query Parameters:**
- `skip`: paginación
- `take`: límite
- `where`: filtros
- `orderBy`: ordenamiento

**Respuesta:**
```json
[
  {
    "id": "clk456...",
    "title": "Mi Primer Post",
    "content": "Contenido del post...",
    "date": "2025-10-27T12:00:00Z",
    "userId": "clk123...",
    "createdAt": "2025-10-27T10:00:00Z",
    "updatedAt": "2025-10-27T10:00:00Z"
  }
]
```

### Obtener Post por ID

```http
GET /api/posts/{id}
```

**Con relaciones:**
```http
GET /api/posts/{id}?include=user,weather
```

### Crear Post

```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nuevo Post",
  "content": "Contenido del nuevo post...",
  "date": "2025-10-27T12:00:00Z"
}
```

### Actualizar Post

```http
PATCH /api/posts/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Título Actualizado",
  "content": "Contenido actualizado..."
}
```

### Eliminar Post

```http
DELETE /api/posts/{id}
Authorization: Bearer {token}
```

## 🌤️ API de Datos Meteorológicos

### Obtener Todos los Datos Meteorológicos

```http
GET /api/weather-data
Authorization: Bearer {token}
```

### Obtener Datos Meteorológicos por ID

```http
GET /api/weather-data/{id}
Authorization: Bearer {token}
```

### Crear Datos Meteorológicos

```http
POST /api/weather-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentWeather": {
    "temperature": 25,
    "humidity": 65,
    "conditions": "sunny",
    "windSpeed": 10
  },
  "postsId": "clk456..."
}
```

## 🔍 GraphQL API

### Endpoint GraphQL

```http
POST /graphql
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": "query GetPosts { posts { id title content user { username } } }"
}
```

### Queries Disponibles

#### Obtener Posts con Usuario y Clima

```graphql
query GetPostsWithDetails {
  posts {
    id
    title
    content
    date
    user {
      id
      username
      email
    }
    weather {
      id
      currentWeather
    }
  }
}
```

#### Obtener Usuario con sus Posts

```graphql
query GetUserWithPosts($userId: String!) {
  user(where: { id: $userId }) {
    id
    username
    email
    posts {
      id
      title
      content
      date
    }
  }
}
```

#### Búsqueda de Posts

```graphql
query SearchPosts($searchTerm: String!) {
  posts(where: {
    OR: [
      { title: { contains: $searchTerm } },
      { content: { contains: $searchTerm } }
    ]
  }) {
    id
    title
    content
    user {
      username
    }
  }
}
```

### Mutations Disponibles

#### Crear Post

```graphql
mutation CreatePost($data: PostCreateInput!) {
  createPost(data: $data) {
    id
    title
    content
    date
    user {
      username
    }
  }
}
```

**Variables:**
```json
{
  "data": {
    "title": "Nuevo Post desde GraphQL",
    "content": "Contenido del post...",
    "date": "2025-10-27T12:00:00Z",
    "user": {
      "connect": {
        "id": "clk123..."
      }
    }
  }
}
```

#### Actualizar Post

```graphql
mutation UpdatePost($id: String!, $data: PostUpdateInput!) {
  updatePost(where: { id: $id }, data: $data) {
    id
    title
    content
    updatedAt
  }
}
```

#### Eliminar Post

```graphql
mutation DeletePost($id: String!) {
  deletePost(where: { id: $id }) {
    id
    title
  }
}
```

## 🔍 Filtros y Paginación

### Filtros Disponibles

```http
GET /api/posts?where={"title":{"contains":"tutorial"}}
```

### Ordenamiento

```http
GET /api/posts?orderBy={"createdAt":"desc"}
```

### Paginación

```http
GET /api/posts?skip=0&take=10
```

### Filtros Complejos

```json
{
  "where": {
    "AND": [
      {
        "title": {
          "contains": "tutorial"
        }
      },
      {
        "user": {
          "email": {
            "endsWith": "@example.com"
          }
        }
      }
    ]
  }
}
```

## 🏥 Health Check API

### Estado General del Sistema

```http
GET /api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

## 📊 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | Éxito |
| `201` | Creado |
| `400` | Request inválida |
| `401` | No autorizado |
| `403` | Acceso denegado |
| `404` | No encontrado |
| `422` | Error de validación |
| `500` | Error interno del servidor |

## 🔧 Headers Requeridos

### Para Requests JSON
```http
Content-Type: application/json
```

### Para Requests Autenticadas
```http
Authorization: Bearer {token}
```

### Para CORS
```http
Origin: http://localhost:3001
```

## 📝 Ejemplos de Uso

### JavaScript/TypeScript

```typescript
// Obtener posts
const response = await fetch('http://localhost:3000/api/posts', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const posts = await response.json();
```

### cURL

```bash
# Obtener todos los posts
curl -X GET "http://localhost:3000/api/posts" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear un post
curl -X POST "http://localhost:3000/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Nuevo Post",
    "content": "Contenido del post..."
  }'
```

## 🐛 Manejo de Errores

### Formato de Error Estándar

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Errores Comunes

| Error | Causa | Solución |
|-------|--------|----------|
| `401 Unauthorized` | Token inválido o expirado | Renovar token |
| `403 Forbidden` | Sin permisos | Verificar roles |
| `422 Validation Error` | Datos inválidos | Verificar formato |
| `404 Not Found` | Recurso no existe | Verificar ID |

Para más detalles, consulta la documentación Swagger en `/api` cuando el servidor esté corriendo.