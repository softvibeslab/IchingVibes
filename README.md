# 🎋 I Ching Physics Oracle

> **Oráculo del I Ching con Física Simulada** - Una aplicación móvil PWA que combina la sabiduría ancestral del I Ching con tecnología moderna de sensores e inteligencia artificial.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📱 Características

### Core Features
- **🪙 Lanzamiento de Monedas con Física** - Animaciones realistas con rebote y dispersión
- **📳 Detección de Shake** - Sacude tu dispositivo para lanzar las monedas
- **📲 Haptic Feedback** - Vibración táctil en cada interacción
- **🤖 Interpretación con IA** - Powered by Google Gemini 2.5 Flash
- **🔐 Autenticación** - Sistema de usuarios con JWT
- **📚 Historial** - Guarda y consulta tus lecturas anteriores

### I Ching Features
- **64 Hexagramas** - Dataset completo traducido al español
- **Líneas Móviles** - Cálculo preciso de hexagramas presente y futuro
- **Recursos Externos** - Enlaces a FER y ORA para estudio profundo
- **Metadatos** - Tono, elemento y virtud de cada lectura
- **Plan de Acción** - 3 pasos prácticos con timing

## 🛠️ Tech Stack

### Frontend
- **Expo** (React Native)
- **Expo Router** (File-based routing)
- **Zustand** (State management)
- **expo-sensors** (Acelerómetro/Giroscopio)
- **expo-haptics** (Feedback táctil)

### Backend
- **FastAPI** (Python)
- **MongoDB** (Base de datos)
- **JWT** (Autenticación)
- **Google Gemini API** (IA)

## 🚀 Quick Start

### Prerrequisitos
- Node.js 18+
- Python 3.11+
- MongoDB
- Expo CLI (`npm install -g expo-cli`)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd app

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend
```

### Ejecutar en Desarrollo

```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npx expo start
```

## 📖 Documentación

- [📦 Guía de Deployment](./DEPLOYMENT.md)
- [🔌 Documentación de API](./docs/API.md)
- [⚙️ Variables de Entorno](./docs/ENV_VARIABLES.md)
- [👥 Usuarios Demo](./USUARIOS_DEMO.md)

## 🔑 Credenciales de Demo

| Email | Password |
|-------|----------|
| maria@demo.com | demo123 |
| carlos@demo.com | demo123 |
| ana@demo.com | demo123 |

## 📱 Screenshots

### Pantalla Principal
- Área de monedas con diseño chino clásico
- Botón "Lanzar Monedas" o shake para tirar
- Hexagrama en construcción en tiempo real

### Interpretación IA
- Emoji representativo del hexagrama
- Mensaje principal poético
- Enlaces a recursos externos (ORA/FER)
- Plan de acción con timing
- Metadatos (Tono, Elemento, Virtud)

## 🏗️ Arquitectura

```
/app
├── backend/
│   ├── server.py              # FastAPI main
│   ├── models.py              # Pydantic models
│   ├── iching_data.py         # 64 hexagramas
│   ├── interpretation_service_custom.py  # Gemini AI
│   └── .env
├── frontend/
│   ├── app/                   # Expo Router screens
│   │   ├── (auth)/            # Login/Register
│   │   └── (tabs)/            # Main app tabs
│   ├── components/            # React components
│   ├── utils/                 # Helpers
│   ├── store/                 # Zustand stores
│   └── .env
└── docs/                      # Documentation
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## 🙏 Agradecimientos

- Wilhelm/Baynes por las traducciones clásicas del I Ching
- Google Gemini por la capacidad de IA
- Expo team por el framework móvil

---

**Desarrollado con 🎋 y ☯️**
