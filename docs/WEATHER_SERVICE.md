# 🌤️ Servicio de Datos Meteorológicos - Weather Integration

Este documento explica cómo funciona la integración del servicio meteorológico con OpenWeatherMap en el proyecto BlogApp.

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Flujo](#arquitectura-del-flujo)
- [Configuración](#configuración)
- [Componentes](#componentes)
- [Flujo de Eventos](#flujo-de-eventos)
- [Uso y Ejemplos](#uso-y-ejemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

El sistema de datos meteorológicos se integra automáticamente cuando se crea un nuevo post. Utiliza Redis como message broker para comunicación asíncrona entre el servicio de Posts y el servicio de WeatherDatum.

### Características Principales

- ✅ **Integración automática**: Los datos meteorológicos se obtienen automáticamente al crear un post
- ✅ **Comunicación asíncrona**: Utiliza Redis pub/sub para desacoplar servicios
- ✅ **Reintentos automáticos**: Sistema de reintentos con backoff exponencial
- ✅ **Manejo robusto de errores**: No falla la creación del post si la API meteorológica no está disponible
- ✅ **Datos en tiempo real**: Consulta la API de OpenWeatherMap en tiempo real

---

## 🏗️ Arquitectura del Flujo

```
┌──────────────┐
│   Usuario    │
│  Crea Post   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  PostService     │ ──────┐ Guarda post en BD
│  createPost()    │       │
└──────┬───────────┘       ▼
       │              ┌─────────────┐
       │ Emite        │  PostgreSQL │
       │ evento       └─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Redis Message Broker           │
│  Topic: post.create.weather_req │
└──────┬──────────────────────────┘
       │
       │ Escucha evento
       ▼
┌──────────────────────────┐
│ WeatherDatumRedisCtrl    │
│ handleWeatherRequest()   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ WeatherDatumService      │
│ processWeatherRequest()  │
└──────┬───────────────────┘
       │
       │ Llama API
       ▼
┌──────────────────────────┐
│  OpenWeatherService      │
│  getWeatherData()        │
└──────┬───────────────────┘
       │
       │ HTTP GET
       ▼
┌──────────────────────────┐
│  OpenWeatherMap API      │
│  api.openweathermap.org  │
└──────┬───────────────────┘
       │
       │ Retorna datos JSON
       ▼
┌──────────────────────────┐
│ WeatherDatumService      │
│ - Crea WeatherDatum      │
│ - Emite evento           │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Redis Message Broker       │
│  Topic: weather.data_fetched│
└──────┬──────────────────────┘
       │
       │ Escucha evento
       ▼
┌──────────────────────────┐
│  RedisController         │
│  handleWeatherDataFetch()│
│  - Log información       │
│  - Analytics (opcional)  │
└──────────────────────────┘
```

---

## ⚙️ Configuración

### 1. Obtener API Key de OpenWeatherMap

1. Visita [https://openweathermap.org/api](https://openweathermap.org/api)
2. Crea una cuenta gratuita
3. Navega a "API keys" en tu perfil
4. Copia tu API key

**Límites del plan gratuito:**
- 1,000 llamadas/día
- 60 llamadas/minuto
- Datos actuales del clima

### 2. Configurar Variables de Entorno

Crea o actualiza el archivo `.env` en `apps/mi-backend-server/`:

```bash
# OpenWeatherMap Configuration
OPENWEATHER_API_KEY=tu-api-key-aqui
```

### 3. Instalar Dependencias

```bash
cd apps/mi-backend-server
npm install axios
```

### 4. Verificar Configuración de Redis

Asegúrate de que Redis está configurado correctamente:

```bash
# Variables de Redis en .env
REDIS_BROKER_HOST=localhost  # o 'redis_broker' si usas Docker
REDIS_BROKER_PORT=6379
```

---

## 🧩 Componentes

### 1. **OpenWeatherService** (`openweather.service.ts`)

Servicio encargado de hacer las llamadas HTTP a la API de OpenWeatherMap.

**Métodos principales:**
- `getWeatherData(city)`: Obtiene datos meteorológicos para una ciudad
- `getWeatherDataWithRetry(city, retries)`: Versión con reintentos automáticos

**Datos retornados:**
```typescript
interface WeatherData {
  temperature: number;      // Temperatura en Celsius
  description: string;      // Descripción (ej: "nubes dispersas")
  humidity: number;         // Humedad en %
  windSpeed: number;        // Velocidad del viento en m/s
  feelsLike: number;       // Sensación térmica en Celsius
  city: string;            // Nombre de la ciudad
  country: string;         // Código del país
}
```

### 2. **WeatherDatumService** (`weatherDatum.service.ts`)

Servicio que procesa las solicitudes de datos meteorológicos.

**Método principal:**
- `processWeatherRequest(postId, city)`: 
  1. Llama a OpenWeatherService
  2. Guarda WeatherDatum en la base de datos
  3. Emite evento `WEATHER_DATA_FETCHED`

### 3. **WeatherDatumRedisController** (`weatherDatum.redis.controller.ts`)

Controlador que escucha eventos de solicitud de datos meteorológicos.

**Handler:**
- `@EventPattern('post.create.weather_request')`
- Recibe: `{ postId, city, timestamp }`
- Delega procesamiento a WeatherDatumService

### 4. **Topics Actualizados** (`topics.ts`)

Nuevos topics añadidos:

```typescript
export enum MessageBrokerTopics {
  // ... otros topics
  
  // Posts
  POST_CREATE_WEATHER_REQUEST = "post.create.weather_request",
  
  // Weather
  WEATHER_DATA_FETCHED = "weather.data_fetched",
}
```

---

## 🔄 Flujo de Eventos

### Evento 1: POST_CREATE_WEATHER_REQUEST

**Emisor:** `PostService.createPost()`

**Payload:**
```json
{
  "postId": "clxxxxx",
  "city": "Madrid",
  "timestamp": "2025-10-28T10:30:00.000Z"
}
```

**Receptor:** `WeatherDatumRedisController.handleWeatherRequest()`

---

### Evento 2: WEATHER_DATA_FETCHED

**Emisor:** `WeatherDatumService.processWeatherRequest()`

**Payload (éxito):**
```json
{
  "postId": "clxxxxx",
  "weatherDatumId": "clyyyyy",
  "weatherData": {
    "temperature": 18.5,
    "description": "cielo claro",
    "humidity": 60,
    "windSpeed": 3.2,
    "feelsLike": 17.8,
    "city": "Madrid",
    "country": "ES"
  },
  "timestamp": "2025-10-28T10:30:05.000Z"
}
```

**Payload (error):**
```json
{
  "postId": "clxxxxx",
  "weatherData": null,
  "error": "No se pudieron obtener datos meteorológicos",
  "timestamp": "2025-10-28T10:30:05.000Z"
}
```

**Receptor:** `RedisController.handleWeatherDataFetched()`

---

## 📖 Uso y Ejemplos

### Crear un Post con Datos Meteorológicos

#### GraphQL Mutation

```graphql
mutation {
  createPost(
    data: {
      title: "Mi post con clima"
      content: "Contenido del post"
      user: { connect: { id: "user-id" } }
    }
  ) {
    id
    title
    weather {
      id
      currentWeather
    }
  }
}
```

#### REST API

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Mi post con clima",
    "content": "Contenido del post",
    "userId": "user-id"
  }'
```

### Flujo Temporal

```
T+0ms    - POST /api/posts
T+50ms   - Post guardado en BD
T+55ms   - Evento POST_CREATE_WEATHER_REQUEST emitido
T+60ms   - Respuesta HTTP 201 al cliente ✅
T+65ms   - WeatherDatum escucha evento
T+100ms  - Llamada a OpenWeatherMap API
T+300ms  - Datos recibidos de OpenWeatherMap
T+310ms  - WeatherDatum creado en BD
T+315ms  - Evento WEATHER_DATA_FETCHED emitido
T+320ms  - RedisController procesa datos meteorológicos
```

**Nota:** El usuario recibe la respuesta en ~60ms, mientras que los datos meteorológicos se procesan asincrónicamente.

---

## 🔍 Logs del Sistema

### Logs Esperados en Creación de Post

```bash
🚀 [POST SERVICE] Iniciando creación de post...
📝 [POST SERVICE] Datos del post a crear: {...}
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATED enviado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado exitosamente

🌤️ [WEATHER REDIS HANDLER] Solicitud de datos meteorológicos recibida
📋 [WEATHER REDIS HANDLER] Post ID: clxxxxx, Ciudad: Madrid

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clxxxxx
🌤️ [OPENWEATHER] Consultando clima para: Madrid
✅ [OPENWEATHER] Datos obtenidos: 18.5°C, cielo claro
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clyyyyy
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado para post clxxxxx

🌤️ [REDIS HANDLER] Datos meteorológicos recibidos
📊 [REDIS HANDLER] Post ID: clxxxxx, Datos: {...}
✅ [REDIS HANDLER] Datos meteorológicos procesados exitosamente
🌡️ Temperatura: 18.5°C, cielo claro
```

---

## 🐛 Troubleshooting

### Problema: No se obtienen datos meteorológicos

**Síntomas:**
```bash
❌ [OPENWEATHER] API Key no configurada
```

**Solución:**
1. Verifica que `OPENWEATHER_API_KEY` está en el archivo `.env`
2. Reinicia el servidor: `npm run start:watch`

---

### Problema: API Key inválida

**Síntomas:**
```bash
❌ [OPENWEATHER] API Key inválida
```

**Solución:**
1. Verifica que la API key es correcta
2. Espera 10-15 minutos si acabas de crear la key (activación)
3. Verifica que el plan de OpenWeatherMap está activo

---

### Problema: Ciudad no encontrada

**Síntomas:**
```bash
❌ [OPENWEATHER] Ciudad no encontrada: XYZ
```

**Solución:**
1. Verifica el nombre de la ciudad en español o inglés
2. Usa nombres comunes (ej: "Madrid", "Barcelona", "London")
3. Considera parametrizar la ciudad desde el frontend en el futuro

---

### Problema: Timeout en la API

**Síntomas:**
```bash
❌ [OPENWEATHER] Error en la API: timeout
```

**Solución:**
1. Verifica tu conexión a Internet
2. El sistema tiene reintentos automáticos (3 intentos)
3. OpenWeatherMap puede estar experimentando problemas (verifica status)

---

### Problema: Redis no conecta

**Síntomas:**
```bash
❌ [REDIS] Error enviando evento POST_CREATE_WEATHER_REQUEST
```

**Solución:**
1. Verifica que Redis está corriendo:
   ```bash
   # Local
   redis-cli ping  # Debe retornar PONG
   
   # Docker
   docker ps | grep redis_broker
   ```

2. Verifica configuración de Redis en `.env`:
   ```bash
   REDIS_BROKER_HOST=localhost  # o redis_broker en Docker
   REDIS_BROKER_PORT=6379
   ```

3. Reinicia Redis:
   ```bash
   # Docker
   docker restart redis_broker
   ```

---

## 📊 Monitoreo

### Ver eventos en Redis en tiempo real

```bash
# Conectar a Redis
docker exec -it redis_broker redis-cli

# Suscribirse a todos los eventos
PSUBSCRIBE *

# Suscribirse solo a eventos de weather
PSUBSCRIBE weather.*
PSUBSCRIBE post.create.weather_request
```

### Verificar datos en la base de datos

```bash
# Conectar a PostgreSQL
docker exec -it db psql -U admin -d blog_app

# Ver WeatherDatum creados
SELECT id, "postsId", "currentWeather", "createdAt" 
FROM "WeatherDatum" 
ORDER BY "createdAt" DESC 
LIMIT 5;

# Ver Posts con Weather
SELECT p.id, p.title, w."currentWeather" 
FROM "Post" p 
LEFT JOIN "WeatherDatum" w ON w."postsId" = p.id 
ORDER BY p."createdAt" DESC 
LIMIT 5;
```

---

## 🚀 Mejoras Futuras

### Parametrización de Ciudad
Permitir que el usuario especifique la ciudad al crear el post:

```typescript
// Frontend envía
{
  title: "Post desde Barcelona",
  content: "...",
  location: "Barcelona"  // ← Nueva propiedad
}

// Backend modifica emisión del evento
await this.redisProducer.emitMessage(
  MessageBrokerTopics.POST_CREATE_WEATHER_REQUEST,
  {
    postId: createdPost.id,
    city: args.data.location || "Madrid",  // ← Usa location del post
    timestamp: new Date().toISOString()
  }
);
```

### Cache de Datos Meteorológicos
Evitar llamadas redundantes a la API:

```typescript
// Cachear datos por ciudad durante 30 minutos
const cacheKey = `weather:${city}`;
const cached = await this.cacheService.get(cacheKey);

if (cached) {
  return cached;
}

const data = await this.openWeatherService.getWeatherData(city);
await this.cacheService.set(cacheKey, data, 1800); // 30 min TTL
```

### Notificaciones de Clima Extremo
Alertar al usuario si hay condiciones climáticas extremas:

```typescript
if (weatherData.temperature > 35 || weatherData.temperature < -10) {
  await this.notificationService.send({
    userId: post.userId,
    message: `⚠️ Condiciones extremas en ${city}: ${weatherData.temperature}°C`
  });
}
```

---

## 📚 Referencias

- [Documentación de OpenWeatherMap API](https://openweathermap.org/api)
- [Documentación de Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)
- [Guía de Redis del Proyecto](./REDIS_GUIDE.md)
- [Documentación de Topics](./REDIS_TOPICS.md)

---

**📅 Última actualización:** Octubre 2025  
**🔗 Versión:** 1.0.0
