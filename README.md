# Amplication_blogApp
App de prueba en Amplication

## Prueba que funcione el servicio

Para verificar que el servicio funciona correctamente, sigue estos pasos:

### 1. Iniciar el servicio

Primero, navega al directorio del servidor y sigue las instrucciones de instalación:

```bash
cd apps/mi-backend-server
npm install
npm run prisma:generate
npm run docker:dev
npm run db:init
npm run start
```

O usando Docker Compose:

```bash
cd apps/mi-backend-server
npm run compose:up
```

### 2. Verificar el estado del servicio

Una vez que el servicio esté en ejecución, puedes verificar su estado con los siguientes endpoints:

#### Verificar si el servicio está activo:
```bash
curl http://localhost:3000/api/_health/live
```
Respuesta esperada: HTTP 204 (No Content)

#### Verificar si la base de datos está lista:
```bash
curl http://localhost:3000/api/_health/ready
```
Respuesta esperada: HTTP 204 (No Content)

### 3. Acceder a la documentación de la API

Abre tu navegador y visita:
```
http://localhost:3000/api
```

Aquí encontrarás la documentación completa de Swagger con todos los endpoints disponibles.

### 4. Probar la autenticación y los endpoints

El servicio viene con un usuario por defecto:
- **Usuario**: admin
- **Contraseña**: admin

Puedes usar estos credenciales para autenticarte y probar los diferentes endpoints a través de Swagger o mediante llamadas directas a la API.

#### Ejemplo con curl:
```bash
# Login para obtener el token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# Usa el token recibido para llamadas autenticadas
curl http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Admin UI (Opcional)

También puedes iniciar la interfaz de administración:

```bash
cd apps/mi-backend-admin
npm install
npm run start
```

La interfaz estará disponible en `http://localhost:3001` (o el puerto configurado en vite).
