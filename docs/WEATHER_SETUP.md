# ⚡ Setup Rápido - Servicio Meteorológico

Guía rápida para configurar el servicio de datos meteorológicos en 5 minutos.

## 🚀 Pasos de Configuración

### 1️⃣ Obtener API Key de OpenWeatherMap

```bash
# 1. Visita: https://openweathermap.org/api
# 2. Regístrate gratis (1,000 llamadas/día)
# 3. Ve a "API keys" en tu perfil
# 4. Copia la API key
```

### 2️⃣ Configurar Variable de Entorno

Añade a tu archivo `.env` en `apps/mi-backend-server/`:

```bash
# OpenWeatherMap API
OPENWEATHER_API_KEY=tu-api-key-aqui
```

### 3️⃣ Instalar Dependencias (si no está instalado)

```bash
cd apps/mi-backend-server
npm install axios
```

### 4️⃣ Verificar Redis

Asegúrate de que Redis está corriendo:

```bash
# Con Docker
docker ps | grep redis_broker

# Si no está corriendo
docker-compose up -d redis_broker
```

### 5️⃣ Iniciar el Servidor

```bash
cd apps/mi-backend-server
npm run start:watch
```

## ✅ Verificar Funcionamiento

### Crear un Post de Prueba

**GraphQL:**
```graphql
mutation {
  createPost(
    data: {
      title: "Test con clima"
      content: "Probando integración meteorológica"
      user: { connect: { id: "tu-user-id" } }
    }
  ) {
    id
    title
    weather {
      currentWeather
    }
  }
}
```

### Logs Esperados

Si todo funciona correctamente, verás:

```bash
🚀 [POST SERVICE] Iniciando creación de post...
✅ [POST SERVICE] Post creado exitosamente
📨 [REDIS] Evento POST_CREATED enviado exitosamente
📨 [REDIS] Evento POST_CREATE_WEATHER_REQUEST enviado exitosamente

🌤️ [WEATHER REDIS HANDLER] Solicitud de datos meteorológicos recibida
🌤️ [WEATHER SERVICE] Procesando solicitud de clima para post...
🌤️ [OPENWEATHER] Consultando clima para: Madrid
✅ [OPENWEATHER] Datos obtenidos: 18.5°C, cielo claro
✅ [WEATHER SERVICE] WeatherDatum creado con ID: ...
📨 [REDIS] Evento WEATHER_DATA_FETCHED enviado

🌤️ [REDIS HANDLER] Datos meteorológicos recibidos
✅ [REDIS HANDLER] Datos meteorológicos procesados exitosamente
🌡️ Temperatura: 18.5°C, cielo claro
```

## 🐛 Troubleshooting Rápido

### ❌ "API Key no configurada"
```bash
# Verifica el archivo .env
cat apps/mi-backend-server/.env | grep OPENWEATHER

# Debe mostrar:
OPENWEATHER_API_KEY=tu-api-key
```

### ❌ "API Key inválida"
```bash
# Espera 10-15 minutos si acabas de crear la key
# Verifica que la key es correcta en openweathermap.org
```

### ❌ "Redis no conecta"
```bash
# Verifica Redis
docker ps | grep redis_broker

# Reinicia Redis si es necesario
docker restart redis_broker

# Verifica configuración en .env
REDIS_BROKER_HOST=redis_broker  # para Docker
REDIS_BROKER_PORT=6379
```

## 📚 Documentación Completa

Para más detalles, consulta:
- [WEATHER_SERVICE.md](./WEATHER_SERVICE.md) - Documentación completa
- [REDIS_GUIDE.md](./REDIS_GUIDE.md) - Guía de Redis
- [API_GUIDE.md](./API_GUIDE.md) - Guía de APIs

---

**🎉 ¡Listo!** El servicio meteorológico está configurado y funcionando.
