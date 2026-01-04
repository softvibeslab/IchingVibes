# 👥 USUARIOS DEMO - I Ching Oracle

## 🔐 Credenciales de Acceso

Todos los usuarios usan la contraseña: **`demo123`**

### Usuario 1: María García 👩
```
Email: maria@demo.com
Password: demo123
Consultas: 2
```
**Consultas guardadas:**
- "¿Cuál es mi propósito en la vida?" 
  - Hexagrama 1 (Lo Creativo) → 2 (Lo Receptivo)
  - Todas las líneas móviles
  
- "¿Encontraré armonía en mi familia?"
  - Hexagrama 11 (La Paz)
  - Sin líneas móviles

---

### Usuario 2: Carlos Rodríguez 👨
```
Email: carlos@demo.com
Password: demo123
Consultas: 2
```
**Consultas guardadas:**
- "¿Debo cambiar de trabajo este año?"
  - Hexagrama 35 (El Progreso) → 36 (El Oscurecimiento)
  
- "¿Esta relación es duradera?"
  - Hexagrama 32 (La Duración)

---

### Usuario 3: Ana López 👩‍🦰
```
Email: ana@demo.com
Password: demo123
Consultas: 3
```
**Consultas guardadas:**
- "¿Qué debo hacer para mejorar mi salud?"
  - Hexagrama 48 (El Pozo)
  
- "¿Estoy siendo demasiado orgullosa?"
  - Hexagrama 15 (La Modestia)
  
- "¿Es buen momento para iniciar mi negocio?"
  - Hexagrama 16 (El Entusiasmo) → 2 (Lo Receptivo)

---

### Usuario 4: Diego Martínez 👨‍💼
```
Email: diego@demo.com
Password: demo123
Consultas: 2
```
**Consultas guardadas:**
- "¿Puedo confiar en mi nuevo socio?"
  - Hexagrama 61 (La Verdad Interior)
  
- Sin pregunta específica
  - Hexagrama 23 (La Desintegración) → 43 (La Resolución)

---

## 🧪 Verificación de Credenciales

Para verificar que las credenciales funcionan, ejecuta:

```bash
curl -X POST https://oraculo-fisica.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"demo123"}'
```

**Respuesta esperada:** JSON con `access_token` y `token_type`

---

## 🐛 Troubleshooting

### Si el login no funciona:

1. **Verifica que estés escribiendo correctamente:**
   - Email: `maria@demo.com` (todo en minúsculas)
   - Password: `demo123` (sin espacios)

2. **Verifica la conexión:**
   - Backend URL: `https://oraculo-fisica.preview.emergentagent.com/api`
   - Status: Debe retornar 200 OK

3. **Prueba desde terminal:**
   ```bash
   # Test backend
   curl https://oraculo-fisica.preview.emergentagent.com/api/
   
   # Test login
   curl -X POST https://oraculo-fisica.preview.emergentagent.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"maria@demo.com","password":"demo123"}'
   ```

4. **Mensajes de error comunes:**
   - "Email o contraseña incorrectos" → Verifica las credenciales
   - "Error de red" → Verifica la conexión a internet
   - "No se pudo validar las credenciales" → El token expiró, vuelve a hacer login

---

## 📊 Usuarios y Consultas

| Usuario | Email | Consultas | Con Líneas Móviles |
|---------|-------|-----------|-------------------|
| María | maria@demo.com | 2 | 1 |
| Carlos | carlos@demo.com | 2 | 1 |
| Ana | ana@demo.com | 3 | 1 |
| Diego | diego@demo.com | 2 | 1 |
| **TOTAL** | - | **9** | **4** |

---

## 🎯 Casos de Uso para Testing

**Usar María para:**
- Probar hexagrama con TODAS las líneas móviles (caso raro)
- Ver transformación completa Creativo → Receptivo

**Usar Carlos para:**
- Probar consultas sobre trabajo y relaciones
- Ver hexagrama sin líneas móviles (La Duración)

**Usar Ana para:**
- Usuario con más consultas (mejor para probar historial)
- Variedad de temas (salud, modestia, negocios)

**Usar Diego para:**
- Probar consulta SIN pregunta (meditación general)
- Hexagrama de transformación profunda

---

## 🔄 Recrear Usuarios

Si necesitas recrear los usuarios desde cero:

```bash
bash /tmp/create_demo_users.sh
```

O manualmente:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@demo.com","password":"demo123","name":"María García"}'
```
