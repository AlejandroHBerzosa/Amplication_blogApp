# 🧪 Script de Pruebas - Redis Cache

Este documento contiene instrucciones y ejemplos para probar el sistema de caché Redis implementado en el servicio weatherDatum.

## 📋 Pre-requisitos

1. ✅ Servidor backend corriendo: `npm run start:watch`
2. ✅ Redis corriendo: `docker ps | grep redis_broker` o `redis-cli ping`
3. ✅ Usuario autenticado con JWT token

## 🔧 Configuración de Pruebas

### Obtener Token de Autenticación

```bash
# POST /api/login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'

# Guardar el token de la respuesta
# TOKEN=<access_token>
```

## ✅ Prueba 1: Cache Miss (Primera Consulta)

### Crear un Post para Murcia

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Post de prueba Cache Miss",
    "content": "Este es el primer post para probar el cache"
  }'
```

### Logs Esperados

```
🚀 [POST SERVICE] Iniciando creación de post...
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clxxx, ciudad: Murcia
🌐 [WEATHER API] No hay datos en caché, consultando OpenWeatherMap API para Murcia
🌤️ [OPENWEATHER] Consultando clima para: Murcia
✅ [OPENWEATHER] Datos obtenidos: Clear, 18.5°C
💾 [WEATHER CACHE] Datos guardados en caché para Murcia (TTL: 20 minutos)
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clyyy
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado
```

### Verificación en Redis

```bash
# Conectar a Redis
redis-cli

# Verificar que la clave existe
> KEYS weather:*
1) "weather:murcia"

# Ver los datos cacheados
> GET weather:murcia
"{\"main\":\"Clear\",\"temp\":18.5}"

# Ver TTL restante (en segundos)
> TTL weather:murcia
1195  # ~20 minutos
```

---

## ✅ Prueba 2: Cache Hit (Segunda Consulta)

### Crear Otro Post Inmediatamente

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Post de prueba Cache Hit",
    "content": "Este es el segundo post para verificar que usa caché"
  }'
```

### Logs Esperados

```
🚀 [POST SERVICE] Iniciando creación de post...
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado

🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post clzzz, ciudad: Murcia
✅ [WEATHER CACHE] Datos encontrados en caché para Murcia
📊 [WEATHER CACHE] Datos: Clear, 18.5°C (desde caché)
💾 [WEATHER CACHE] Datos guardados en caché para Murcia (TTL: 20 minutos)
✅ [WEATHER SERVICE] WeatherDatum creado con ID: clwww
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado
```

### Observaciones

- ⚡ **NO** debe aparecer: "🌐 consultando OpenWeatherMap API"
- ⚡ **NO** debe aparecer: "🌤️ [OPENWEATHER] Consultando clima"
- ✅ **SÍ** debe aparecer: "✅ [WEATHER CACHE] Datos encontrados en caché"

---

## ✅ Prueba 3: Múltiples Ciudades

### Crear Posts para Diferentes Ciudades

```bash
# Post para Madrid
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Post Madrid",
    "content": "Probando cache para Madrid"
  }'

# Post para Barcelona
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Post Barcelona",
    "content": "Probando cache para Barcelona"
  }'
```

### Verificación en Redis

```bash
redis-cli

# Ver todas las claves de weather
> KEYS weather:*
1) "weather:murcia"
2) "weather:madrid"
3) "weather:barcelona"

# Ver datos de cada ciudad
> GET weather:madrid
> GET weather:barcelona
```

---

## ✅ Prueba 4: Expiración del Caché (TTL)

### Opción A: Esperar 20 Minutos (Prueba Real)

1. Crear un post
2. Esperar 20 minutos
3. Crear otro post para la misma ciudad
4. Verificar que hace nueva llamada a la API

### Opción B: Reducir TTL Temporalmente (Prueba Rápida)

**Modificar `.env` temporalmente:**

```bash
# Cambiar TTL a 30 segundos para pruebas
REDIS_CACHE_TTL=30000
```

**Reiniciar el servidor:**

```bash
# Detener con Ctrl+C
npm run start:watch
```

**Probar:**

1. Crear un post
2. Esperar 30 segundos
3. Crear otro post
4. Verificar nueva llamada a API

**Restaurar `.env`:**

```bash
# Volver a 20 minutos
REDIS_CACHE_TTL=1200000
```

---

## ✅ Prueba 5: Invalidación Manual del Caché

### Eliminar Caché de una Ciudad

```bash
redis-cli

# Eliminar caché de Murcia
> DEL weather:murcia
(integer) 1

# Verificar que ya no existe
> GET weather:murcia
(nil)
```

### Crear Post Después de Invalidación

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Post después de invalidar caché",
    "content": "Debería hacer nueva llamada a la API"
  }'
```

### Verificación

- Debe aparecer: "🌐 consultando OpenWeatherMap API"
- Debe crear nueva entrada en caché

---

## 📊 Prueba 6: Métricas de Performance

### Medir Tiempo de Respuesta

#### Sin Caché (Primera Llamada)

```bash
time curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Medición sin caché",
    "content": "Primera llamada"
  }'

