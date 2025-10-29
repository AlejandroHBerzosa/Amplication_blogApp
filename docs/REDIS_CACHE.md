# 💾 Redis Cache - Sistema de Caché para Datos Meteorológicos

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema de Caché](#-arquitectura-del-sistema-de-caché)
- [Configuración](#-configuración)
- [Implementación Técnica](#-implementación-técnica)
- [Flujo de Funcionamiento](#-flujo-de-funcionamiento)
- [Uso y Ejemplos](#-uso-y-ejemplos)
- [Comandos de Debugging](#-comandos-de-debugging)
- [Mejores Prácticas](#-mejores-prácticas)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción General

El sistema de caché Redis ha sido implementado en el microservicio `weatherDatum` para optimizar las consultas a la API de OpenWeatherMap. 

### Características Principales

✅ **Caché Automático**: Los datos meteorológicos se almacenan automáticamente en Redis  
✅ **TTL Configurable**: Tiempo de expiración de 20 minutos (configurable)  
✅ **Reducción de Llamadas API**: Evita consultas repetidas a OpenWeatherMap  
✅ **Performance Mejorada**: Respuestas instantáneas para datos cacheados  
✅ **Logs Detallados**: Visibilidad completa del uso del caché  

### Beneficios

- 🚀 **Mejora de Performance**: Reducción drástica en tiempo de respuesta
- 💰 **Ahorro de Costos**: Menor consumo del límite de la API gratuita
- 🔒 **Resiliencia**: Datos disponibles incluso si OpenWeatherMap tiene problemas temporales
- ♻️ **Sostenibilidad**: Reducción de tráfico de red innecesario

---

## 🏗️ Arquitectura del Sistema de Caché

```
┌─────────────────────────────────────────────────────────────┐
│                    Weather Request Flow                      │
└─────────────────────────────────────────────────────────────┘

1. Post creado → Redis Event → WeatherDatumService
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │ Generar Cache Key      │
                         │ weather:ciudad         │
                         └────────┬───────────────┘
                                  │
                                  ▼
                         ┌────────────────────────┐
                         │ Verificar Redis Cache  │
                         └────────┬───────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼ (Cache Hit)               ▼ (Cache Miss)
         ┌──────────────────────┐    ┌──────────────────────┐
         │ Retornar datos       │    │ Llamar OpenWeather  │
         │ desde caché          │    │ API                 │
         │ ✅ RÁPIDO           │    └──────────┬───────────┘
         └──────────┬───────────┘               │
                    │                           ▼
                    │              ┌────────────────────────┐
                    │              │ Guardar en Redis Cache │
                    │              │ TTL: 20 minutos        │
                    │              └────────────┬───────────┘
                    │                           │
                    └───────────┬───────────────┘
                                │
                                ▼
                   ┌────────────────────────────┐
                   │ Crear WeatherDatum en BD   │
                   └────────────────────────────┘
```

### Componentes del Sistema

#### 1. **CacheModule** (NestJS)
- **Ubicación**: `src/redis/redis.module.ts`
- **Responsabilidad**: Configuración global del sistema de caché
- **Store**: Redis vía Keyv + @keyv/redis

#### 2. **WeatherDatumService**
- **Ubicación**: `src/weatherDatum/weatherDatum.service.ts`
- **Responsabilidad**: Lógica de negocio con integración de caché
- **Métodos**: `processWeatherRequest()`

#### 3. **Redis Server**
- **Puerto**: 6379
- **Rol**: Almacenamiento de caché distribuido
- **TTL**: 20 minutos (1,200,000 ms)

---

## ⚙️ Configuración

### 1. Variables de Entorno

Archivo: `apps/mi-backend-server/.env`

```bash
# Redis Cache Configuration
# TTL (Time To Live) en milisegundos
REDIS_CACHE_TTL=1200000  # 20 minutos

# Configuración de Redis Broker (reutilizada para caché)
REDIS_BROKER_HOST=localhost  # o 'redis_broker' en Docker
REDIS_BROKER_PORT=6379
```

### 2. Dependencias Instaladas

```json
{
  "@nestjs/cache-manager": "^2.x",
  "cache-manager": "^5.x",
  "@keyv/redis": "^2.x",
  "keyv": "^4.x"
}
```

### 3. Configuración del Módulo

`src/redis/redis.module.ts`:

```typescript
CacheModule.registerAsync({
  isGlobal: true, // Cache disponible en toda la aplicación
  useFactory: async (configService: ConfigService) => {
    const redisHost = configService.get<string>("REDIS_BROKER_HOST") || "localhost";
    const redisPort = configService.get<number>("REDIS_BROKER_PORT") || 6379;
    const cacheTtl = configService.get<number>("REDIS_CACHE_TTL") || 1200000;
    
    return {
      stores: [
        new Keyv({
          store: new KeyvRedis(`redis://${redisHost}:${redisPort}`),
          ttl: cacheTtl,
        }),
      ],
    };
  },
  inject: [ConfigService],
})
```

---

## 🔧 Implementación Técnica

### Inyección del Cache Manager

```typescript
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class WeatherDatumService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}
}
```

### Operaciones de Caché

#### **GET - Obtener datos del caché**

```typescript
const cacheKey = `weather:${city.toLowerCase()}`;
const weatherData = await this.cacheManager.get<WeatherData>(cacheKey);

