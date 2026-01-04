# 🚀 Guía de Deployment: Hostinger VPS + Easypanel

## I Ching Physics Oracle - Deployment Paso a Paso

Esta guía te llevará desde cero hasta tener tu aplicación funcionando en producción.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Paso 1: Contratar VPS en Hostinger](#2-paso-1-contratar-vps-en-hostinger)
3. [Paso 2: Configuración Inicial del VPS](#3-paso-2-configuración-inicial-del-vps)
4. [Paso 3: Instalar Easypanel](#4-paso-3-instalar-easypanel)
5. [Paso 4: Acceder a Easypanel](#5-paso-4-acceder-a-easypanel)
6. [Paso 5: Crear Proyecto en Easypanel](#6-paso-5-crear-proyecto-en-easypanel)
7. [Paso 6: Configurar MongoDB](#7-paso-6-configurar-mongodb)
8. [Paso 7: Configurar Backend (FastAPI)](#8-paso-7-configurar-backend-fastapi)
9. [Paso 8: Configurar Frontend (Expo Web)](#9-paso-8-configurar-frontend-expo-web)
10. [Paso 9: Configurar Dominio y SSL](#10-paso-9-configurar-dominio-y-ssl)
11. [Paso 10: Cargar Datos Iniciales](#11-paso-10-cargar-datos-iniciales)
12. [Paso 11: Verificación Final](#12-paso-11-verificación-final)
13. [Mantenimiento y Monitoreo](#13-mantenimiento-y-monitoreo)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Requisitos Previos

### Lo que necesitas antes de empezar:

- [ ] **Cuenta de Hostinger** con VPS contratado
- [ ] **Dominio** (puede ser de Hostinger o externo)
- [ ] **API Key de Google Gemini** - [Obtener aquí](https://aistudio.google.com/)
- [ ] **Código fuente** del proyecto (este repositorio)
- [ ] **Cliente SSH** (Terminal en Mac/Linux, PuTTY en Windows)

### Especificaciones mínimas del VPS:

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Almacenamiento | 20 GB SSD | 40 GB SSD |
| Sistema Operativo | Ubuntu 22.04 | Ubuntu 22.04/24.04 |

---

## 2. Paso 1: Contratar VPS en Hostinger

### 2.1 Acceder a Hostinger

1. Ir a [hostinger.com](https://www.hostinger.com)
2. Iniciar sesión o crear cuenta
3. Ir a **VPS Hosting**

### 2.2 Seleccionar Plan

Recomendación para esta aplicación:

| Plan | Precio aprox. | ¿Suficiente? |
|------|---------------|--------------|
| KVM 1 | ~$5/mes | ✅ Para desarrollo |
| KVM 2 | ~$10/mes | ✅✅ Recomendado |
| KVM 4 | ~$15/mes | ✅✅✅ Para alto tráfico |

### 2.3 Configurar VPS

Al crear el VPS, selecciona:

- **Sistema Operativo**: Ubuntu 22.04 64bit
- **Ubicación**: La más cercana a tus usuarios
- **Hostname**: `iching-oracle` (o el nombre que prefieras)

### 2.4 Guardar Credenciales

Después de crear el VPS, Hostinger te dará:

```
IP del servidor: xxx.xxx.xxx.xxx
Usuario: root
Contraseña: ************
Puerto SSH: 22
```

⚠️ **IMPORTANTE**: Guarda estas credenciales en un lugar seguro.

---

## 3. Paso 2: Configuración Inicial del VPS

### 3.1 Conectar por SSH

**En Mac/Linux:**
```bash
ssh root@TU_IP_DEL_VPS
```

**En Windows (PowerShell):**
```powershell
ssh root@TU_IP_DEL_VPS
```

**O usar PuTTY:**
1. Abrir PuTTY
2. Host Name: `TU_IP_DEL_VPS`
3. Port: `22`
4. Click en "Open"

### 3.2 Actualizar el Sistema

Una vez conectado, ejecutar:

```bash
# Actualizar lista de paquetes
apt update

# Actualizar paquetes instalados
apt upgrade -y

# Instalar herramientas básicas
apt install -y curl wget git nano htop
```

### 3.3 Configurar Firewall (Opcional pero recomendado)

```bash
# Instalar UFW
apt install -y ufw

# Configurar reglas básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Permitir puerto de Easypanel
ufw allow 3000/tcp

# Activar firewall
ufw enable

# Verificar estado
ufw status
```

---

## 4. Paso 3: Instalar Easypanel

### 4.1 Instalar con un solo comando

```bash
curl -sSL https://get.easypanel.io | sh
```

Este comando:
- Instala Docker automáticamente
- Configura Docker Compose
- Instala Easypanel
- Inicia todos los servicios

**⏱️ Tiempo estimado: 3-5 minutos**

### 4.2 Verificar instalación

```bash
# Verificar que Docker está corriendo
docker --version

# Verificar contenedores de Easypanel
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE                    STATUS         NAMES
xxxx           easypanel/easypanel      Up X minutes   easypanel
xxxx           traefik                  Up X minutes   traefik
```

---

## 5. Paso 4: Acceder a Easypanel

### 5.1 Abrir en el navegador

Abre tu navegador y ve a:

```
http://TU_IP_DEL_VPS:3000
```

### 5.2 Crear cuenta de administrador

En la primera visita, te pedirá crear una cuenta:

1. **Email**: tu-email@ejemplo.com
2. **Password**: (crea una contraseña segura)
3. Click en **"Create Account"**

### 5.3 Pantalla principal de Easypanel

Una vez dentro, verás el dashboard de Easypanel con:
- **Projects**: Lista de proyectos
- **Settings**: Configuración general
- **Monitoring**: Métricas del servidor

---

## 6. Paso 5: Crear Proyecto en Easypanel

### 6.1 Crear nuevo proyecto

1. Click en **"+ New Project"**
2. **Project Name**: `iching-oracle`
3. Click en **"Create"**

### 6.2 Estructura del proyecto

Vamos a crear 3 servicios dentro del proyecto:

```
iching-oracle/
├── mongodb      (Base de datos)
├── backend      (API FastAPI)
└── frontend     (Expo Web)
```

---

## 7. Paso 6: Configurar MongoDB

### 7.1 Añadir servicio MongoDB

#### 🖱️ Opción A: Desde la UI de Easypanel

1. Dentro del proyecto `iching-oracle`, click en **"+ Service"**
2. Seleccionar **"Database"**
3. Seleccionar **"MongoDB"**

#### 💻 Opción B: Desde Terminal SSH

Conecta al VPS por SSH y ejecuta:

```bash
# Crear directorio para el proyecto
mkdir -p /etc/easypanel/projects/iching-oracle

# Crear archivo de configuración del proyecto
cat > /etc/easypanel/projects/iching-oracle/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: iching-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: iching_user
      MONGO_INITDB_ROOT_PASSWORD: TuPasswordSeguro123!
      MONGO_INITDB_DATABASE: iching_production
    volumes:
      - mongodb_data:/data/db
    networks:
      - iching-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:

networks:
  iching-network:
    driver: bridge
EOF

# Iniciar MongoDB
cd /etc/easypanel/projects/iching-oracle
docker-compose up -d mongodb

# Verificar que está corriendo
docker ps | grep mongodb
```

### 7.2 Configurar MongoDB

| Campo | Valor |
|-------|-------|
| Service Name | `mongodb` |
| Image | `mongo:7.0` |
| Username | `iching_user` |
| Password | (genera una segura) |
| Database | `iching_production` |

### 7.3 Configurar volumen persistente

En la pestaña **"Volumes"**:

| Source | Target |
|--------|--------|
| `mongodb-data` | `/data/db` |

### 7.4 Deploy MongoDB

1. Click en **"Deploy"**
2. Esperar a que el estado sea **"Running"** ✅

### 7.5 Obtener Connection String

Una vez desplegado, tu connection string será:

```
mongodb://iching_user:TU_PASSWORD@mongodb:27017/iching_production
```

⚠️ **Guarda este string**, lo necesitarás para el backend.

### ✅ 7.6 VALIDACIÓN: Verificar MongoDB

#### Desde Terminal SSH:

```bash
# 1. Verificar que el contenedor está corriendo
echo "1️⃣ Estado del contenedor:"
docker ps | grep mongo
# ✅ Debe mostrar: iching-mongodb ... Up X minutes

# 2. Verificar logs (sin errores)
echo "2️⃣ Últimos logs:"
docker logs --tail 20 iching-mongodb
# ✅ Debe mostrar: "Waiting for connections" sin errores

# 3. Probar conexión
echo "3️⃣ Probando conexión:"
docker exec iching-mongodb mongosh --eval "db.adminCommand('ping')"
# ✅ Debe mostrar: { ok: 1 }

# 4. Verificar base de datos
echo "4️⃣ Verificando base de datos:"
docker exec iching-mongodb mongosh -u iching_user -p TuPasswordSeguro123! --authenticationDatabase admin --eval "show dbs"
# ✅ Debe mostrar lista de bases de datos
```

#### Desde Easypanel UI:

1. Ir al servicio MongoDB
2. Click en pestaña **"Logs"**
3. Verificar que muestra: `Waiting for connections on port 27017`
4. Click en pestaña **"Terminal"**
5. Ejecutar: `mongosh --eval "db.adminCommand('ping')"`

#### Checklist de validación:

| Verificación | Comando | ✅ Esperado |
|--------------|---------|-------------|
| Contenedor activo | `docker ps \| grep mongo` | Status: Up |
| Sin errores | `docker logs iching-mongodb` | Sin errores rojos |
| Ping responde | `mongosh --eval "db.adminCommand('ping')"` | `{ ok: 1 }` |
| Puerto abierto | `docker port iching-mongodb` | `27017/tcp` |

**⚠️ NO continúes al siguiente paso hasta que todas las validaciones pasen.**

---

## 8. Paso 7: Configurar Backend (FastAPI)

### 8.1 Añadir servicio de aplicación

#### 🖱️ Opción A: Desde la UI de Easypanel

1. Click en **"+ Service"**
2. Seleccionar **"App"**

#### 💻 Opción B: Desde Terminal SSH

```bash
# Navegar al directorio del proyecto
cd /etc/easypanel/projects/iching-oracle

# Clonar el repositorio (si no lo tienes)
git clone https://github.com/TU_USUARIO/iching-oracle.git /opt/iching-oracle

# Crear Dockerfile para el backend (si no existe)
cat > /opt/iching-oracle/backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

# Agregar servicio backend al docker-compose
cat >> /etc/easypanel/projects/iching-oracle/docker-compose.yml << 'EOF'

  backend:
    build:
      context: /opt/iching-oracle/backend
      dockerfile: Dockerfile
    container_name: iching-backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://iching_user:TuPasswordSeguro123!@mongodb:27017/iching_production?authSource=admin
      - DB_NAME=iching_production
      - GEMINI_USER_API_KEY=TU_API_KEY_AQUI
      - SECRET_KEY=tu-clave-secreta-generada-con-openssl
      - PORT=8001
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - iching-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Generar SECRET_KEY segura
echo "Tu SECRET_KEY generada:"
openssl rand -hex 32

# Construir y levantar el backend
docker-compose up -d --build backend

# Ver logs en tiempo real
docker logs -f iching-backend
```

### 8.2 Configuración básica

| Campo | Valor |
|-------|-------|
| Service Name | `backend` |
| Type | **GitHub** (recomendado) o **Docker Image** |

### 8.3 Opción A: Desde GitHub (Recomendado)

Si tu código está en GitHub:

1. **Repository**: `tu-usuario/iching-oracle`
2. **Branch**: `main`
3. **Root Directory**: `/backend`
4. **Dockerfile Path**: `Dockerfile`

### 8.4 Opción B: Desde Docker Image

Si prefieres subir una imagen pre-construida:

```
# En tu máquina local, construir y subir:
docker build -t tu-usuario/iching-backend:latest ./backend
docker push tu-usuario/iching-backend:latest
```

En Easypanel:
- **Image**: `tu-usuario/iching-backend:latest`

### 8.5 Configurar Variables de Entorno

En la pestaña **"Environment"**, añadir:

| Variable | Valor |
|----------|-------|
| `MONGO_URL` | `mongodb://iching_user:TU_PASSWORD@mongodb:27017/iching_production?authSource=admin` |
| `DB_NAME` | `iching_production` |
| `GEMINI_USER_API_KEY` | `AIzaSy...` (tu API key) |
| `SECRET_KEY` | (genera con `openssl rand -hex 32`) |
| `PORT` | `8001` |

### 8.6 Configurar Puerto

En la pestaña **"Domains"**:

| Campo | Valor |
|-------|-------|
| Container Port | `8001` |
| Path | `/` |

### 8.7 Configurar Health Check

En la pestaña **"Advanced"**:

| Campo | Valor |
|-------|-------|
| Health Check Path | `/api/health` |
| Health Check Interval | `30s` |

### 8.8 Deploy Backend

1. Click en **"Deploy"**
2. Ver logs para verificar que inicia correctamente
3. Estado debe ser **"Running"** ✅

### ✅ 8.9 VALIDACIÓN: Verificar Backend

#### Desde Terminal SSH:

```bash
# 1. Verificar que el contenedor está corriendo
echo "1️⃣ Estado del contenedor:"
docker ps | grep backend
# ✅ Debe mostrar: iching-backend ... Up X minutes (healthy)

# 2. Verificar logs (sin errores)
echo "2️⃣ Últimos logs:"
docker logs --tail 30 iching-backend
# ✅ Debe mostrar: "Application startup complete" sin errores

# 3. Health check interno
echo "3️⃣ Health check interno:"
docker exec iching-backend curl -s http://localhost:8001/api/health
# ✅ Debe mostrar: {"status":"healthy","database":"healthy"...}

# 4. Health check externo (si tienes dominio configurado)
echo "4️⃣ Health check externo:"
curl -s http://TU_IP_VPS:8001/api/health
# ✅ Debe mostrar el mismo JSON

# 5. Verificar conexión a MongoDB
echo "5️⃣ Verificar conexión a MongoDB:"
docker exec iching-backend python3 -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

async def test():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    await client.admin.command('ping')
    print('✅ Conexión a MongoDB exitosa')
    
asyncio.run(test())
"

# 6. Probar endpoint de login
echo "6️⃣ Probar autenticación:"
curl -s -X POST http://TU_IP_VPS:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"demo123"}' | head -c 100
# ✅ Debe mostrar: {"access_token":"eyJ...
```

#### Script de validación completa:

```bash
#!/bin/bash
# Guardar como: validate_backend.sh

API="http://localhost:8001"
echo "🔍 Validando Backend..."
echo "========================"

# Health check
echo -n "1. Health check: "
HEALTH=$(curl -s "$API/api/health")
if echo "$HEALTH" | grep -q '"healthy"'; then
    echo "✅ OK"
    echo "   $HEALTH"
else
    echo "❌ FALLO"
    echo "   $HEALTH"
    exit 1
fi

# Database
echo -n "2. Base de datos: "
if echo "$HEALTH" | grep -q '"database": "healthy"'; then
    echo "✅ Conectada"
else
    echo "❌ No conectada"
    exit 1
fi

# Crear usuario de prueba
echo -n "3. Registro de usuario: "
TIMESTAMP=$(date +%s)
REGISTER=$(curl -s -X POST "$API/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test_${TIMESTAMP}@test.com\",\"password\":\"test123\",\"name\":\"Test\"}")
if echo "$REGISTER" | grep -q 'access_token'; then
    echo "✅ OK"
else
    echo "⚠️ Usuario ya existe o error: $REGISTER"
fi

# Login
echo -n "4. Login: "
LOGIN=$(curl -s -X POST "$API/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"maria@demo.com","password":"demo123"}')
TOKEN=$(echo "$LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo "✅ OK (token obtenido)"
else
    echo "❌ FALLO"
    echo "   Respuesta: $LOGIN"
    exit 1
fi

# Obtener lecturas
echo -n "5. Obtener lecturas: "
READINGS=$(curl -s "$API/api/readings" -H "Authorization: Bearer $TOKEN")
COUNT=$(echo "$READINGS" | grep -o '"id"' | wc -l)
echo "✅ OK ($COUNT lecturas encontradas)"

echo ""
echo "🎉 Backend validado correctamente!"
```

#### Checklist de validación:

| # | Verificación | Comando | ✅ Esperado |
|---|--------------|---------|-------------|
| 1 | Contenedor activo | `docker ps \| grep backend` | Status: Up (healthy) |
| 2 | Sin errores en logs | `docker logs iching-backend` | "startup complete" |
| 3 | Health check | `curl /api/health` | `{"status":"healthy"}` |
| 4 | MongoDB conectado | Health check | `"database":"healthy"` |
| 5 | Login funciona | `POST /api/auth/login` | Token JWT |
| 6 | Variables correctas | `docker exec ... env` | Todas definidas |

**⚠️ NO continúes al siguiente paso hasta que todas las validaciones pasen.**

#### 🔧 Troubleshooting Backend:

**Error: "Cannot connect to MongoDB"**
```bash
# Verificar que MongoDB está en la misma red
docker network inspect iching-network

# Verificar MONGO_URL
docker exec iching-backend env | grep MONGO

# Probar conexión manual
docker exec iching-backend python3 -c "
from pymongo import MongoClient
client = MongoClient('mongodb://iching_user:PASSWORD@mongodb:27017/?authSource=admin')
print(client.server_info())
"
```

**Error: "Module not found"**
```bash
# Reconstruir imagen
docker-compose build --no-cache backend
docker-compose up -d backend
```

**Error: "Port already in use"**
```bash
# Ver qué usa el puerto
lsof -i :8001
# Matar proceso
kill -9 PID
```

---

## 9. Paso 8: Configurar Frontend (Expo Web)

### 9.1 Preparar el build del frontend

Primero, necesitas crear un build estático de Expo. En tu máquina local:

```bash
cd frontend

# Configurar URL del backend
echo "EXPO_PUBLIC_BACKEND_URL=https://api.tu-dominio.com" > .env.production

# Crear build web
npx expo export --platform web

# El resultado estará en ./dist/
```

### 9.2 Opción A: Servir con Nginx (Recomendado)

#### 🖱️ Desde Easypanel UI:

1. Click en **"+ Service"**
2. Seleccionar **"App"**
3. Configurar como se indica abajo

#### 💻 Desde Terminal SSH:

```bash
# Crear Dockerfile de producción para frontend
cat > /opt/iching-oracle/frontend/Dockerfile.production << 'EOF'
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Variable de entorno para el build
ARG EXPO_PUBLIC_BACKEND_URL
ENV EXPO_PUBLIC_BACKEND_URL=$EXPO_PUBLIC_BACKEND_URL

# Build para web
RUN npx expo export --platform web

# Stage 2: Servir con Nginx
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Crear configuración de Nginx
cat > /opt/iching-oracle/frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Agregar frontend al docker-compose
cat >> /etc/easypanel/projects/iching-oracle/docker-compose.yml << 'EOF'

  frontend:
    build:
      context: /opt/iching-oracle/frontend
      dockerfile: Dockerfile.production
      args:
        EXPO_PUBLIC_BACKEND_URL: https://api.tu-dominio.com
    container_name: iching-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - iching-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Construir y levantar frontend
cd /etc/easypanel/projects/iching-oracle
docker-compose up -d --build frontend

# Ver logs
docker logs -f iching-frontend
```

#### Crear nginx.conf para frontend:

```nginx
# frontend/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 9.3 Añadir servicio en Easypanel

1. Click en **"+ Service"**
2. Seleccionar **"App"**

### 9.4 Configuración del frontend

| Campo | Valor |
|-------|-------|
| Service Name | `frontend` |
| Repository | `tu-usuario/iching-oracle` |
| Branch | `main` |
| Root Directory | `/frontend` |
| Dockerfile Path | `Dockerfile.production` |

### 9.5 Variables de Entorno del Frontend

| Variable | Valor |
|----------|-------|
| `EXPO_PUBLIC_BACKEND_URL` | `https://api.tu-dominio.com` |

### 9.6 Configurar Puerto

| Campo | Valor |
|-------|-------|
| Container Port | `80` |

### 9.7 Deploy Frontend

1. Click en **"Deploy"**
2. Verificar logs
3. Estado: **"Running"** ✅

### ✅ 9.8 VALIDACIÓN: Verificar Frontend

#### Desde Terminal SSH:

```bash
# 1. Verificar contenedor
echo "1️⃣ Estado del contenedor:"
docker ps | grep frontend
# ✅ Debe mostrar: iching-frontend ... Up X minutes (healthy)

# 2. Verificar logs
echo "2️⃣ Logs de Nginx:"
docker logs --tail 20 iching-frontend
# ✅ No debe haber errores

# 3. Health check interno
echo "3️⃣ Health check:"
docker exec iching-frontend curl -s http://localhost/health
# ✅ Debe mostrar: healthy

# 4. Verificar que index.html existe
echo "4️⃣ Verificar build:"
docker exec iching-frontend ls -la /usr/share/nginx/html/
# ✅ Debe mostrar: index.html y carpetas de assets

# 5. Probar desde el host
echo "5️⃣ Acceso desde host:"
curl -s -o /dev/null -w "%{http_code}" http://localhost/
# ✅ Debe mostrar: 200

# 6. Verificar que carga el HTML
echo "6️⃣ Verificar contenido:"
curl -s http://localhost/ | head -5
# ✅ Debe mostrar: <!DOCTYPE html>...
```

#### Script de validación completa:

```bash
#!/bin/bash
# Guardar como: validate_frontend.sh

echo "🔍 Validando Frontend..."
echo "========================"

# 1. Contenedor corriendo
echo -n "1. Contenedor: "
if docker ps | grep -q iching-frontend; then
    echo "✅ Corriendo"
else
    echo "❌ No está corriendo"
    exit 1
fi

# 2. Health check
echo -n "2. Health check: "
HEALTH=$(docker exec iching-frontend curl -s http://localhost/health 2>/dev/null)
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ OK"
else
    echo "❌ Fallo: $HEALTH"
fi

# 3. Index.html existe
echo -n "3. Build existe: "
if docker exec iching-frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ OK"
else
    echo "❌ index.html no encontrado"
    exit 1
fi

# 4. HTTP response
echo -n "4. HTTP 200: "
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$CODE" = "200" ]; then
    echo "✅ OK"
else
    echo "❌ Código: $CODE"
fi

# 5. Contiene React/Expo
echo -n "5. Contenido válido: "
if curl -s http://localhost/ | grep -q "root"; then
    echo "✅ OK"
else
    echo "❌ No parece ser una app React"
fi

echo ""
echo "🎉 Frontend validado correctamente!"
```

#### Checklist de validación:

| # | Verificación | Comando | ✅ Esperado |
|---|--------------|---------|-------------|
| 1 | Contenedor activo | `docker ps \| grep frontend` | Status: Up (healthy) |
| 2 | Nginx sin errores | `docker logs iching-frontend` | Sin errores |
| 3 | Health check | `curl /health` | "healthy" |
| 4 | HTTP 200 | `curl -I http://localhost/` | HTTP 200 |
| 5 | index.html existe | `ls /usr/share/nginx/html/` | index.html presente |
| 6 | Assets cargados | Abrir en navegador | Sin errores en console |

**⚠️ NO continúes al siguiente paso hasta que todas las validaciones pasen.**

#### 🔧 Troubleshooting Frontend:

**Error: "502 Bad Gateway"**
```bash
# Verificar que nginx está corriendo
docker exec iching-frontend nginx -t
docker exec iching-frontend cat /var/log/nginx/error.log
```

**Error: "Build failed"**
```bash
# Ver logs del build
docker-compose logs frontend

# Reconstruir sin cache
docker-compose build --no-cache frontend
```

**Página en blanco:**
```bash
# Verificar que el build existe
docker exec iching-frontend ls -la /usr/share/nginx/html/

# Verificar variables de entorno durante build
docker exec iching-frontend cat /usr/share/nginx/html/index.html | grep BACKEND
```

---

## 10. Paso 9: Configurar Dominio y SSL

### 10.1 Apuntar dominio al VPS

En tu proveedor de dominio (Hostinger u otro), crear registros DNS:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` | `TU_IP_DEL_VPS` | 3600 |
| A | `api` | `TU_IP_DEL_VPS` | 3600 |
| A | `www` | `TU_IP_DEL_VPS` | 3600 |

### 10.2 Configurar dominio en Easypanel - Frontend

1. Ir al servicio **frontend**
2. Pestaña **"Domains"**
3. Click en **"+ Add Domain"**

| Campo | Valor |
|-------|-------|
| Domain | `tu-dominio.com` |
| HTTPS | ✅ Enabled |

4. Click **"Add"**

También añadir `www.tu-dominio.com` si lo deseas.

### 10.3 Configurar dominio en Easypanel - Backend

1. Ir al servicio **backend**
2. Pestaña **"Domains"**
3. Click en **"+ Add Domain"**

| Campo | Valor |
|-------|-------|
| Domain | `api.tu-dominio.com` |
| HTTPS | ✅ Enabled |

4. Click **"Add"**

### 10.4 SSL Automático

Easypanel usa **Traefik** con **Let's Encrypt** para SSL automático.

Una vez configurados los dominios:
- Los certificados SSL se generan automáticamente
- Se renuevan automáticamente cada 90 días
- El tráfico HTTP se redirige a HTTPS

⏱️ **Esperar 2-5 minutos** para que los certificados se generen.

### 10.5 Verificar SSL

```bash
# Verificar certificado
curl -I https://tu-dominio.com
curl -I https://api.tu-dominio.com/api/health
```

Deberías ver `HTTP/2 200` en las respuestas.

---

## 11. Paso 10: Cargar Datos Iniciales

### 11.1 Crear usuarios demo

Usa curl o Postman para crear usuarios de prueba:

```bash
# Crear usuario demo
curl -X POST https://api.tu-dominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@demo.com",
    "password": "demo123",
    "name": "María Demo"
  }'
```

### 11.2 Verificar que funciona

```bash
# Login
curl -X POST https://api.tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@demo.com",
    "password": "demo123"
  }'
```

Deberías recibir un token JWT.

---

## 12. Paso 11: Verificación Final

### 12.1 Checklist de verificación

Ejecuta estas pruebas:

```bash
echo "🔍 Verificando deployment..."

# 1. Health check del backend
echo "1. Backend Health:"
curl -s https://api.tu-dominio.com/api/health | jq .

# 2. Frontend accesible
echo "2. Frontend:"
curl -s -o /dev/null -w "%{http_code}" https://tu-dominio.com

# 3. Login funciona
echo "3. Login:"
curl -s -X POST https://api.tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"demo123"}' | jq .access_token

echo "✅ Verificación completada"
```

### 12.2 Probar la aplicación

1. Abrir `https://tu-dominio.com` en el navegador
2. Iniciar sesión con `maria@demo.com` / `demo123`
3. Realizar una lectura del I Ching
4. Generar interpretación con IA
5. Verificar historial

### 12.3 Probar en móvil

1. Abrir `https://tu-dominio.com` en el navegador móvil
2. Agregar a pantalla de inicio (PWA)
3. Probar funcionalidad de shake (si está disponible)

---

## 13. Mantenimiento y Monitoreo

### 13.1 Ver logs en Easypanel

1. Ir al servicio deseado
2. Click en pestaña **"Logs"**
3. Ver logs en tiempo real

### 13.2 Monitoreo de recursos

En el dashboard de Easypanel:
- **CPU Usage**: Uso de procesador
- **Memory**: Uso de RAM
- **Disk**: Espacio en disco
- **Network**: Tráfico de red

### 13.3 Backups de MongoDB

#### Backup manual:

En Easypanel, ir a MongoDB → Terminal:

```bash
mongodump --uri="mongodb://iching_user:PASSWORD@localhost:27017/iching_production" --out=/backup/$(date +%Y%m%d)
```

#### Backup automático:

Crear script en el VPS:

```bash
# /root/backup-mongodb.sh
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec mongodb mongodump \
  --uri="mongodb://iching_user:PASSWORD@localhost:27017/iching_production" \
  --archive=/backup/iching_$DATE.gz \
  --gzip

# Copiar backup fuera del contenedor
docker cp mongodb:/backup/iching_$DATE.gz $BACKUP_DIR/

# Eliminar backups mayores a 7 días
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/iching_$DATE.gz"
```

Programar con cron:

```bash
crontab -e

# Añadir (backup diario a las 3am):
0 3 * * * /root/backup-mongodb.sh >> /var/log/backup.log 2>&1
```

### 13.4 Actualizar la aplicación

Cuando hagas cambios en el código:

1. Push al repositorio de GitHub
2. En Easypanel, ir al servicio
3. Click en **"Redeploy"**

O configurar **Auto Deploy** en la pestaña "Source" para deploy automático en cada push.

---

## 14. Troubleshooting

### ❌ Error: "Cannot connect to MongoDB"

**Causa**: Backend no puede conectar a MongoDB

**Solución**:
1. Verificar que MongoDB está running en Easypanel
2. Verificar `MONGO_URL` en variables de entorno
3. Verificar que el nombre del servicio es `mongodb` (debe coincidir con la URL)

```bash
# En Easypanel terminal del backend:
curl -v mongodb:27017
```

### ❌ Error: "502 Bad Gateway"

**Causa**: El servicio no está respondiendo

**Solución**:
1. Verificar logs del servicio
2. Verificar que el puerto configurado es correcto
3. Verificar health check

### ❌ Error: "SSL Certificate Error"

**Causa**: Certificado no generado aún

**Solución**:
1. Verificar que el dominio apunta correctamente al VPS
2. Esperar 5-10 minutos
3. Verificar en Traefik logs:
   ```bash
   docker logs traefik
   ```

### ❌ Error: "Gemini API Error"

**Causa**: API Key inválida o sin cuota

**Solución**:
1. Verificar `GEMINI_USER_API_KEY` en variables
2. Verificar cuota en [Google AI Studio](https://aistudio.google.com/)
3. Regenerar API Key si es necesario

### ❌ Frontend no muestra cambios

**Causa**: Cache del navegador o build antiguo

**Solución**:
1. Limpiar cache del navegador
2. Hacer redeploy del frontend
3. Verificar que la variable `EXPO_PUBLIC_BACKEND_URL` es correcta

### 📞 Obtener ayuda

Si tienes problemas:

1. **Logs de Easypanel**: Siempre revisar primero
2. **Documentación de Easypanel**: [easypanel.io/docs](https://easypanel.io/docs)
3. **Soporte de Hostinger**: Para problemas del VPS
4. **Comunidad**: Discord de Easypanel

---

## 🎉 ¡Felicitaciones!

Si llegaste hasta aquí, tu aplicación **I Ching Physics Oracle** debería estar funcionando en:

- 🌐 **Web**: `https://tu-dominio.com`
- 🔌 **API**: `https://api.tu-dominio.com`
- 📊 **Panel**: `http://TU_IP:3000` (Easypanel)

### URLs importantes:

| Recurso | URL |
|---------|-----|
| Aplicación | `https://tu-dominio.com` |
| API | `https://api.tu-dominio.com` |
| Health Check | `https://api.tu-dominio.com/api/health` |
| API Docs | `https://api.tu-dominio.com/docs` |
| Easypanel | `http://TU_IP:3000` |

### Credenciales demo:

| Email | Password |
|-------|----------|
| maria@demo.com | demo123 |

---

## 📚 Referencias

- [Documentación de Easypanel](https://easypanel.io/docs)
- [Documentación de Hostinger VPS](https://support.hostinger.com/en/articles/1583227-how-to-manage-your-vps)
- [Guía de MongoDB](https://www.mongodb.com/docs/)
- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Documentación de Expo](https://docs.expo.dev/)

---

**Última actualización**: Enero 2026
**Versión de la guía**: 1.0
