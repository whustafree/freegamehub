# 🎮 FreeGameHub v2.0

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Express](https://img.shields.io/badge/Express-4.18+-orange.svg)](https://expressjs.com/)

> **Plataforma moderna para descubrir juegos gratuitos** - Ahora con múltiples fuentes, mejor UI y sistema de notificaciones.

![FreeGameHub Preview](https://via.placeholder.com/800x400?text=FreeGameHub+Preview)

## ✨ Características

### 🎮 Fuentes de Juegos
- **GamerPower API** - Juegos gratuitos para PC y Android
- **Epic Games Store** - Juegos semanales gratuitos
- **Reddit r/googleplaydeals** - Apps y juegos Android en oferta

### 🎨 Interfaz Moderna
- **3 Temas visuales**: Default, Cyberpunk, Matrix
- **Diseño responsive**: Optimizado para móvil y desktop
- **Animaciones suaves**: Transiciones y efectos modernos
- **Dark mode**: Siempre activo con variaciones

### 🔔 Notificaciones
- **Telegram Bot**: Alertas automáticas de nuevos juegos
- **Detección de AAA**: Alertas especiales para juegos premium
- **Notificaciones push**: Soporte para navegadores (opcional)

### ⚡ Funcionalidades
- **Búsqueda en tiempo real**: Filtrado instantáneo
- **Favoritos**: Guarda tus juegos preferidos
- **Ocultar juegos**: Personaliza tu feed
- **Estado "visto"**: Marca juegos ya reclamados
- **QR Code**: Comparte fácilmente desde móvil
- **PWA**: Instalable como app

## 🚀 Instalación

### Requisitos
- Node.js 16+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/freegamehub.git
cd freegamehub
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita .env con tus credenciales
```

4. **Iniciar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Telegram (opcional pero recomendado)
TELEGRAM_TOKEN=tu_token_de_bot
TELEGRAM_CHAT_ID=tu_chat_id

# Configuración del servidor
PORT=3000
NODE_ENV=production

# URL de la aplicación
APP_URL=https://tu-dominio.com

# Intervalo de actualización (horas)
UPDATE_INTERVAL_HOURS=4
```

### Configurar Telegram Bot

1. Habla con [@BotFather](https://t.me/botfather) en Telegram
2. Crea un nuevo bot con `/newbot`
3. Copia el token proporcionado
4. Obtén tu chat ID:
   ```bash
   node get_id.js
   ```
5. Escribe "Hola" a tu bot
6. Pega el token cuando se solicite

## 📁 Estructura del Proyecto

```
freegamehub/
├── src/
│   ├── config/          # Configuración
│   ├── middleware/      # Middleware Express
│   ├── routes/          # Rutas API
│   ├── services/        # Servicios (Telegram, APIs)
│   └── utils/           # Utilidades
├── public/              # Frontend estático
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── stats.html
├── server.js            # Entry point
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/free-games` | GET | Obtener todos los juegos |
| `/api/stats` | GET | Estadísticas del servidor |
| `/api/refresh` | POST | Forzar actualización |
| `/api/test-telegram` | POST | Probar notificaciones |
| `/api/health` | GET | Health check |
| `/stats` | GET | Panel de administración |

## 🛠️ Desarrollo

### Scripts disponibles

```bash
npm start      # Iniciar servidor
npm run dev    # Modo desarrollo con nodemon
npm test       # Ejecutar tests
npm run lint   # Linting con ESLint
```

### Añadir nuevas fuentes

1. Crea un servicio en `src/services/`
2. Implementa el método `fetch()`
3. Añade al `GamesService` en `src/services/games.js`

Ejemplo:
```javascript
// src/services/mifuente.js
async fetchGames() {
  // Tu implementación
  return formattedGames;
}
```

## 📱 PWA

La aplicación es una PWA completamente funcional:

- ✅ Service Worker para cacheo
- ✅ Manifest.json para instalación
- ✅ Iconos adaptativos
- ✅ Funciona offline

## 🔒 Seguridad

- Variables de entorno para credenciales
- Rate limiting en API
- Sanitización de inputs
- Headers de seguridad

## 📝 Changelog

### v2.0.0
- ✅ Código completamente refactorizado y modularizado
- ✅ Sistema de variables de entorno
- ✅ Nueva fuente: Epic Games API
- ✅ Mejoras significativas en UI/UX
- ✅ Sistema de notificaciones push
- ✅ Panel de administración mejorado
- ✅ Rate limiting
- ✅ Logging mejorado
- ✅ Múltiples temas visuales

### v1.0.0
- 🎉 Lanzamiento inicial

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [GamerPower API](https://www.gamerpower.com/) por los datos de juegos
- [Epic Games](https://store.epicgames.com/) por su API
- Comunidad de Reddit r/googleplaydeals

---

<p align="center">
  Hecho con ❤️ para la comunidad gamer
</p>
