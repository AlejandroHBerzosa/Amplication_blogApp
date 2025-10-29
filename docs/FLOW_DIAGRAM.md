# 🔄 Diagrama de Flujo - Integración Meteorológica

Este documento muestra visualmente el flujo completo de la integración del servicio meteorológico.

---

## 📊 Flujo General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USUARIO CREA POST                               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   GraphQL Mutation    │
                    │   POST /api/posts     │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          POST SERVICE                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  1. Crear Post en PostgreSQL                                        │  │
│  │     ✅ Post guardado con ID: clxxxxx                                │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  2. Emitir Evento: POST_CREATED                                     │  │
│  │     Topic: "post.created"                                           │  │
│  │     Payload: { id, title, content, userId }                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  3. Emitir Evento: POST_CREATE_WEATHER_REQUEST  🌤️                 │  │
│  │     Topic: "post.create.weather_request"                            │  │
│  │     Payload: { postId: clxxxxx, city: "Madrid" }                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  4. Retornar Post al Usuario                                        │  │
│  │     HTTP 201 Created                                                │  │
│  │     ⏱️ Tiempo: ~60ms                                                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        REDIS MESSAGE BROKER                               │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Pub/Sub Topics:                                                    │  │
│  │  • post.created                    ✅ Distribuido                   │  │
│  │  • post.create.weather_request     ✅ Distribuido                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────┬───────────────────────────────────┬───────────────────────────┘
            │                                   │
            │                                   │
   ┌────────▼────────┐                 ┌────────▼────────────────┐
   │ RedisController │                 │ WeatherDatumRedisCtrl   │
   │ (General)       │                 │ (Weather-specific)      │
   └────────┬────────┘                 └────────┬────────────────┘
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐           ┌──────────────────────────────┐
   │ Log post.created│           │ Process Weather Request      │
   └─────────────────┘           └──────────────┬───────────────┘
                                                │
                                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      WEATHER DATUM SERVICE                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  processWeatherRequest(postId, city)                                │  │
│  │  ⏱️ Tiempo: ~250ms                                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      OPENWEATHER SERVICE                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  getWeatherDataWithRetry(city)                                      │  │
│  │  • Reintentos: 3 intentos                                           │  │
│  │  • Backoff: Exponencial (1s, 2s, 3s)                                │  │
│  │  • Timeout: 5 segundos por intento                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  OpenWeatherMap API   │
                    │  api.openweathermap   │
                    │  .org/data/2.5/weather│
                    └───────────┬───────────┘
                                │
                    HTTP GET Request
                    ?q=Madrid&appid=KEY&units=metric
                                │
                                ▼
                    ┌───────────────────────┐
                    │   API Response JSON   │
                    │   {                   │
                    │     main: {           │
                    │       temp: 18.5      │
                    │     },                │
                    │     weather: [...]    │
                    │   }                   │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      OPENWEATHER SERVICE (cont.)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Transformar datos:                                                 │  │
│  │  {                                                                  │  │
│  │    temperature: 18.5,                                               │  │
│  │    description: "cielo claro",                                      │  │
│  │    humidity: 60,                                                    │  │
│  │    windSpeed: 3.2,                                                  │  │
│  │    feelsLike: 17.8,                                                 │  │
│  │    city: "Madrid",                                                  │  │
│  │    country: "ES"                                                    │  │
│  │  }                                                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      WEATHER DATUM SERVICE (cont.)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  1. Crear WeatherDatum en PostgreSQL                                │  │
│  │     • postsId: clxxxxx (relación 1-1 con Post)                      │  │
│  │     • currentWeather: {...} (JSON field)                            │  │
│  │     ✅ WeatherDatum creado con ID: clyyyyyy                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  2. Emitir Evento: WEATHER_DATA_FETCHED  📨                         │  │
│  │     Topic: "weather.data_fetched"                                   │  │
│  │     Payload: {                                                      │  │
│  │       postId: clxxxxx,                                              │  │
│  │       weatherDatumId: clyyyyyy,                                     │  │
│  │       weatherData: {...}                                            │  │
│  │     }                                                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        REDIS MESSAGE BROKER                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Pub/Sub Topic:                                                     │  │
│  │  • weather.data_fetched              ✅ Distribuido                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   RedisController     │
                    │   handleWeatherData   │
                    │   Fetched()           │
                    └───────────┬───────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      REDIS CONTROLLER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Procesar evento weather.data_fetched:                              │  │