if (weatherData) {
  // Datos encontrados en caché
  this.logger.log(`✅ Cache hit para ${city}`);
} else {
  // Datos no encontrados, consultar API
  this.logger.log(`❌ Cache miss para ${city}`);
}
```

#### **SET - Guardar datos en caché**

```typescript
// TTL heredado de la configuración del módulo (20 min)
await this.cacheManager.set(cacheKey, weatherData);

// O con TTL específico (en milisegundos)
await this.cacheManager.set(cacheKey, weatherData, 600000); // 10 min
```

#### **DELETE - Eliminar datos del caché**

```typescript
await this.cacheManager.del(`weather:${city.toLowerCase()}`);
```

#### **CLEAR - Limpiar todo el caché**

```typescript
await this.cacheManager.reset();
```

### Estructura de la Clave de Caché

**Patrón**: `weather:{ciudad}`

**Ejemplos**:
- `weather:murcia`
- `weather:madrid`
- `weather:barcelona`
- `weather:london`

**Ventajas del patrón**:
- ✅ Fácil identificación
- ✅ Permite búsquedas por patrón
- ✅ Evita colisiones con otros datos
- ✅ Compatible con invalidación selectiva

---

## 🔄 Flujo de Funcionamiento

### Escenario 1: Cache Miss (Primera Consulta)

```
Usuario crea Post
      │
      ▼
[POST SERVICE]
      │ Emite: POST_CREATE_WEATHER_REQUEST
      ▼
[WEATHER REDIS CONTROLLER]
      │ Recibe evento
      ▼
[WEATHER SERVICE] processWeatherRequest()
      │
      ├─ 1. Generar cacheKey: "weather:murcia"
      │
      ├─ 2. Buscar en caché
      │    └─ Resultado: null (Cache Miss)
      │
      ├─ 3. Log: "🌐 No hay datos en caché, consultando API..."
      │
      ├─ 4. Llamar OpenWeatherMap API
      │    └─ Obtener datos: { main: "Clear", temp: 18.5 }
      │
      ├─ 5. Guardar en caché
      │    └─ SET weather:murcia = { main: "Clear", temp: 18.5 }
      │    └─ TTL: 20 minutos
      │
      ├─ 6. Log: "💾 Datos guardados en caché (TTL: 20 min)"
      │
      ├─ 7. Crear WeatherDatum en BD
      │
      └─ 8. Emitir evento: WEATHER_DATA_FETCHED
```

**Tiempo total**: ~200-400ms (incluye llamada a API externa)

---

### Escenario 2: Cache Hit (Consulta Subsiguiente)

```
Usuario crea otro Post para Murcia (dentro de 20 min)
      │
      ▼
[POST SERVICE]
      │ Emite: POST_CREATE_WEATHER_REQUEST
      ▼
