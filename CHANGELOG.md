# Changelog - GameRadar

## v2.0.0 (2026-01-30)

### 🎉 Nuevas Características

#### Backend
- **Arquitectura modular**: Código reorganizado en módulos separados
- **Variables de entorno**: Credenciales y configuración movidas a `.env`
- **Nueva fuente**: Integración con Epic Games API
- **Rate limiting**: Protección contra abuso de API
- **Logging mejorado**: Sistema de logs con timestamps y colores
- **Manejo de errores**: Middleware centralizado de errores
- **Health checks**: Endpoint para monitoreo

#### Frontend
- **UI completamente rediseñada**: Diseño más moderno y pulido
- **3 Temas visuales**: Default (azul), Cyberpunk (morado), Matrix (verde)
- **Animaciones**: Transiciones suaves y efectos hover
- **Fondo animado**: Orbs degradados flotantes
- **Skeleton loading**: Estados de carga visuales
- **Toast notifications**: Notificaciones no intrusivas
- **Mejor UX**: Atajos de teclado, feedback visual

#### Funcionalidades
- **Sistema de favoritos mejorado**: Persistencia mejorada
- **Juegos ocultos**: Posibilidad de ocultar y recuperar juegos
- **Estado "visto"**: Marcar juegos ya reclamados
- **Búsqueda mejorada**: Con debounce y limpiar búsqueda
- **Ordenamiento**: Múltiples opciones (precio, fecha, título)
- **Detección de cupones**: Extrae códigos de las descripciones
- **Notificaciones push**: Soporte para notificaciones del navegador

#### PWA
- **Service Worker v2**: Estrategias de cacheo optimizadas
- **Manifest mejorado**: Más metadatos para instalación
- **Offline support**: Funciona sin conexión
- **Background sync**: Sincronización en segundo plano

#### Panel de Admin
- **Diseño renovado**: Tarjetas de estadísticas visuales
- **Más métricas**: Uso de memoria, tiempo de actividad formateado
- **Acciones**: Actualizar manual, probar Telegram, health check

### 🔒 Seguridad
- Credenciales en variables de entorno
- Rate limiting en endpoints
- Sanitización de inputs
- Validación de datos

### 📁 Estructura de Carpetas
```
src/
├── config/          # Configuración centralizada
├── middleware/      # Middleware Express
├── routes/          # Rutas API
├── services/        # Servicios externos
└── utils/           # Utilidades
```

### 🛠️ Scripts
- `npm start` - Iniciar servidor
- `npm run dev` - Modo desarrollo con nodemon
- `npm test` - Ejecutar tests
- `npm run lint` - Linting

### 📦 Dependencias Nuevas
- `dotenv` - Variables de entorno

---

## v1.0.0 (2026-01-19)

### Características Iniciales
- Integración con GamerPower API
- Integración con Reddit r/googleplaydeals
- Notificaciones Telegram
- Sistema de caché
- Filtros básicos (género, plataforma)
- Favoritos con localStorage
- Temas básicos
- PWA básica
