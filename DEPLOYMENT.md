# 📦 Guía de Deployment - I Ching Physics Oracle

Esta guía detalla el proceso completo para desplegar la aplicación en producción.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Opciones de Deployment](#opciones-de-deployment)
3. [Deployment en VPS/Cloud](#deployment-en-vpscloud)
4. [Deployment en Railway](#deployment-en-railway)
5. [Deployment en Render](#deployment-en-render)
6. [Deployment en Vercel + Railway](#deployment-en-vercel--railway)
7. [Configuración de MongoDB Atlas](#configuración-de-mongodb-atlas)
8. [Publicar en App Stores](#publicar-en-app-stores)
9. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🔧 Requisitos Previos

### Cuentas Necesarias
- [ ] Cuenta de MongoDB Atlas (o MongoDB self-hosted)
- [ ] API Key de Google Gemini
- [ ] Cuenta en plataforma de hosting (Railway, Render, VPS, etc.)
- [ ] (Opcional) Cuenta de Expo para builds nativos
- [ ] (Opcional) Cuentas de Apple Developer / Google Play Console

### Variables de Entorno Requeridas

**Backend:**
```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/iching
DB_NAME=iching_production
GEMINI_USER_API_KEY=your_gemini_api_key
SECRET_KEY=tu-clave-secreta-muy-segura-de-produccion
```

**Frontend:**
```env
EXPO_PUBLIC_BACKEND_URL=https://tu-api.dominio.com
```

---

## 🌐 Opciones de Deployment

| Plataforma | Backend | Frontend | Base de Datos | Costo Aprox. |
|------------|---------|----------|---------------|---------------|
| Railway | ✅ | ✅ | ✅ MongoDB | $5-20/mes |
| Render | ✅ | ✅ | MongoDB Atlas | $0-25/mes |
| Vercel + Railway | Railway | Vercel | MongoDB Atlas | $0-20/mes |
| VPS (DigitalOcean) | ✅ | ✅ | ✅ | $6-24/mes |
| AWS | ✅ | ✅ | ✅ | Variable |

---

## 🖥️ Deployment en VPS/Cloud

### Paso 1: Preparar el Servidor

```bash
# Conectar al servidor
ssh root@tu-servidor-ip

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx certbot python3-certbot-nginx

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Paso 2: Clonar y Configurar Backend

```bash
# Clonar repositorio
cd /opt
git clone <tu-repo> iching-oracle
cd iching-oracle/backend

# Crear entorno virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=iching_production
GEMINI_USER_API_KEY=tu_api_key_aqui
SECRET_KEY=$(openssl rand -hex 32)
EOF
```

### Paso 3: Configurar Systemd Service

```bash
sudo cat > /etc/systemd/system/iching-backend.service << EOF
[Unit]
Description=I Ching Oracle Backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/iching-oracle/backend
Environment="PATH=/opt/iching-oracle/backend/venv/bin"
ExecStart=/opt/iching-oracle/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable iching-backend
sudo systemctl start iching-backend
```

### Paso 4: Configurar Frontend (Build Estático)

```bash
cd /opt/iching-oracle/frontend

# Instalar dependencias
npm install

# Configurar URL del backend
echo "EXPO_PUBLIC_BACKEND_URL=https://tu-dominio.com" > .env

# Build para web
npx expo export --platform web

# Mover build a directorio de nginx
sudo mkdir -p /var/www/iching
sudo cp -r dist/* /var/www/iching/
```

### Paso 5: Configurar Nginx

```bash
sudo cat > /etc/nginx/sites-available/iching << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/iching;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/iching /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 6: Configurar SSL con Let's Encrypt

```bash
sudo certbot --nginx -d tu-dominio.com
```

---

## 🚂 Deployment en Railway

Railway es ideal para deployments rápidos con MongoDB incluido.

### Paso 1: Crear Proyecto en Railway

1. Ir a [railway.app](https://railway.app)
2. Click en "New Project"
3. Seleccionar "Deploy from GitHub repo"

### Paso 2: Configurar Backend

1. Añadir servicio desde el repo (seleccionar carpeta `/backend`)
2. Añadir MongoDB desde "Add Service" → "Database" → "MongoDB"
3. Configurar variables de entorno:

```env
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_NAME=iching_production
GEMINI_USER_API_KEY=tu_api_key
SECRET_KEY=tu_clave_secreta
PORT=8001
```

4. Crear `railway.json` en `/backend`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Paso 3: Configurar Frontend

1. Añadir otro servicio desde el mismo repo (carpeta `/frontend`)
2. Configurar build command: `npm run build:web`
3. Variables de entorno:

```env
EXPO_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
```

---

## 🎨 Deployment en Render

### Backend (Web Service)

1. Crear "New Web Service"
2. Conectar repo de GitHub
3. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. Variables de entorno:
```env
MONGO_URL=mongodb+srv://...
DB_NAME=iching_production
GEMINI_USER_API_KEY=...
SECRET_KEY=...
```

### Frontend (Static Site)

1. Crear "New Static Site"
2. Conectar repo
3. Configurar:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npx expo export --platform web`
   - **Publish Directory**: `dist`

---

## 🗄️ Configuración de MongoDB Atlas

### Paso 1: Crear Cluster

1. Ir a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cuenta/login
3. "Build a Database" → "M0 Free Tier"
4. Seleccionar región cercana

### Paso 2: Configurar Acceso

1. **Database Access** → Create user:
   - Username: `iching_user`
   - Password: (generar contraseña segura)
   - Role: `readWriteAnyDatabase`

2. **Network Access** → Add IP:
   - Para desarrollo: tu IP actual
   - Para producción: IP del servidor o `0.0.0.0/0` (menos seguro)

### Paso 3: Obtener Connection String

1. Click en "Connect"
2. "Connect your application"
3. Copiar string y reemplazar `<password>`:

```
mongodb+srv://iching_user:TU_PASSWORD@cluster0.xxxxx.mongodb.net/iching_production?retryWrites=true&w=majority
```

---

## 📱 Publicar en App Stores

### Expo Application Services (EAS)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure
```

### Build para iOS

```bash
# Crear build para TestFlight
eas build --platform ios

# Subir a App Store Connect
eas submit --platform ios
```

### Build para Android

```bash
# Crear AAB para Play Store
eas build --platform android

# Subir a Google Play Console
eas submit --platform android
```

### Configuración en `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_BACKEND_URL": "https://api.tu-dominio.com"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## ✅ Post-Deployment Checklist

### Verificaciones Críticas

- [ ] Health check responde correctamente: `GET /api/health`
- [ ] Login funciona con usuarios demo
- [ ] Se pueden crear nuevas lecturas
- [ ] La interpretación IA genera respuestas
- [ ] Los hexagramas se calculan correctamente
- [ ] El historial se guarda y recupera

### Seguridad

- [ ] HTTPS configurado y funcionando
- [ ] `SECRET_KEY` es única y segura
- [ ] API Key de Gemini no expuesta en frontend
- [ ] MongoDB tiene autenticación habilitada
- [ ] CORS configurado solo para dominios permitidos

### Monitoreo

- [ ] Logs configurados y accesibles
- [ ] Alertas de errores configuradas
- [ ] Métricas de uso habilitadas

### Backup

- [ ] Backup automático de MongoDB configurado
- [ ] Plan de recuperación ante desastres documentado

---

## 🆘 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verificar `MONGO_URL` en variables de entorno
- Verificar que la IP del servidor está en whitelist de MongoDB Atlas
- Verificar que el servicio de MongoDB está corriendo

### Error: "Gemini API error"
- Verificar que `GEMINI_USER_API_KEY` es válida
- Verificar cuota disponible en Google AI Studio
- Revisar logs para ver el error específico

### Frontend no carga
- Verificar que `EXPO_PUBLIC_BACKEND_URL` es correcta
- Verificar configuración de CORS en backend
- Revisar console del navegador para errores

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. Revisar los logs del servicio
2. Verificar todas las variables de entorno
3. Ejecutar el health check: `curl https://tu-api/api/health`
4. Abrir un issue en el repositorio

---

**¡Éxito con tu deployment! 🎋**
