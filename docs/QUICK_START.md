# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha el proyecto BlogApp en menos de 10 minutos.

## ⚡ Setup Rápido con Docker

### 1. Clonar el repositorio
```bash
git clone https://github.com/AlejandroHBerzosa/Amplication_blogApp.git
cd Amplication_blogApp
```

### 2. Configurar variables de entorno
```bash
# Copiar y editar el archivo de configuración
cp .env.example .env
```

### 3. Levantar los servicios
```bash
cd apps/mi-backend-server
npm run docker:dev
```

### 4. Inicializar la base de datos
```bash
# En otra terminal
npm install
npm run db:init
```

### 5. Iniciar el backend
```bash
npm run start:watch
```

### 6. Iniciar el frontend admin
```bash
# En otra terminal
cd ../mi-backend-admin
npm install
npm start
```

## 🌐 URLs de Acceso

- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Swagger Docs**: http://localhost:3000/api
- **Admin Panel**: http://localhost:3001

## 👤 Usuario de Prueba

Después del seed, puedes usar:
- **Email**: admin@example.com
- **Password**: admin123

## 🔧 Comandos Útiles

```bash
# Ver logs de Docker
docker-compose logs -f

# Reset completo de la BD
npm run db:clean

# Regenerar cliente Prisma
npm run prisma:generate

# Ver estado de migraciones
npx prisma migrate status
```

## 🆘 Problemas Comunes

### Error: "Cannot find module '@nestjs/common'"
```bash
cd apps/mi-backend-server
npm install
```

### Error: "Database connection failed"
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart db
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso existente
npx kill-port 3000
```

¡Listo! Ahora tienes el proyecto corriendo completamente.