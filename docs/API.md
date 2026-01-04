# 🔌 Documentación de API - I Ching Oracle

**Base URL:** `https://tu-dominio.com/api`

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Endpoints de Auth](#endpoints-de-auth)
3. [Endpoints de Readings](#endpoints-de-readings)
4. [Health Check](#health-check)
5. [Códigos de Error](#códigos-de-error)

---

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Header de Autorización

```http
Authorization: Bearer <token>
```

### Obtener Token

El token se obtiene al hacer login o registro. Expira en **7 días**.

---

## 👤 Endpoints de Auth

### POST /api/auth/register

Registrar nuevo usuario.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores:**
- `400` - Email ya registrado
- `422` - Datos inválidos

---

### POST /api/auth/login

Iniciar sesión.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores:**
- `401` - Credenciales incorrectas

---

### GET /api/auth/me

Obtener información del usuario actual.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "usuario@email.com",
  "name": "Nombre Usuario"
}
```

---

## 📖 Endpoints de Readings

### POST /api/readings

Crear nueva lectura del I Ching.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "question": "¿Qué me depara el futuro?",
  "throws": [
    {"coins": [3, 2, 3], "sum": 8, "line_type": "yin_fija", "line_value": 0},
    {"coins": [3, 3, 3], "sum": 9, "line_type": "yang_movil", "line_value": 1},
    {"coins": [2, 2, 3], "sum": 7, "line_type": "yang_fija", "line_value": 1},
    {"coins": [2, 2, 2], "sum": 6, "line_type": "yin_movil", "line_value": 0},
    {"coins": [3, 3, 2], "sum": 8, "line_type": "yin_fija", "line_value": 0},
    {"coins": [3, 2, 2], "sum": 7, "line_type": "yang_fija", "line_value": 1}
  ]
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "user_id": "507f1f77bcf86cd799439010",
  "question": "¿Qué me depara el futuro?",
  "present_hexagram": {
    "number": 15,
    "title": "La Modestia",
    "chinese": "謙 Qiān",
    "judgment": "La Modestia crea éxito...",
    "image": "Dentro de la tierra hay una montaña...",
    "lines": [0, 1, 1, 0, 0, 1]
  },
  "future_hexagram": {
    "number": 52,
    "title": "El Aquietamiento",
    "chinese": "艮 Gèn",
    "judgment": "El Aquietamiento de su espalda...",
    "image": "Montañas una junto a otra...",
    "lines": [0, 0, 1, 0, 0, 1]
  },
  "has_changing_lines": true,
  "changing_lines": [2, 4],
  "created_at": "2026-01-04T13:00:00Z"
}
```

---

### GET /api/readings

Obtener historial de lecturas del usuario.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "question": "¿Qué me depara el futuro?",
    "present_hexagram": { ... },
    "future_hexagram": { ... },
    "has_changing_lines": true,
    "created_at": "2026-01-04T13:00:00Z"
  },
  ...
]
```

---

### GET /api/readings/{reading_id}

Obtener una lectura específica.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "question": "¿Qué me depara el futuro?",
  "throws": [ ... ],
  "present_hexagram": { ... },
  "future_hexagram": { ... },
  "has_changing_lines": true,
  "changing_lines": [2, 4],
  "interpretation_cache": null,
  "created_at": "2026-01-04T13:00:00Z"
}
```

**Errores:**
- `404` - Lectura no encontrada

---

### POST /api/readings/{reading_id}/interpret

Generar interpretación con IA para una lectura.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "interpretation": {
    "presente": {
      "numero": 15,
      "nombre": "La Modestia",
      "icono": "⛰️",
      "mensaje_principal": "Este momento requiere humildad...",
      "recursos_externos": {
        "fer": "https://www.yijingorienta.com.br/h15_Jorge.html",
        "ora": "https://www.yijingorienta.com.br/es/h15_Elisabete.html"
      }
    },
    "transformacion": {
      "lineas_mutantes": [1, 3],
      "consejo_mutacion": "Las líneas que cambian indican..."
    },
    "futuro": {
      "numero": 52,
      "nombre": "El Aquietamiento",
      "icono": "🏔️",
      "mensaje": "El destino lleva hacia la calma...",
      "recursos_externos": {
        "fer": "https://www.yijingorienta.com.br/h52_Jorge.html",
        "ora": "https://www.yijingorienta.com.br/es/h52_Elisabete.html"
      }
    },
    "plan_accion": [
      {
        "paso": 1,
        "titulo": "Cultivar la Humildad",
        "detalle": "En cada interacción, prioriza escuchar...",
        "timing": "Inmediato y continuo"
      },
      {
        "paso": 2,
        "titulo": "Simplificar",
        "detalle": "Revisar procesos y eliminar excesos...",
        "timing": "En los próximos meses"
      },
      {
        "paso": 3,
        "titulo": "Buscar la Quietud",
        "detalle": "Establecer momentos de reflexión...",
        "timing": "Gradual y continuo"
      }
    ],
    "metadatos": {
      "tono_general": "transformador",
      "elemento_clave": "tierra",
      "virtud_recomendada": "modestia"
    }
  },
  "model": "gemini-2.5-flash (Custom Gem)"
}
```

---

## 🏥 Health Check

### GET /api/health

Verificar estado del servicio.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "I Ching Oracle API",
  "database": "healthy",
  "version": "1.0.0"
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error |

### Formato de Error

```json
{
  "detail": "Mensaje descriptivo del error"
}
```

---

## 📝 Notas

- Todos los timestamps están en formato **ISO 8601 UTC**
- Los IDs son **MongoDB ObjectIds** representados como strings
- Las lecturas están ordenadas por fecha de creación (más recientes primero)
- La interpretación IA se cachea después de la primera generación