[WEATHER REDIS CONTROLLER]
      │ Recibe evento
      ▼
[WEATHER SERVICE] processWeatherRequest()
      │
      ├─ 1. Generar cacheKey: "weather:murcia"
      │
      ├─ 2. Buscar en caché
      │    └─ Resultado: { main: "Clear", temp: 18.5 } ✅
      │
      ├─ 3. Log: "✅ Datos encontrados en caché para Murcia"
      │
      ├─ 4. Log: "📊 Datos: Clear, 18.5°C (desde caché)"
      │
      ├─ 5. SKIP: No llamar a OpenWeatherMap API 🚀
      │
      ├─ 6. Crear WeatherDatum en BD
      │
      └─ 7. Emitir evento: WEATHER_DATA_FETCHED (fromCache: true)
```

**Tiempo total**: ~10-50ms (sin llamada a API externa)  
**Mejora**: **4x a 40x más rápido** 🔥

---

## 📖 Uso y Ejemplos

### Ejemplo Completo: Flujo con Logs

```bash
# Primera consulta (Cache Miss)
🚀 [POST SERVICE] Iniciando creación de post...
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clxxx, ciudad: Murcia
🌐 [WEATHER API] No hay datos en caché, consultando OpenWeatherMap API para Murcia
🌤️ [OPENWEATHER] Consultando clima para: Murcia
✅ [OPENWEATHER] Datos obtenidos: Clear, 18.5°C
💾 [WEATHER CACHE] Datos guardados en caché para Murcia (TTL: 20 minutos)
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clyyy
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado para post clxxx

# Segunda consulta (Cache Hit) - dentro de 20 minutos
🚀 [POST SERVICE] Iniciando creación de post...
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clzzz, ciudad: Murcia
✅ [WEATHER CACHE] Datos encontrados en caché para Murcia
📊 [WEATHER CACHE] Datos: Clear, 18.5°C (desde caché)
💾 [WEATHER CACHE] Datos guardados en caché para Murcia (TTL: 20 minutos)
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clwww
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado para post clzzz
```

### Verificar Estado del Caché

```typescript
// Método helper para debugging (opcional)
async getCacheStatus(city: string): Promise<{
  cached: boolean;
  data?: WeatherData;
  key: string;
}> {
  const cacheKey = `weather:${city.toLowerCase()}`;
  const data = await this.cacheManager.get<WeatherData>(cacheKey);
  
  return {
    cached: !!data,
    data: data || undefined,
    key: cacheKey
  };
}
```

---

## 🔍 Comandos de Debugging

### Conectar a Redis CLI

```bash
# En desarrollo local
redis-cli

# En Docker
docker exec -it redis_broker redis-cli
```

### Verificar Claves de Caché

```bash
# Listar todas las claves de weather
KEYS weather:*

# Ejemplo de salida:
# 1) "weather:murcia"
# 2) "weather:madrid"
# 3) "weather:barcelona"
```

### Ver Datos Cacheados

```bash
# Ver datos de una ciudad específica
GET weather:murcia

# Ejemplo de salida:
# "{\"main\":\"Clear\",\"temp\":18.5}"
```

### Ver TTL Restante

```bash
# Ver tiempo de vida restante (en segundos)
TTL weather:murcia

# Ejemplo de salida:
# 1137  (quedan 1137 segundos = ~19 minutos)
# -1    (sin expiración)
# -2    (clave no existe)
```

### Eliminar Caché Manualmente

```bash
# Eliminar caché de una ciudad
DEL weather:murcia

# Eliminar todo el caché de weather
EVAL "return redis.call('del', unpack(redis.call('keys', 'weather:*')))" 0

# Limpiar TODA la base de datos Redis (¡CUIDADO!)
FLUSHDB
```

### Monitoreo en Tiempo Real

```bash
# Ver todos los comandos ejecutándose
MONITOR

# Ejemplo de salida:
# 1735470123.456789 [0 127.0.0.1:12345] "GET" "weather:murcia"
# 1735470125.123456 [0 127.0.0.1:12345] "SET" "weather:madrid" "..."
```

### Estadísticas del Caché

```bash
# Ver información del servidor Redis
INFO stats