# Tiempo esperado: ~200-400ms
```

#### Con Caché (Segunda Llamada)

```bash
time curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Medición con caché",
    "content": "Segunda llamada"
  }'

# Tiempo esperado: ~50-100ms
```

### Calcular Mejora de Performance

```
Mejora = (Tiempo sin caché - Tiempo con caché) / Tiempo sin caché * 100

Ejemplo:
Sin caché: 300ms
Con caché: 75ms
Mejora = (300 - 75) / 300 * 100 = 75%
```

---

## 🔍 Prueba 7: Monitoreo en Tiempo Real

### Terminal 1: Ver Logs del Servidor

```bash
cd apps/mi-backend-server
npm run start:watch

# Observar logs en tiempo real
```

### Terminal 2: Monitorear Redis

```bash
redis-cli MONITOR

# Ver todos los comandos ejecutándose:
# - GET weather:murcia
# - SET weather:murcia "..."
# - etc.
```

### Terminal 3: Ejecutar Peticiones

```bash
# Crear posts y ver el flujo en las otras terminales
curl -X POST http://localhost:3000/api/posts ...
```

---

## 🧪 Prueba 8: Estrés del Sistema de Caché

### Script de Prueba de Carga (Bash)

```bash
#!/bin/bash
# test-cache-load.sh

TOKEN="YOUR_TOKEN_HERE"
ENDPOINT="http://localhost:3000/api/posts"

echo "Iniciando prueba de carga del caché..."

for i in {1..10}; do
  echo "Petición $i..."
  curl -s -X POST $ENDPOINT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"title\": \"Post $i\",
      \"content\": \"Prueba de carga $i\"
    }" > /dev/null
  
  echo "Completada petición $i"
done

echo "Prueba completada!"
```

### Ejecutar

```bash
chmod +x test-cache-load.sh
./test-cache-load.sh
```

### Verificación

```bash
redis-cli

# Debería haber solo 1 entrada para Murcia
> KEYS weather:*
1) "weather:murcia"

# 10 posts creados, pero solo 1 llamada a OpenWeatherMap API
```

---

## ✅ Checklist de Validación

### Funcionalidad

- [ ] Primera consulta hace llamada a OpenWeatherMap API
- [ ] Segunda consulta usa datos del caché
- [ ] Logs muestran claramente "desde caché"
- [ ] Múltiples ciudades se cachean independientemente
- [ ] TTL funciona correctamente (datos expiran después de 20 min)
- [ ] Invalidación manual funciona
- [ ] Sistema continúa funcionando si Redis falla

### Performance

- [ ] Respuestas con caché son significativamente más rápidas
- [ ] No hay llamadas redundantes a OpenWeatherMap
- [ ] Memoria de Redis no crece indefinidamente
- [ ] TTL previene datos obsoletos

### Observabilidad

- [ ] Logs claros distinguiendo cache hit/miss
- [ ] Métricas visibles en Redis CLI
- [ ] Errores se manejan gracefully
- [ ] Sistema es debuggeable

---

## 📈 Resultados Esperados

### Métricas de Éxito

| Métrica | Sin Caché | Con Caché | Mejora |
|---------|-----------|-----------|--------|
| Tiempo de respuesta | 200-400ms | 50-100ms | ~75% |
| Llamadas a API | 1 por post | 1 cada 20 min | ~95% |
| Latencia promedio | 300ms | 75ms | 75% |
| Throughput | 3-5 req/s | 20-50 req/s | 400-1000% |

### Cache Hit Rate Esperado

```
Después de 100 posts para Murcia en 1 hora:
- Cache hits: ~97 (posts 2-100 dentro de TTL)
- Cache misses: ~3 (post 1, y 2 renovaciones de caché)
- Hit rate: 97%
```

---

## 🐛 Troubleshooting de Pruebas

### Problema: No veo logs de caché

**Solución:**
```bash
# Verificar que el servidor está corriendo
npm run start:watch

# Verificar nivel de logging
# Los logs deberían aparecer en la consola
```

### Problema: Siempre hace llamada a API (nunca usa caché)

**Posibles causas:**
1. Redis no está corriendo
2. Diferentes claves de caché (case-sensitive)
3. TTL muy corto
4. Caché se invalida automáticamente

**Verificar:**
```bash
# Redis corriendo
redis-cli ping  # Debe retornar PONG

# Ver claves
redis-cli KEYS weather:*

# Ver TTL
redis-cli TTL weather:murcia
```

### Problema: Caché nunca expira

**Verificar:**
```bash
# Ver TTL en Redis
redis-cli TTL weather:murcia

# Si retorna -1, no tiene TTL configurado
# Verificar REDIS_CACHE_TTL en .env
```

---

## 🎉 Conclusión de Pruebas

Si todas las pruebas pasan:

✅ Sistema de caché Redis implementado correctamente  
✅ Performance mejorada significativamente  
✅ Reducción de llamadas a API externa  
✅ Sistema resiliente y escalable  
✅ Observabilidad y debugging facilitados  

**Estado**: ✅ APROBADO PARA PRODUCCIÓN

---

**Fecha**: Octubre 2025  
**Versión**: 1.0.0  
**Autor**: Sistema de Pruebas Automatizado
