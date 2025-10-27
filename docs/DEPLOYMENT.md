# 🚀 Guía de Deployment

Esta guía detalla cómo desplegar BlogApp en diferentes entornos de producción.

## 🎯 Opciones de Deployment

1. **Docker Compose** (Recomendado para desarrollo/staging)
2. **Kubernetes** (Recomendado para producción)
3. **Cloud Platforms** (AWS, GCP, Azure)
4. **VPS/Servidor Dedicado**

## 🐳 Deployment con Docker Compose

### Preparación

#### 1. Variables de Entorno de Producción

Crear `.env.production`:
```env
# Database
DB_USER=blog_admin
DB_PASSWORD=super_secure_password_123
DB_NAME=blog_production
DB_PORT=5432

# Server
NODE_ENV=production
PORT=3000
BCRYPT_SALT=12

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-256-bits-long
JWT_EXPIRES_IN=7d

# Redis
REDIS_BROKER_HOST=redis_broker
REDIS_BROKER_PORT=6379

# GraphQL
GRAPHQL_PLAYGROUND=false
GRAPHQL_INTROSPECTION=false

# Logging
LOG_LEVEL=info
```

#### 2. Docker Compose para Producción

`docker-compose.prod.yml`:
```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./apps/mi-backend-server
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_BROKER_HOST=redis_broker
      - REDIS_BROKER_PORT=6379
    depends_on:
      db:
        condition: service_healthy
      redis_broker:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  admin:
    build:
      context: ./apps/mi-backend-admin
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  db:
    image: postgres:12-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis_broker:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - admin
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

#### 3. Configuración de Nginx

`nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream admin {
        server admin:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API Backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /graphql {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin Panel
        location / {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Deployment

```bash
# Build y deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ejecutar migraciones
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate-up
```

## ☸️ Deployment con Kubernetes

### 1. Namespace

`k8s/namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: blog-app
```

### 2. ConfigMap

`k8s/configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blog-config
  namespace: blog-app
data:
  NODE_ENV: "production"
  GRAPHQL_PLAYGROUND: "false"
  GRAPHQL_INTROSPECTION: "false"
  LOG_LEVEL: "info"
```

### 3. Secrets

`k8s/secrets.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: blog-secrets
  namespace: blog-app
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### 4. Database Deployment

`k8s/postgres.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: blog-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:12-alpine
        env:
        - name: POSTGRES_DB
          value: "blog_production"
        - name: POSTGRES_USER
          value: "blog_admin"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        ports:
        - containerPort: 5432
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: blog-app
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### 5. Backend Deployment

`k8s/backend.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: blog-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/blog-backend:latest
        envFrom:
        - configMapRef:
            name: blog-config
        env:
        - name: DB_URL
          value: "postgresql://blog_admin:$(DB_PASSWORD)@postgres-service:5432/blog_production"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: DB_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: blog-secrets
              key: JWT_SECRET
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: blog-app
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
```

### 6. Ingress

`k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blog-ingress
  namespace: blog-app
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: blog-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
      - path: /graphql
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80
```

### Deployment de Kubernetes

```bash
# Aplicar todos los manifiestos
kubectl apply -f k8s/

# Ver estado
kubectl get pods -n blog-app

# Ver logs
kubectl logs -f deployment/backend -n blog-app

# Ejecutar migraciones
kubectl exec -it deployment/backend -n blog-app -- npm run db:migrate-up
```

## ☁️ Cloud Deployment

### AWS (ECS + RDS)

#### 1. RDS Database
```bash
aws rds create-db-instance \
  --db-instance-identifier blog-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password SecurePassword123 \
  --allocated-storage 20
```

#### 2. ECS Task Definition
```json
{
  "family": "blog-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/blog-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/blog/db-url"
        }
      ]
    }
  ]
}
```

### Google Cloud (Cloud Run)

```bash
# Build y push imagen
gcloud builds submit --tag gcr.io/project-id/blog-backend

# Deploy
gcloud run deploy blog-backend \
  --image gcr.io/project-id/blog-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

## 🔧 Scripts de Deployment

### deploy.sh
```bash
#!/bin/bash

set -e

# Variables
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}

echo "🚀 Deploying BlogApp to $ENVIRONMENT..."

# Build images
echo "📦 Building images..."
docker build -t blog-backend:$IMAGE_TAG ./apps/mi-backend-server
docker build -t blog-admin:$IMAGE_TAG ./apps/mi-backend-admin

# Deploy with docker-compose
echo "🐳 Deploying with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate-up

# Health check
echo "🏥 Performing health check..."
sleep 30
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

### rollback.sh
```bash
#!/bin/bash

set -e

BACKUP_TAG=${1:-previous}

echo "🔄 Rolling back to $BACKUP_TAG..."

# Rollback containers
docker-compose -f docker-compose.prod.yml down
docker tag blog-backend:$BACKUP_TAG blog-backend:latest
docker tag blog-admin:$BACKUP_TAG blog-admin:latest
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback completed!"
```

## 📊 Monitoring en Producción

### 1. Health Checks
```bash
# Script de monitoreo
#!/bin/bash
curl -f http://localhost:3000/api/health || {
  echo "Health check failed!"
  # Enviar alerta
  curl -X POST webhook-url -d "BlogApp health check failed"
}
```

### 2. Logging
```javascript
// winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

### 3. Métricas
```javascript
// Prometheus metrics
const promClient = require('prom-client');

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

## 🔒 Seguridad en Producción

### 1. SSL/TLS
```bash
# Generar certificados con Let's Encrypt
certbot certonly --standalone -d your-domain.com
```

### 2. Firewall
```bash
# UFW rules
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
```

### 3. Backup Automático
```bash
#!/bin/bash
# backup.sh
docker exec postgres pg_dump -U blog_admin blog_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Container no inicia**
   ```bash
   docker logs container_name
   ```

2. **Base de datos no conecta**
   ```bash
   docker exec -it postgres_container psql -U admin -d blog_db
   ```

3. **Memoria insuficiente**
   ```bash
   docker stats
   # Ajustar límites en docker-compose
   ```

4. **SSL issues**
   ```bash
   openssl s_client -connect your-domain.com:443
   ```

Esta guía cubre los aspectos principales del deployment. Para entornos específicos, consulta la documentación de tu proveedor de cloud.