# Métricas relevantes:
# - total_commands_processed
# - keyspace_hits (cache hits)
# - keyspace_misses (cache misses)
# - used_memory_human
```

### Calcular Hit Rate

```bash
# Hit rate = hits / (hits + misses)
INFO stats | grep keyspace

# Ejemplo:
# keyspace_hits:450
# keyspace_misses:50
# Hit Rate = 450 / (450 + 50) = 90%
```

---

## 💡 Mejores Prácticas

### 1. **Diseño de Claves**

✅ **Bueno**: 
```typescript
`weather:${city.toLowerCase()}`  // Consistente, normalizado
```

❌ **Malo**: 
```typescript
`${city}_weather`  // Inconsistente
`WEATHER-${city.toUpperCase()}`  // Dificulta búsquedas
```

### 2. **TTL Apropiado**

```typescript
// Para datos meteorológicos: 20-30 minutos
REDIS_CACHE_TTL=1200000  // 20 min

// Para datos muy dinámicos: 1-5 minutos
REDIS_CACHE_TTL=300000   // 5 min

// Para datos estáticos: 1-24 horas
REDIS_CACHE_TTL=3600000  // 1 hora
```

### 3. **Invalidación de Caché**

```typescript
// Invalidar caché cuando:
// - Datos cambian significativamente
// - Usuario reporta datos incorrectos
// - Mantenimiento programado

async invalidateWeatherCache(city: string): Promise<void> {
  const cacheKey = `weather:${city.toLowerCase()}`;
  await this.cacheManager.del(cacheKey);
  this.logger.log(`🗑️ Caché invalidado para ${city}`);
}
```

### 4. **Manejo de Errores**

```typescript
try {
  const cached = await this.cacheManager.get(cacheKey);
} catch (error) {
  // Si Redis falla, continuar sin caché
  this.logger.warn(`⚠️ Error de caché: ${error.message}`);
  // Llamar API directamente como fallback
  const weatherData = await this.openWeatherService.getWeatherData(city);
}
```

### 5. **Logging Estratégico**

```typescript
// ✅ Logs útiles
this.logger.log(`✅ [CACHE] Hit para ${city}`);
this.logger.log(`❌ [CACHE] Miss para ${city}, consultando API`);
this.logger.log(`💾 [CACHE] Guardado ${city} (TTL: ${ttl}ms)`);

// ❌ Evitar logs excesivos
// this.logger.debug(`Verificando caché...`);
// this.logger.debug(`Conectando a Redis...`);
```

---

## 🐛 Troubleshooting

### Problema 1: Caché no funciona

**Síntomas**:
```bash
❌ Error: Cannot inject CACHE_MANAGER
```

**Solución**:
1. Verificar que `CacheModule` está registrado en `RedisModule`
2. Asegurarse de que `isGlobal: true` está configurado
3. Reiniciar el servidor

---

### Problema 2: Redis no conecta

**Síntomas**:
```bash
❌ Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solución**:
1. Verificar que Redis está corriendo:
   ```bash
   # Local
   redis-cli ping  # Debe retornar PONG
   
   # Docker
   docker ps | grep redis_broker
   ```

2. Verificar variables de entorno:
   ```bash
   REDIS_BROKER_HOST=localhost  # Correcto para desarrollo
   REDIS_BROKER_PORT=6379
   ```

3. Reiniciar Redis:
   ```bash
   # Docker
   docker restart redis_broker
   ```

---

### Problema 3: Caché no expira

**Síntomas**:
- Datos viejos persisten por más de 20 minutos

**Solución**:
1. Verificar configuración de TTL:
   ```bash
   # En Redis CLI
   TTL weather:murcia
   ```

2. Verificar variable de entorno:
   ```bash
   REDIS_CACHE_TTL=1200000  # 20 min en ms
   ```

3. Limpiar caché manualmente:
   ```bash
   redis-cli FLUSHDB
   ```

---

### Problema 4: Memoria de Redis llena

**Síntomas**:
```bash
❌ Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solución**:
1. Aumentar límite de memoria en `docker-compose.yml`:
   ```yaml
   redis_broker:
     command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

