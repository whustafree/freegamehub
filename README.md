# 🎮 GameRadar v2.1

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Plataforma PWA para descubrir juegos** — React + TypeScript + Vite frontend, Express backend, multiplataforma con Capacitor.

![GameRadar Preview](https://via.placeholder.com/800x400?text=GameRadar+Preview)

## ✨ Características

### 🎮 Fuentes de Juegos
- **GamerPower API** — Juegos gratuitos para PC, consolas, Android y iOS
- **Epic Games Store** — Juegos semanales gratuitos
- **Reddit r/googleplaydeals** — Apps y juegos Android en oferta
- **FreeToGame API** — Juegos free-to-play para PC

### 🎨 Interfaz Moderna (App Store Style)
- **Diseño dark glass**: Estilo iOS con glassmorphism y animaciones fluidas
- **Figma-level UX**: Pull-to-refresh, skeleton loading, scroll infinito
- **Swipe gestures**: Desliza izquierda (ocultar) o derecha (favorito)
- **3 modos de visualización**: Grid, lista y horizontal carousel
- **Responsive**: Optimizado para móvil, tablet y desktop
- **Haptic feedback**: Vibración háptica en dispositivos compatibles

### 🔔 Notificaciones
- **Telegram Bot**: Alertas automáticas de nuevos juegos con detección AAA
- **Notificaciones push**: Service Worker con soporte PWA
- **Badge de nuevos juegos**: Indicador visual de novedades

### 🎮 Gamificación
- **15 logros**: Desde "Primer reclamo" hasta "Magnate" ($1000 ahorrados)
- **Sistema de votos**: Útil / No útil con ranking de popularidad
- **Reacciones**: 🔥 ❤️ ⭐ 😂 😎 😢 por juego
- **Colecciones**: Crea y organiza tus juegos favoritos
- **Historial de actividad**: Registro completo de interacciones
- **Confetti**: Animaciones al desbloquear logros 🎉

### ⚡ Funcionalidades
- **Búsqueda en tiempo real** con sugerencias
- **Favoritos y ocultos**: Personaliza tu feed
- **Multiselección**: Acciones en lote (favorito/ocultar)
- **Sorpréndeme 🎲**: Juego aleatorio recomendado
- **Juego del día**: Destacado rotativo
- **Tendencias**: Juegos más votados
- **Contador regresivo**: Ofertas por terminar
- **i18n**: Español e Inglés completos
- **PWA**: Instalable como app con soporte offline
- **Android APK**: Compilado nativo con Capacitor

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Backend** | Node.js, Express 4.18 |
| **Mobile** | Capacitor 8 (Android) |
| **Testing** | Vitest, @testing-library/react |
| **PWA** | Service Worker, Manifest.json |
| **Despliegue** | Vercel (serverless) + Render |
| **Seguridad** | Helmet, rate limiting |

## 🚀 Instalación

### Requisitos
- Node.js 18+
- npm o pnpm

### Pasos

```bash
# Clonar
git clone https://github.com/whustafree/gameradar.git
cd gameradar

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Edita .env con tus credenciales

# Iniciar desarrollo
npm run dev    # Frontend (Vite) en :5173
npm start      # Backend (Express) en :3000
```

## 📁 Estructura del Proyecto

```
gameradar/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # 14 componentes (GameCard, GameDetail, etc.)
│   ├── hooks/              # Custom hooks (useGames, useFilters)
│   ├── i18n/               # Traducciones ES/EN (~200 keys c/u)
│   ├── utils/              # Utilidades (format, storage)
│   └── types.ts            # Tipos compartidos
├── src-backend/            # Backend Express
│   ├── config/             # Configuración centralizada
│   ├── middleware/         # Rate limiter, error handler
│   ├── routes/             # Rutas API
│   ├── services/           # Servicios externos (Epic, GamerPower, etc.)
│   └── utils/              # Caché, logger, stats
├── api/                    # Entry point serverless (Vercel)
│   └── index.js
├── public/                 # Archivos estáticos (SW, manifest)
├── android/                # Proyecto Android (Capacitor)
├── server.js               # Entry point tradicional
├── package.json
├── vite.config.ts
└── capacitor.config.ts
```

## 🔌 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/free-games` | GET | Obtener todos los juegos gratuitos |
| `/api/stats` | GET | Estadísticas del servidor |
| `/api/refresh` | POST | Forzar actualización manual |
| `/api/test-telegram` | POST | Probar notificación Telegram |
| `/api/health` | GET | Health check |
| `/stats` | GET | Panel de administración Web |

## 🧪 Testing

```bash
npm test        # Ejecutar tests (Vitest)
npm run test:watch  # Modo watch
```

Actualmente **33 tests** cubren utilidades de formato y almacenamiento.

## 🛠️ Desarrollo

### Comandos principales

```bash
npm run dev      # Frontend (Vite dev server)
npm start        # Backend (Express)
npm run build    # Build frontend producción
npm test         # Tests
npx tsc --noEmit # TypeScript check
```

### Añadir nueva fuente de juegos

1. Crea un servicio en `src-backend/services/`
2. Implementa el método `fetch()` que retorne juegos formateados
3. Agrégarlo al `Promise.allSettled` en `src-backend/services/games.js`

## 📱 Android APK (Capacitor)

```bash
# Build frontend
npm run build

# Sincronizar con Capacitor
npx cap sync android

# Abrir en Android Studio
npx cap open android

# Generar APK desde Android Studio
```

## 🔒 Seguridad

- Helmet para cabeceras HTTP seguras
- Rate limiting (60 req/min por IP)
- Compresión gzip
- Variables de entorno para credenciales
- Sanitización de salida HTML (Telegram)

## 📝 Changelog

### v2.1.0 (Actual)
- ✅ Nuevo diseño App Store style con glassmorphism
- ✅ Componente TrendingSection extraído y optimizado
- ✅ Scroll horizontal con ancho fijo para tarjetas
- ✅ Mejoras en list-view con nombres de plataforma
- ✅ Refactor: `parsePrice` unificado, dead code eliminado
- ✅ Backend: compression + helmet + rate limiter mejorado
- ✅ Backend: logger con stack traces en desarrollo
- ✅ Todos los errores TS corregidos
- ✅ Traducciones completas (similarGames, addWishlist)

### v2.0.0
- ✅ Arquitectura modular frontend/backend
- ✅ Sistema de variables de entorno
- ✅ Fuente: Epic Games API
- ✅ UI/UX rediseñada
- ✅ PWA y Capacitor Android
- ✅ Rate limiting
- ✅ Sistema de notificaciones push

### v1.0.0
- 🎉 Lanzamiento inicial

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/mejora`)
3. Commit (`git commit -am 'Añadir mejora'`)
4. Push (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT — Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [GamerPower API](https://www.gamerpower.com/)
- [Epic Games Store](https://store.epicgames.com/)
- [FreeToGame API](https://www.freetogame.com/)
- Comunidad r/googleplaydeals

---

<p align="center">
  Hecho con ❤️ para la comunidad gamer
</p>
