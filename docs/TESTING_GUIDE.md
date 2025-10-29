# 🌤️ Prueba de Integración Meteorológica

## ✅ Todo Listo - Próximos Pasos

La implementación del microservicio meteorológico está **completa**. Solo falta configurar la API key y probar.

---

## 🚀 Configuración Final (2 minutos)

### 1. Obtener API Key de OpenWeatherMap

```bash
# 1. Visita: https://openweathermap.org/api
# 2. Click en "Sign Up" (es gratis)
# 3. Verifica tu email
# 4. Ve a "API keys" en tu dashboard
# 5. Copia la "Default API Key"
```

### 2. Configurar en el Proyecto

Edita el archivo: `apps/mi-backend-server/.env`

```bash
# Añade tu API key
OPENWEATHER_API_KEY=TU_API_KEY_AQUI
```

**⚠️ Importante:** Si acabas de crear la API key, espera 10-15 minutos para que se active.

---

## 🧪 Probar la Integración

### Paso 1: Iniciar Redis

```bash
# Con Docker
cd C:\Users\mahp2\amplication\Amplication_blogApp-1
docker-compose up -d redis_broker

# Verificar que está corriendo
docker ps | grep redis_broker
```

### Paso 2: Iniciar el Servidor

```bash
cd apps\mi-backend-server
npm run start:watch
```

### Paso 3: Crear un Usuario (si no tienes uno)

**GraphQL Mutation en http://localhost:3000/graphql**

```graphql
mutation {
  signup(
    credentials: {
      username: "testuser"
      password: "test1234"
    }
  ) {
    accessToken
    username
  }
}
```

Guarda el `accessToken` que recibes.

### Paso 4: Crear un Post con Datos Meteorológicos

**GraphQL Mutation:**

```graphql
mutation {
  createPost(
    data: {
      title: "Mi primer post con clima"
      content: "Este post tendrá datos meteorológicos automáticamente"
      user: { connect: { username: "testuser" } }
    }
  ) {
    id
    title
    content
    createdAt
    weather {
      id
      currentWeather
      createdAt
    }
  }
}
```

**Headers necesarios:**
```json
{
  "Authorization": "Bearer TU_ACCESS_TOKEN_AQUI"
}
```

---

## 📊 Logs Esperados

Si todo funciona correctamente, en la consola del servidor verás:

```bash
🚀 [POST SERVICE] Iniciando creación de post...
📝 [POST SERVICE] Datos del post a crear: {...}
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATED enviado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado exitosamente

🎉 [REDIS HANDLER] Nuevo post creado recibido
🌤️ [WEATHER REDIS HANDLER] Solicitud de datos meteorológicos recibida
📋 [WEATHER REDIS HANDLER] Post ID: clxxxxx, Ciudad: Madrid

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clxxxxx
🌤️ [OPENWEATHER] Consultando clima para: Madrid
✅ [OPENWEATHER] Datos obtenidos: 18.5°C, cielo claro
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clyyyyy
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado para post clxxxxx

🌤️ [REDIS HANDLER] Datos meteorológicos recibidos
📊 [REDIS HANDLER] Post ID: clxxxxx
✅ [REDIS HANDLER] Datos meteorológicos procesados exitosamente
🌡️ Temperatura: 18.5°C, cielo claro
```

---

## 🔍 Verificar en la Base de Datos

### Conectar a PostgreSQL

```bash
docker exec -it db psql -U admin -d my-db
```

### Consultas SQL

```sql
-- Ver el último WeatherDatum creado
SELECT 
  id, 
  "postsId", 
  "currentWeather"::text,
  "createdAt" 
FROM "WeatherDatum" 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Ver Posts con sus datos meteorológicos
SELECT 
  p.id,
  p.title,
  p."createdAt" as post_created,
  w.id as weather_id,
  w."currentWeather"::text as weather_data
FROM "Post" p 
LEFT JOIN "WeatherDatum" w ON w."postsId" = p.id 
ORDER BY p."createdAt" DESC 
LIMIT 5;

-- Salir
\q
```

---

## 🐛 Troubleshooting

### ❌ Error: "API Key no configurada"

**Solución:**
```bash
# Verifica que el .env tiene la key
cat apps\mi-backend-server\.env | Select-String "OPENWEATHER"

# Debe mostrar:
# OPENWEATHER_API_KEY=tu-key-aqui

# Si no aparece, añádela y reinicia el servidor
```