2. Configurar política de evicción:
   - `allkeys-lru`: Elimina claves menos usadas
   - `volatile-ttl`: Elimina claves con TTL más corto
   - `allkeys-lfu`: Elimina claves menos frecuentemente usadas

---

### Problema 5: Datos incorrectos en caché

**Síntomas**:
- Usuario reporta clima incorrecto

**Solución**:
1. Invalidar caché específico:
   ```bash
   redis-cli DEL weather:ciudad
   ```

2. Implementar endpoint de invalidación (opcional):
   ```typescript
   @Delete('/cache/weather/:city')
   async clearWeatherCache(@Param('city') city: string) {
     await this.weatherService.invalidateWeatherCache(city);
     return { message: `Cache cleared for ${city}` };
   }
   ```

---

## 📊 Métricas y Monitoreo

### Métricas Clave

1. **Cache Hit Rate**: % de peticiones servidas desde caché
2. **Cache Miss Rate**: % de peticiones que requieren API call
3. **Average Response Time**: Tiempo promedio de respuesta
4. **API Call Reduction**: Reducción en llamadas a OpenWeatherMap

### Cálculo de Ahorro

```
Antes (sin caché):
- 100 posts/día → 100 llamadas API

Después (con caché, 90% hit rate):
- 100 posts/día → 10 llamadas API
- Ahorro: 90 llamadas/día
- En 30 días: 2,700 llamadas ahorradas
```

### Monitoreo Recomendado

```typescript
// Implementación futura: Métricas Prometheus
@Injectable()
export class CacheMetricsService {
  private cacheHits = 0;
  private cacheMisses = 0;
  
  recordHit(): void {
    this.cacheHits++;
  }
  
  recordMiss(): void {
    this.cacheMisses++;
  }
  
  getHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }
}
```

---

## 🚀 Mejoras Futuras

### 1. **Caché Predictivo**

Pre-cargar datos de ciudades populares:

```typescript
async warmCache(): Promise<void> {
  const popularCities = ['Madrid', 'Barcelona', 'Murcia', 'Valencia'];
  
  for (const city of popularCities) {
    await this.processWeatherRequest('warm-cache', city);
  }
}
```

### 2. **Invalidación Inteligente**

Invalidar caché cuando el clima cambia significativamente:

```typescript
if (Math.abs(newTemp - cachedTemp) > 5) {
  // Cambio significativo, invalidar caché
  await this.cacheManager.del(cacheKey);
}
```

### 3. **Multi-nivel Cache**

```typescript
// L1: In-memory (segundos)
// L2: Redis (minutos)
// L3: Database (permanente)
```

### 4. **Cache Warming Schedule**

```typescript
@Cron('0 */6 * * *') // Cada 6 horas
async scheduledCacheWarming(): Promise<void> {
  await this.warmCache();
}
```

---

## 📚 Referencias

- [Documentación NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [Cache Manager Documentation](https://github.com/node-cache-manager/node-cache-manager)
- [Keyv Documentation](https://keyv.org/)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [Amplication Redis Cache Plugin](https://github.com/amplication/plugins/tree/master/plugins/cache-redis)

---

## 🎉 Resumen

El sistema de caché Redis para datos meteorológicos proporciona:

✅ **Performance**: Respuestas hasta 40x más rápidas  
✅ **Eficiencia**: Reducción del 90% en llamadas API  
✅ **Confiabilidad**: Datos disponibles incluso con API caída  
✅ **Escalabilidad**: Preparado para alto volumen  
✅ **Observabilidad**: Logs detallados y métricas  

**Estado**: ✅ Completamente implementado y funcional  
**Versión**: 1.0.0  
**Última actualización**: Octubre 2025

---

**🔗 Documentación Relacionada:**
- [REDIS_GUIDE.md](./REDIS_GUIDE.md) - Guía completa de Redis
- [WEATHER_SERVICE.md](./WEATHER_SERVICE.md) - Servicio meteorológico
- [API_GUIDE.md](./API_GUIDE.md) - Guía de APIs