│  │                                                                     │  │
│  │  ✅ Log de información:                                             │  │
│  │     🌤️ Datos meteorológicos recibidos                              │  │
│  │     📊 Post ID: clxxxxx                                             │  │
│  │     🌡️ Temperatura: 18.5°C, cielo claro                            │  │
│  │                                                                     │  │
│  │  🚀 Acciones adicionales (futuras):                                 │  │
│  │     • Notificar al usuario                                          │  │
│  │     • Actualizar cache                                              │  │
│  │     • Analytics de uso                                              │  │
│  │     • Alertas de clima extremo                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         RESULTADO FINAL                                   │
│                                                                           │
│  Post en BD:                          WeatherDatum en BD:                │
│  ┌──────────────────────────┐         ┌──────────────────────────┐       │
│  │ id: clxxxxx              │◄────────│ id: clyyyyyy             │       │
│  │ title: "Mi post..."      │  1:1    │ postsId: clxxxxx         │       │
│  │ content: "..."           │         │ currentWeather: {        │       │
│  │ userId: user123          │         │   temperature: 18.5,     │       │
│  │ createdAt: ...           │         │   description: "...",    │       │
│  └──────────────────────────┘         │   humidity: 60,          │       │
│                                       │   windSpeed: 3.2,        │       │
│                                       │   ...                    │       │
│                                       │ }                        │       │
│                                       │ createdAt: ...           │       │
│                                       └──────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline Temporal

```
T+0ms    ┌─────────────────────────────────────┐
         │ Usuario envía POST /api/posts       │
         └─────────────────────────────────────┘

T+50ms   ┌─────────────────────────────────────┐
         │ Post guardado en PostgreSQL         │
         └─────────────────────────────────────┘

T+55ms   ┌─────────────────────────────────────┐
         │ Evento POST_CREATED emitido         │
         │ Evento POST_CREATE_WEATHER_REQUEST  │
         └─────────────────────────────────────┘

T+60ms   ┌─────────────────────────────────────┐
         │ ✅ Respuesta HTTP 201 al cliente    │ ← Usuario recibe respuesta
         └─────────────────────────────────────┘

T+65ms   ┌─────────────────────────────────────┐
         │ WeatherDatumRedisController escucha │
         └─────────────────────────────────────┘

T+70ms   ┌─────────────────────────────────────┐
         │ OpenWeatherService.getWeatherData() │
         └─────────────────────────────────────┘

T+100ms  ┌─────────────────────────────────────┐
         │ HTTP GET a api.openweathermap.org   │
         └─────────────────────────────────────┘

T+300ms  ┌─────────────────────────────────────┐
         │ Datos recibidos de OpenWeatherMap   │
         └─────────────────────────────────────┘

T+310ms  ┌─────────────────────────────────────┐
         │ WeatherDatum creado en PostgreSQL   │
         └─────────────────────────────────────┘

T+315ms  ┌─────────────────────────────────────┐
         │ Evento WEATHER_DATA_FETCHED emitido │
         └─────────────────────────────────────┘

T+320ms  ┌─────────────────────────────────────┐
         │ RedisController procesa evento      │
         │ ✅ Todo completado                  │
         └─────────────────────────────────────┘
```

**Ventaja clave:** El usuario recibe su respuesta en ~60ms, mientras el procesamiento pesado (API meteorológica) ocurre asincrónicamente en background.

---

## 🔀 Manejo de Errores

### Escenario: OpenWeatherMap API falla

```
Post Service
     │
     ├─ Crear Post ──────────────────► ✅ Post guardado (éxito)
     │
     ├─ Emitir POST_CREATED ─────────► ✅ Evento emitido
     │
     └─ Emitir POST_CREATE_WEATHER_REQUEST ──► ✅ Evento emitido
                │
                ▼
        WeatherDatumService
                │
                ├─ Llamar OpenWeatherMap API
                │        │
                │        └─► ❌ Error 401 (API key inválida)
                │        └─► ❌ Error 404 (Ciudad no encontrada)
                │        └─► ❌ Timeout
                │
                ├─ Reintentos (3 veces)
                │        │
                │        └─► ❌ Todos fallan
                │
                └─ Emitir WEATHER_DATA_FETCHED
                           │
                           └─► Payload: {
                                 postId: clxxxxx,
                                 weatherData: null,
                                 error: "No se pudieron obtener datos"
                               }
                │
                ▼
        RedisController
                │
                └─► ⚠️ Log: "No se pudieron obtener datos meteorológicos"

RESULTADO: Post creado exitosamente, pero sin datos meteorológicos
           El sistema NO falla, maneja el error gracefully
```