### ❌ Error: "API Key inválida" (401)

**Solución:**
```bash
# La API key puede tardar 10-15 minutos en activarse
# Espera un poco y vuelve a intentar

# Verifica en https://openweathermap.org/
# Panel > API keys > Estado debe ser "Active"
```

### ❌ Error: "Ciudad no encontrada" (404)

**Solución:**
```bash
# Actualmente la ciudad está hardcodeada a "Madrid"
# Verifica que OpenWeatherMap tiene datos para Madrid

# Para cambiar la ciudad temporalmente, edita:
# src/post/post.service.ts
# Línea con: city: "Madrid"
```

### ❌ Error: Redis no conecta

**Solución:**
```bash
# Verifica Redis
docker ps | grep redis_broker

# Si no está corriendo
docker-compose up -d redis_broker

# Verifica que .env tiene:
REDIS_BROKER_HOST=localhost  # o redis_broker con Docker
REDIS_BROKER_PORT=6379
```

### ❌ El campo weather es null

**Posibles causas:**

1. **La API key no funciona:** Verifica en los logs si hay error 401
2. **Aún no se procesó:** Es asíncrono, espera 1-2 segundos y vuelve a consultar
3. **Redis no está corriendo:** Verifica con `docker ps`

**Query para verificar después:**
```graphql
query {
  post(where: { id: "TU_POST_ID" }) {
    id
    title
    weather {
      id
      currentWeather
    }
  }
}
```

---

## 📈 Monitoreo en Tiempo Real

### Ver eventos de Redis

```bash
# Conectar a Redis
docker exec -it redis_broker redis-cli

# Suscribirse a todos los eventos
PSUBSCRIBE *

# Solo eventos de weather
PSUBSCRIBE weather.*
PSUBSCRIBE post.create.weather_request

# Presiona Ctrl+C para salir
```

### Ver logs del servidor

```bash
# En Windows PowerShell
cd apps\mi-backend-server
npm run start:watch

# Los logs mostrarán todos los eventos en tiempo real
```

---

## 🎯 Resultado Esperado

Cuando creas un post, deberías obtener una respuesta como:

```json
{
  "data": {
    "createPost": {
      "id": "clxxxxxx",
      "title": "Mi primer post con clima",
      "content": "Este post tendrá datos meteorológicos automáticamente",
      "createdAt": "2025-10-28T10:30:00.000Z",
      "weather": {
        "id": "clyyyyyy",
        "currentWeather": {
          "city": "Madrid",
          "country": "ES",
          "humidity": 60,
          "feelsLike": 17.8,
          "windSpeed": 3.2,
          "description": "cielo claro",
          "temperature": 18.5
        },
        "createdAt": "2025-10-28T10:30:05.000Z"
      }
    }
  }
}
```

---

## 📚 Documentación Completa

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumen de la implementación
- [WEATHER_SERVICE.md](./WEATHER_SERVICE.md) - Documentación técnica detallada
- [WEATHER_SETUP.md](./WEATHER_SETUP.md) - Guía de configuración rápida
- [REDIS_GUIDE.md](./REDIS_GUIDE.md) - Arquitectura de Redis
- [API_GUIDE.md](./API_GUIDE.md) - Guía completa de APIs

---

## ✅ Checklist Final

- [ ] Obtener API key de OpenWeatherMap
- [ ] Añadir API key al archivo `.env`
- [ ] Iniciar Redis (`docker-compose up -d redis_broker`)
- [ ] Iniciar servidor (`npm run start:watch`)
- [ ] Crear un usuario de prueba
- [ ] Crear un post
- [ ] Verificar logs del servidor
- [ ] Verificar que el campo `weather` tiene datos
- [ ] Verificar en la base de datos

---

## 🎉 ¡Éxito!

Si todos los logs aparecen correctamente y el campo `weather` tiene datos meteorológicos, 
**¡la integración está funcionando perfectamente!** 🌤️

El sistema ahora obtiene automáticamente datos del clima de Madrid cada vez que se crea un post,
usando una arquitectura asíncrona basada en eventos con Redis como message broker.

---

**¿Necesitas ayuda?** Consulta la sección de Troubleshooting o revisa los documentos técnicos.
