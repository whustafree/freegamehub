# 🗺️ GameRadar — Roadmap

> Vision: La mejor plataforma para descubrir juegos gratis de todas las plataformas.

---

## 🏆 Gamificación & Social

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Perfiles de usuario** | Cada usuario con stats, logros y colecciones visibles | Alto | Medio |
| ⭐⭐⭐ | **Leaderboard semanal** | Ranking de quién reclama más juegos, más ahorros acumulados | Alto | Medio |
| ⭐⭐ | **Badges por racha** | "7 días seguidos revisando ofertas", "100 juegos reclamados" | Medio | Bajo |
| ⭐⭐⭐ | **Compartir en redes** | Generar imagen estilizada del juego para compartir en IG/Twitter | Alto | Medio |
| ⭐⭐ | **Sistema de reseñas** | Comentarios cortos tipo "Lo recomiendo" en cada juego | Medio | Medio |

---

## 🔔 Notificaciones & Alertas

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Notificaciones Push (PWA)** | Mejorar soporte existente con suscripción por plataforma (PC / Android) | Alto | Medio |
| ⭐⭐⭐ | **Alertas por precio** | "Avísame cuando un juego de mi wishlist baje a $0" | Alto | Alto |
| ⭐⭐ | **Newsletter semanal** | Email/SMS/Telegram con los mejores juegos gratis de la semana | Medio | Bajo |
| ⭐⭐ | **Webhook personalizado** | URL que recibe un POST cuando hay juegos nuevos (para integraciones) | Medio | Bajo |

---

## 🔍 Búsqueda & Descubrimiento

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Búsqueda por tags** | Tags generados automáticamente (multiplayer, coop, single-player, etc.) | Alto | Medio |
| ⭐⭐⭐ | **Recomendaciones IA** | "Si te gustó X, prueba Y" basado en género y fuente | Alto | Medio |
| ⭐⭐ | **Filtro combinado avanzado** | Guardar combinaciones de filtros como preset ("Solo Android open-source") | Medio | Bajo |
| ⭐⭐ | **Vista calendario** | Calendario visual de ofertas activas y próximas | Medio | Medio |
| ⭐⭐ | **Explorar por fuente** | Pestaña por cada fuente (GamerPower, F-Droid, Reddit, Epic, etc.) | Medio | Bajo |

---

## 📊 Datos & Analytics

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Dashboard de ahorros** | "Has ahorrado $X este mes" con gráficos semanales/mensuales | Alto | Medio |
| ⭐⭐ | **Historial de precios** | Timeline de precios para juegos que han estado gratis antes | Medio | Alto |
| ⭐⭐ | **Mapa de disponibilidad** | Ver qué juegos están gratis en qué tiendas en tiempo real | Medio | Medio |
| ⭐⭐⭐ | **API pública documentada** | Endpoint público documentado para que otros devs usen los datos | Alto | Bajo |

---

## 🎨 UX/UI

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Modo AMOLED mejorado** | Fondo negro puro para ahorrar batería en pantallas AMOLED | Alto | Bajo |
| ⭐⭐ | **Tema personalizable** | Colores, fondo, tipografía ajustable por el usuario | Medio | Medio |
| ⭐⭐ | **Vista rápida (hover)** | Tooltip con info básica al pasar el mouse en desktop | Medio | Bajo |
| ⭐ | **Animaciones reducidas** | Respetar `prefers-reduced-motion` (ya hay soporte básico) | Bajo | Bajo |
| ⭐⭐ | **Atajos de teclado** | Ya existen (`/` buscar, `Esc` cerrar, `g` vista). Agregar más (`1`,`2`,`3` pestañas) | Medio | Bajo |
| ⭐⭐⭐ | **Widget juegos nuevos** | Banner: "🔥 12 juegos nuevos desde tu última visita" | Alto | Bajo |

---

## 📱 PWA & Mobile

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Instalable como app nativa** | Ya hay PWA. Mejorar con splash screen personalizado | Alto | Bajo |
| ⭐⭐⭐ | **Offline completo** | Cachear toda la última respuesta de la API para funcionar sin internet | Alto | Medio |
| ⭐⭐ | **Widget Android** | Widget en pantalla de inicio mostrando el juego destacado del día | Medio | Alto |
| ⭐⭐ | **Deep linking mejorado** | Enlaces tipo `gameradar.app/game/{id}` para compartir juegos | Medio | Bajo |

---

## 🔌 Nuevas Fuentes de Datos

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **SteamDB API** | Juegos gratis en Steam (más confiable que GamerPower) | Alto | Medio |
| ⭐⭐⭐ | **PS Plus Essential** | Juegos gratis mensuales de PlayStation | Alto | Medio |
| ⭐⭐ | **Xbox Games with Gold** | Juegos gratis de Xbox | Medio | Medio |
| ⭐⭐ | **Prime Gaming** | Juegos gratis incluidos con Amazon Prime | Medio | Medio |
| ⭐ | **Itch.io Game Bundles** | Bundles gratuitos de Itch.io | Bajo | Bajo |

---

## 🛠️ Técnicas & DevOps

| Prioridad | Idea | Descripción | Impacto | Esfuerzo |
|:---------:|------|-------------|:-------:|:--------:|
| ⭐⭐⭐ | **Tests E2E Playwright** | Ya hay `playwright.config.js`. Completar tests de integración | Alto | Medio |
| ⭐⭐⭐ | **CI/CD GitHub Actions** | Tests automáticos en cada push, deploy automático a Vercel | Alto | Bajo |
| ⭐⭐ | **Bundle size optimization** | Code splitting, lazy loading para reducir JS bundle | Medio | Medio |
| ⭐⭐ | **CDN para imágenes** | Cachear imágenes en CDN (Cloudinary, imgix) | Medio | Medio |
| ⭐⭐ | **Rate limiting externo** | Cachear respuestas de APIs externas para evitar rate limits | Medio | Bajo |

---

## 🚀 Top 5 Prioridades Recomendadas

| # | Idea | Impacto | Esfuerzo | Por qué |
|:-:|------|:-------:|:--------:|---------|
| 1 | **Dashboard de ahorros** | ⭐⭐⭐ | Medio | Los usuarios AMAN ver cuánto dinero han ahorrado |
| 2 | **Widget de juegos nuevos** | ⭐⭐⭐ | Bajo | Ya tienes el dato (`newGameIds`), solo falta pulir la UI |
| 3 | **API pública documentada** | ⭐⭐⭐ | Bajo | Bajo esfuerzo, alto impacto: otros devs construyen sobre tus datos |
| 4 | **Notificaciones push por plataforma** | ⭐⭐⭐ | Medio | "Avísame solo en Android" aumenta el engagement |
| 5 | **Modo offline completo** | ⭐⭐⭐ | Medio | La PWA ya está cerca, solo falta cachear la última respuesta |

---

> 📅 Última actualización: Junio 2026
> 
> 💡 ¿Ideas nuevas? ¡Abre un issue o PR!