---

## 🔄 Reintentos Automáticos

```
OpenWeatherService.getWeatherDataWithRetry(city, retries=3)
     │
     ├─ Intento 1
     │    └─► ❌ Timeout
     │         └─ Esperar 1 segundo (backoff)
     │
     ├─ Intento 2
     │    └─► ❌ Error de red
     │         └─ Esperar 2 segundos (backoff)
     │
     ├─ Intento 3
     │    └─► ✅ Éxito
     │         └─ Retornar datos
     │
     └─► ✅ WeatherData { temperature: 18.5, ... }
```

---

## 📊 Eventos Redis en Detalle

### Evento 1: POST_CREATE_WEATHER_REQUEST

```json
Topic: "post.create.weather_request"

Payload: {
  "postId": "clxxxxx",
  "city": "Madrid",
  "timestamp": "2025-10-28T10:30:00.123Z"
}

Publisher: PostService
Subscriber: WeatherDatumRedisController
```

### Evento 2: WEATHER_DATA_FETCHED

```json
Topic: "weather.data_fetched"

Payload (Éxito): {
  "postId": "clxxxxx",
  "weatherDatumId": "clyyyyyy",
  "weatherData": {
    "temperature": 18.5,
    "description": "cielo claro",
    "humidity": 60,
    "windSpeed": 3.2,
    "feelsLike": 17.8,
    "city": "Madrid",
    "country": "ES"
  },
  "timestamp": "2025-10-28T10:30:05.456Z"
}

Payload (Error): {
  "postId": "clxxxxx",
  "weatherData": null,
  "error": "API Key inválida",
  "timestamp": "2025-10-28T10:30:05.456Z"
}

Publisher: WeatherDatumService
Subscriber: RedisController
```

---

## 🗄️ Modelo de Datos

### Relación en Base de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                          Post                               │
├─────────────────────────────────────────────────────────────┤
│ id            String      @id @default(cuid())              │
│ title         String      @unique                           │
│ content       String                                        │
│ date          DateTime?                                     │
│ createdAt     DateTime    @default(now())                   │
│ updatedAt     DateTime    @updatedAt                        │
│ userId        String?                                       │
│ user          User?       @relation(...)                    │
│ weather       WeatherDatum? ◄─────────────────┐             │
└──────────────────────────────────────────────┼─────────────┘
                                               │ 1:1
                                               │
                               ┌───────────────┼─────────────────────────────┐
                               │               │        WeatherDatum         │
                               ├───────────────┴─────────────────────────────┤
                               │ id               String    @id @default(...) │
                               │ postsId          String?   @unique           │
                               │ posts            Post?     @relation(...)    │
                               │ currentWeather   Json?                       │
                               │ createdAt        DateTime  @default(now())   │
                               │ updatedAt        DateTime  @updatedAt        │
                               └──────────────────────────────────────────────┘

Relación: Cada Post puede tener exactamente un WeatherDatum (0 o 1)
         Cada WeatherDatum pertenece a exactamente un Post
```

---

## 🎯 Puntos Clave del Diseño

### 1. **Asincronía**
- ✅ El usuario NO espera a que se obtengan los datos meteorológicos
- ✅ Respuesta rápida (~60ms)
- ✅ Procesamiento en background

### 2. **Desacoplamiento**
- ✅ PostService no conoce a WeatherDatumService
- ✅ Comunicación vía eventos Redis
- ✅ Fácil añadir nuevos consumidores

### 3. **Resiliencia**
- ✅ Reintentos automáticos (3 intentos)
- ✅ Backoff exponencial
- ✅ No falla si la API meteorológica está caída

### 4. **Extensibilidad**
- ✅ Fácil añadir nuevos handlers
- ✅ Fácil modificar la lógica sin afectar otros componentes
- ✅ Preparado para cache, notificaciones, etc.

---

## 📚 Referencias

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumen técnico
- [WEATHER_SERVICE.md](./WEATHER_SERVICE.md) - Documentación completa
- [REDIS_GUIDE.md](./REDIS_GUIDE.md) - Arquitectura Redis
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Cómo probar

---

**📅 Última actualización:** Octubre 28, 2025
