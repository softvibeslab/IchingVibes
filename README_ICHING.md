# 🎋 I Ching Physics Oracle - Oráculo del I Ching

Una aplicación móvil moderna que simula el antiguo oráculo chino del I Ching con física realista y sensores del dispositivo.

## ✨ Características Principales

### 🎲 Simulación Física Realista
- **3 Monedas Chinas Animadas**: Simulación visual de monedas con animaciones fluidas
- **Sensores del Dispositivo**: Usa el acelerómetro y giroscopio para:
  - Detectar sacudidas del dispositivo para lanzar monedas
  - Generar entropía "verdadera" usando ruido del sensor
  - Feedback háptico en cada interacción
- **Animaciones 60fps**: Usando React Native Reanimated

### 📖 I Ching Completo
- **64 Hexagramas**: Dataset completo en español con:
  - Títulos tradicionales
  - Nombres en caracteres chinos
  - Juicios (interpretaciones)
  - Imágenes (simbolismos)
- **Líneas Móviles**: Detección automática de líneas Yin/Yang móviles
- **Hexagrama Presente y Futuro**: Cálculo automático de transformaciones

### 👤 Gestión de Usuarios
- **Autenticación JWT**: Sistema seguro de login/registro
- **Historial Personal**: Guarda todas tus consultas
- **Perfil de Usuario**: Información y configuración

### 🎨 UI/UX Premium
- **Diseño Místico**: Paleta de colores oscura con dorado
- **Mobile-First**: Optimizado para dispositivos móviles
- **Navegación Intuitiva**: Tabs para acceso rápido
- **Animaciones Fluidas**: Transiciones suaves entre pantallas

## 🛠️ Stack Tecnológico

### Frontend (React Native + Expo)
- **Expo 54**: Framework principal
- **React Navigation**: Navegación con tabs
- **Zustand**: State management
- **Expo Sensors**: Acelerómetro y giroscopio
- **Expo Haptics**: Feedback táctil
- **React Native Reanimated**: Animaciones de alta performance

### Backend (Python + FastAPI)
- **FastAPI**: API REST moderna y rápida
- **MongoDB**: Base de datos NoSQL
- **JWT Authentication**: Tokens seguros
- **Pydantic**: Validación de datos
- **Motor**: Driver async de MongoDB

## 📱 Pantallas

1. **Login/Register**: Autenticación con diseño místico
2. **Oráculo**: Pantalla principal para lanzar monedas
3. **Historial**: Lista de consultas anteriores
4. **Interpretación**: Vista detallada de hexagramas
5. **Perfil**: Información del usuario y guía de uso

## 🎮 Cómo Usar

1. **Registro**: Crea una cuenta con email y contraseña
2. **Formula tu Pregunta**: (Opcional) Escribe tu consulta
3. **Lanza las Monedas**: 
   - Sacude tu dispositivo, o
   - Presiona el botón "Lanzar Monedas"
4. **6 Tiradas**: Repite el proceso 6 veces
5. **Interpretación**: Lee tu hexagrama presente y futuro
6. **Guarda**: Las consultas se guardan automáticamente

## 🧮 Lógica del I Ching

### Valores de Monedas
- **Cara (Yang)**: Valor 3
- **Cruz (Yin)**: Valor 2

### Tipos de Líneas
- **Suma 6** (2+2+2): Yin Móvil → Línea partida que cambia
- **Suma 7** (2+2+3): Yang Fija → Línea continua fija
- **Suma 8** (2+3+3): Yin Fija → Línea partida fija  
- **Suma 9** (3+3+3): Yang Móvil → Línea continua que cambia

### Construcción del Hexagrama
- Se construye de **abajo hacia arriba**
- 6 líneas forman un hexagrama (de los 64 posibles)
- Las líneas móviles indican transformación
- Si hay líneas móviles, se genera un **hexagrama futuro**

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

### Hexagramas
- `GET /api/hexagrams/{number}` - Obtener hexagrama (1-64)

### Lecturas
- `POST /api/readings` - Guardar lectura
- `GET /api/readings` - Historial de lecturas
- `GET /api/readings/{id}` - Lectura específica

## 🚀 Desarrollo

### Requisitos
- Node.js 18+
- Python 3.11+
- MongoDB

### Instalación

```bash
# Frontend
cd frontend
yarn install

# Backend
cd backend
pip install -r requirements.txt
```

### Variables de Entorno

**Backend (.env)**:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=iching_db
SECRET_KEY=tu-clave-secreta-jwt
```

**Frontend (.env)**:
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

### Ejecutar

```bash
# Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend
cd frontend
yarn start
```

## 📚 Dataset del I Ching

Los 64 hexagramas están completamente traducidos al español, incluyendo:
- Nombres clásicos (ej: "Lo Creativo", "Lo Receptivo")
- Caracteres chinos originales
- Juicios tradicionales de Richard Wilhelm
- Imágenes simbólicas

## 🎯 Características Únicas

1. **Entropía Real**: Usa fluctuaciones del acelerómetro como fuente de aleatoriedad
2. **Feedback Sensorial**: Vibraciones y sonidos en cada interacción
3. **Todo en Español**: Interfaz y contenido completamente localizado
4. **Diseño Minimalista**: Enfoque en la experiencia mística

## 📝 Notas Técnicas

- Las monedas se animan con `Animated API` de React Native
- Los sensores se manejan con `expo-sensors`
- El estado de autenticación persiste con `SecureStore`
- Las animaciones usan `useNativeDriver` para 60fps
- El backend usa async/await para todas las operaciones de DB

## 🔮 Filosofía del I Ching

El I Ching es un sistema de sabiduría de más de 3000 años. No predice el futuro de forma literal, sino que ofrece perspectivas sobre:
- La situación actual (Hexagrama Presente)
- Las fuerzas en juego (Líneas Móviles)
- El desarrollo potencial (Hexagrama Futuro)

La interpretación requiere reflexión personal y aplicación a tu contexto único.

---

**Construido con ❤️ usando tecnologías modernas y sabiduría ancestral**
