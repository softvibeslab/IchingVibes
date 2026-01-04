# ⚙️ Variables de Entorno

Documentación completa de todas las variables de entorno necesarias para el proyecto.

## 📁 Backend (`/backend/.env`)

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|----------|
| `MONGO_URL` | URL de conexión a MongoDB | `mongodb://localhost:27017` o `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | Nombre de la base de datos | `iching_production` |
| `GEMINI_USER_API_KEY` | API Key de Google Gemini | `AIzaSy...` |

### Variables Opcionales

| Variable | Descripción | Default |
|----------|-------------|----------|
| `SECRET_KEY` | Clave para firmar JWT | Auto-generada (insegura) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos | `10080` (7 días) |
| `PORT` | Puerto del servidor | `8001` |

### Ejemplo Completo

```env
# Base de datos
MONGO_URL=mongodb+srv://iching_user:MiPassword123@cluster0.abc123.mongodb.net
DB_NAME=iching_production

# AI
GEMINI_USER_API_KEY=AIzaSyCGTYYSnmqb6A3g9_FVkwEdIfLCSjSDpVk

# Seguridad
SECRET_KEY=mi-clave-super-secreta-de-produccion-cambiar-esto

# Server
PORT=8001
```

---

## 📱 Frontend (`/frontend/.env`)

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|----------|
| `EXPO_PUBLIC_BACKEND_URL` | URL base del backend API | `https://api.mi-dominio.com` |

### Variables de Desarrollo (No modificar)

| Variable | Descripción |
|----------|-------------|
| `EXPO_TUNNEL_SUBDOMAIN` | Subdominio para Expo tunnel |
| `EXPO_PACKAGER_HOSTNAME` | Hostname del packager |
| `EXPO_USE_FAST_RESOLVER` | Optimización de Metro |
| `METRO_CACHE_ROOT` | Directorio de caché |

### Ejemplo Completo

```env
# API Backend
EXPO_PUBLIC_BACKEND_URL=https://api.iching-oracle.com

# Desarrollo (automático)
EXPO_TUNNEL_SUBDOMAIN=my-app
EXPO_PACKAGER_HOSTNAME=https://my-app.preview.domain.com
EXPO_USE_FAST_RESOLVER="1"
METRO_CACHE_ROOT=/app/frontend/.metro-cache
```

---

## 🔐 Obtener API Keys

### Google Gemini API Key

1. Ir a [Google AI Studio](https://aistudio.google.com/)
2. Click en "Get API Key"
3. Crear nueva API Key o usar existente
4. Copiar y guardar de forma segura

### MongoDB Atlas Connection String

1. Ir a [MongoDB Atlas](https://cloud.mongodb.com)
2. Seleccionar tu cluster
3. Click en "Connect" → "Connect your application"
4. Copiar connection string
5. Reemplazar `<password>` con tu contraseña

---

## 🛡️ Mejores Prácticas de Seguridad

1. **Nunca commitear archivos `.env`** - Añadir a `.gitignore`
2. **Usar secrets managers** en producción (AWS Secrets Manager, HashiCorp Vault)
3. **Rotar API keys** periódicamente
4. **Generar `SECRET_KEY` segura**:
   ```bash
   openssl rand -hex 32
   # o
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
5. **Diferentes keys por ambiente** - Dev, staging, producción
6. **Restringir IPs** en MongoDB Atlas para producción

---

## 📝 Archivos de Ejemplo

Crear archivos `.env.example` para documentar las variables:

### `/backend/.env.example`
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=iching_development

# AI Service
GEMINI_USER_API_KEY=your_api_key_here

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=change_this_to_a_secure_random_string
```

### `/frontend/.env.example`
```env
# Backend API URL
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```
