/**
 * FreeGameHub v2.0 - Frontend JavaScript
 * Mejorado con notificaciones, mejor UX y más funcionalidades
 */

// Estado global
const state = {
  allGames: [],
  filteredGames: [],
  hiddenGames: [],
  favorites: [],
  viewedGames: [],
  currentMode: 'pc',
  showFavoritesOnly: false,
  showHiddenOnly: false,
  currentTheme: 'default',
  isLoading: true
};

// Constantes
const STORAGE_KEYS = {
  HIDDEN: 'fgh_hiddenGames_v2',
  FAVORITES: 'fgh_favorites_v2',
  VIEWED: 'fgh_viewedGames_v2',
  THEME: 'fgh_theme'
};

const GENRE_KEYWORDS = {
  action: ['action', 'acción', 'combat', 'fight', 'shooter', 'fps', 'battle', 'war'],
  rpg: ['rpg', 'role', 'adventure', 'aventura', 'fantasy', 'medieval'],
  indie: ['indie', 'pixel', 'retro', '2d'],
  strategy: ['strategy', 'estrategia', 'tower defense', 'rts', 'tactical'],
  puzzle: ['puzzle', 'logic', 'logico', 'brain'],
  racing: ['racing', 'carrera', 'drive', 'car', 'motorsport'],
  sports: ['sports', 'deporte', 'fifa', 'football', 'basketball', 'soccer'],
  shooter: ['shooter', 'fps', 'call of duty', 'battlefield', 'valorant']
};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadStoredData();
  setupTheme();
  setupEventListeners();
  loadGames();
  
  // Verificar permiso de notificaciones
  if ('Notification' in window) {
    updateNotificationIcon();
  }
}

function loadStoredData() {
  try {
    state.hiddenGames = JSON.parse(localStorage.getItem(STORAGE_KEYS.HIDDEN)) || [];
    state.favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    state.viewedGames = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIEWED)) || [];
    state.currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'default';
  } catch (e) {
    console.error('Error loading stored data:', e);
  }
}

function setupTheme() {
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  updateThemeIcon();
}

function setupEventListeners() {
  // Búsqueda con debounce
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const clearBtn = document.querySelector('.clear-search');
    clearBtn.classList.toggle('hidden', !e.target.value);
    searchTimeout = setTimeout(applyFilters, 300);
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', applyFilters);

  // Chips de género
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.sub-filters');
      container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Filter buttons (plataforma)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

// ========================================
// CARGA DE DATOS
// ========================================

async function loadGames() {
  showLoading(true);
  
  try {
    const response = await fetch('/api/free-games');
    if (!response.ok) throw new Error('Error en la API');
    
    const data = await response.json();
    state.allGames = data.games || [];
    
    updateLastUpdate(data.lastUpdated);
    updateCounts();
    applyFilters();
    
    showToast('Juegos cargados correctamente', 'success');
  } catch (err) {
    console.error('Error loading games:', err);
    showError('Error cargando los juegos. Intenta recargar la página.');
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  state.isLoading = show;
  document.getElementById('loading-state').classList.toggle('hidden', !show);
  document.getElementById('games-container').classList.toggle('hidden', show);
}

function showError(message) {
  const container = document.getElementById('games-container');
  container.innerHTML = `
    <div class="empty-state" style="grid-column: 1/-1;">
      <div class="empty-icon">😕</div>
      <h3>Algo salió mal</h3>
      <p>${message}</p>
      <button class="btn-primary" onclick="loadGames()">🔄 Reintentar</button>
    </div>
  `;
  container.classList.remove('hidden');
}

function updateLastUpdate(timestamp) {
  if (!timestamp) return;
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutos
  
  let text;
  if (diff < 1) text = 'Hace un momento';
  else if (diff < 60) text = `Hace ${diff} min`;
  else if (diff < 1440) text = `Hace ${Math.floor(diff / 60)} h`;
  else text = date.toLocaleDateString('es-CL');
  
  document.getElementById('last-update').textContent = text;
}

function updateCounts() {
  // Contar juegos visibles
  const visibleGames = state.allGames.filter(g => !state.hiddenGames.includes(g.id));
  document.getElementById('games-count').textContent = visibleGames.length;
  
  // Favoritos
  document.getElementById('fav-count').textContent = state.favorites.length;
  
  // Ocultos
  const hiddenCount = document.getElementById('hidden-count');
  if (hiddenCount) hiddenCount.textContent = state.hiddenGames.length;
  
  // Calcular ahorro total
  const savings = visibleGames.reduce((total, game) => total + parsePrice(game.worth), 0);
  document.getElementById('total-savings').textContent = formatCurrency(savings);
}

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
  const sortMode = document.getElementById('sort-select').value;
  const activeGenre = document.querySelector('.chip.active')?.dataset.genre || 'all';
  const activeStore = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  
  // Obtener tipo activo según el modo
  let activeType = 'all';
  const subFilterContainer = state.currentMode === 'pc' ? '#sub-filters-pc' : '#sub-filters-android';
  const activeTypeBtn = document.querySelector(`${subFilterContainer} .type-btn.active`);
  if (activeTypeBtn) activeType = activeTypeBtn.dataset.type;

  // Filtrar
  let filtered = state.allGames.filter(game => {
    // Favoritos
    if (state.showFavoritesOnly) return state.favorites.includes(game.id);
    
    // Ocultos
    if (state.showHiddenOnly) return state.hiddenGames.includes(game.id);
    if (state.hiddenGames.includes(game.id)) return false;
    
    // Modo (PC/Android)
    if (game.category !== state.currentMode) return false;
    
    // Plataforma (solo PC)
    if (state.currentMode === 'pc' && activeStore !== 'all') {
      if (!game.platform?.includes(activeStore)) return false;
    }
    
    // Tipo
    if (activeType !== 'all') {
      const type = game.type?.toLowerCase() || '';
      if (activeType === 'game' && !type.includes('game')) return false;
      if (activeType === 'dlc' && !type.includes('dlc')) return false;
      if (activeType === 'app' && !type.includes('app')) return false;
    }
    
    // Género
    if (activeGenre !== 'all') {
      const keywords = GENRE_KEYWORDS[activeGenre] || [];
      const text = `${game.title} ${game.description}`.toLowerCase();
      if (!keywords.some(k => text.includes(k))) return false;
    }
    
    // Búsqueda
    if (searchTerm) {
      const text = `${game.title} ${game.description} ${game.platformName}`.toLowerCase();
      if (!text.includes(searchTerm)) return false;
    }
    
    return true;
  });

  // Ordenar
  filtered = sortGames(filtered, sortMode);
  
  state.filteredGames = filtered;
  renderGames(filtered);
}

function sortGames(games, mode) {
  const sorted = [...games];
  
  switch (mode) {
    case 'price-desc':
      sorted.sort((a, b) => parsePrice(b.worth) - parsePrice(a.worth));
      break;
    case 'ending-soon':
      sorted.sort((a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      });
      break;
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default: // default - más recientes primero
      sorted.sort((a, b) => {
        // Priorizar juegos con fecha de fin cercana
        if (a.endDate && !b.endDate) return -1;
        if (!a.endDate && b.endDate) return 1;
        return 0;
      });
  }
  
  return sorted;
}

function renderGames(games) {
  const container = document.getElementById('games-container');
  const emptyState = document.getElementById('empty-state');
  
  if (games.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  container.innerHTML = games.map((game, index) => createGameCard(game, index)).join('');
}

function createGameCard(game, index) {
  const isFav = state.favorites.includes(game.id);
  const isViewed = state.viewedGames.includes(game.id);
  
  // Calcular tiempo restante
  const timeInfo = getTimeInfo(game.endDate, game.type);
  
  // Precio
  const worth = game.worth && game.worth !== 'N/A' 
    ? `<span class="platform-badge worth-badge">${game.worth}</span>` 
    : '';
  
  // Trailer link
  const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' gameplay')}`;
  
  // Cupón
  let couponBtn = '';
  const codeMatch = game.description?.match(/\b[A-Z0-9]{5,10}\b/);
  if (codeMatch && !['STEAM', 'ANDROID', 'GAMES'].includes(codeMatch[0])) {
    couponBtn = `<button class="icon-btn" onclick="copyCoupon('${codeMatch[0]}', event)" title="Copiar cupón: ${codeMatch[0]}">🎟️</button>`;
  }
  
  // Badge de fuente
  const sourceBadge = game.source === 'epic' ? '🎯' : 
                      game.source === 'gamerpower' ? '🎮' : 
                      game.source === 'reddit' ? '📱' : '';
  
  return `
    <article class="game-card ${isViewed ? 'viewed' : ''}" data-id="${game.id}" style="animation-delay: ${index * 0.05}s">
      <div class="card-actions">
        <button class="icon-btn hide-btn" onclick="hideGame('${game.id}', event)" title="Ocultar">🙈</button>
        <button class="icon-btn heart-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavorite('${game.id}', event)" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <a href="${ytLink}" target="_blank" class="icon-btn trailer-btn" onclick="event.stopPropagation()" title="Ver gameplay">▶️</a>
        ${couponBtn}
      </div>
      
      <div class="card-image-wrapper">
        <img src="${game.image}" 
             alt="${escapeHtml(game.title)}"
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x150?text=Juego+Gratis'">
        <div class="badges-container">
          <span class="platform-badge ${game.platform}">${sourceBadge} ${escapeHtml(game.platformName || game.platform)}</span>
          ${worth}
        </div>
      </div>
      
      <div class="game-info">
        <h3>${escapeHtml(game.title)}</h3>
        <p>${escapeHtml(game.description || 'Juego gratuito disponible')}</p>
        
        <div class="meta-info">
          <span class="time-tag ${timeInfo.class}">${timeInfo.text}</span>
          <a href="${game.url}" target="_blank" rel="noopener" class="claim-btn" onclick="markAsViewed('${game.id}')">
            Reclamar →
          </a>
        </div>
      </div>
    </article>
  `;
}

function getTimeInfo(endDate, type) {
  if (!endDate) {
    return type === 'App' 
      ? { text: '⚡ Oferta Flash', class: 'urgent' }
      : { text: '✓ Siempre gratis', class: 'normal' };
  }
  
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  
  if (diff <= 0) {
    return { text: '✗ Expirado', class: 'expired' };
  }
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  
  if (days > 0) {
    return { 
      text: `⏰ ${days}d ${hours}h`, 
      class: days <= 2 ? 'urgent' : 'normal' 
    };
  }
  
  return { text: `🔥 ${hours}h restantes`, class: 'urgent' };
}

// ========================================
// ACCIONES DE JUEGOS
// ========================================

function markAsViewed(id) {
  if (!state.viewedGames.includes(id)) {
    state.viewedGames.push(id);
    localStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(state.viewedGames));
    
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) card.classList.add('viewed');
  }
}

function toggleFavorite(id, event) {
  event?.stopPropagation();
  
  const index = state.favorites.indexOf(id);
  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast('Eliminado de favoritos', 'info');
  } else {
    state.favorites.push(id);
    showToast('Añadido a favoritos ❤️', 'success');
  }
  
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
  updateCounts();
  applyFilters();
}

function hideGame(id, event) {
  event?.stopPropagation();
  
  if (confirm('¿Ocultar este juego? Puedes verlo nuevamente en "Ocultos"')) {
    state.hiddenGames.push(id);
    localStorage.setItem(STORAGE_KEYS.HIDDEN, JSON.stringify(state.hiddenGames));
    showToast('Juego ocultado', 'info');
    updateCounts();
    applyFilters();
  }
}

function toggleShowFavorites() {
  state.showFavoritesOnly = !state.showFavoritesOnly;
  state.showHiddenOnly = false;
  
  document.getElementById('btn-favorites').classList.toggle('active', state.showFavoritesOnly);
  
  if (state.showFavoritesOnly) {
    showToast('Mostrando favoritos ❤️', 'info');
  }
  
  applyFilters();
}

function showHiddenGames() {
  state.showHiddenOnly = !state.showHiddenOnly;
  state.showFavoritesOnly = false;
  
  document.getElementById('btn-favorites')?.classList.remove('active');
  
  if (state.showHiddenOnly) {
    showToast('Mostrando juegos ocultos 🙈', 'info');
  }
  
  applyFilters();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.querySelector('.clear-search').classList.add('hidden');
  applyFilters();
}

function resetAllFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'default';
  document.querySelectorAll('.chip, .type-btn, .filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.chip[data-genre="all"]').classList.add('active');
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  
  const subFilterId = state.currentMode === 'pc' ? '#sub-filters-pc' : '#sub-filters-android';
  document.querySelector(`${subFilterId} .type-btn[data-type="all"]`).classList.add('active');
  
  state.showFavoritesOnly = false;
  state.showHiddenOnly = false;
  document.getElementById('btn-favorites')?.classList.remove('active');
  
  applyFilters();
}

// ========================================
// CAMBIO DE MODO
// ========================================

function switchMode(mode) {
  state.currentMode = mode;
  
  // Actualizar botones
  document.getElementById('mode-pc').classList.toggle('active', mode === 'pc');
  document.getElementById('mode-android').classList.toggle('active', mode === 'android');
  
  // Mostrar/ocultar filtros
  document.getElementById('platform-section').classList.toggle('hidden', mode === 'android');
  document.getElementById('sub-filters-pc').classList.toggle('hidden', mode !== 'pc');
  document.getElementById('sub-filters-android').classList.toggle('hidden', mode !== 'android');
  
  // Resetear filtros específicos
  state.showFavoritesOnly = false;
  state.showHiddenOnly = false;
  document.getElementById('btn-favorites')?.classList.remove('active');
  
  applyFilters();
}

// ========================================
// TEMA
// ========================================

function toggleTheme() {
  const themes = ['default', 'cyberpunk', 'matrix'];
  const currentIndex = themes.indexOf(state.currentTheme);
  state.currentTheme = themes[(currentIndex + 1) % themes.length];
  
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, state.currentTheme);
  
  updateThemeIcon();
  showToast(`Tema: ${state.currentTheme}`, 'info');
}

function updateThemeIcon() {
  const icons = {
    default: '🎨',
    cyberpunk: '💜',
    matrix: '💚'
  };
  document.getElementById('theme-icon').textContent = icons[state.currentTheme] || '🎨';
}

// ========================================
// NOTIFICACIONES
// ========================================

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Tu navegador no soporta notificaciones', 'error');
    return;
  }
  
  Notification.requestPermission().then(permission => {
    updateNotificationIcon();
    if (permission === 'granted') {
      showToast('Notificaciones activadas 🔔', 'success');
      // Enviar notificación de prueba
      new Notification('FreeGameHub', {
        body: '¡Recibirás alertas de nuevos juegos gratuitos!',
        icon: '/icons/icon-192x192.png'
      });
    } else {
      showToast('Notificaciones desactivadas', 'info');
    }
  });
}

function updateNotificationIcon() {
  const icon = document.getElementById('notif-icon');
  if (!icon) return;
  
  if (Notification.permission === 'granted') {
    icon.textContent = '🔔';
  } else {
    icon.textContent = '🔕';
  }
}

// ========================================
// UTILIDADES
// ========================================

function parsePrice(price) {
  if (!price || price === 'N/A' || price === 'Pago') return 0;
  const match = price.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function formatCurrency(amount) {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyCoupon(code, event) {
  event?.stopPropagation();
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Cupón copiado: ${code}`, 'success');
  });
}

// ========================================
// MODALES
// ========================================

function openQR() {
  const url = encodeURIComponent(window.location.href);
  document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`;
  document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQR() {
  document.getElementById('qr-modal').classList.add('hidden');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function showAbout() {
  showToast('FreeGameHub v2.0 - Hecho con ❤️ para gamers', 'info');
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Exponer funciones globales
window.switchMode = switchMode;
window.toggleTheme = toggleTheme;
window.toggleFavorite = toggleFavorite;
window.hideGame = hideGame;
window.toggleShowFavorites = toggleShowFavorites;
window.showHiddenGames = showHiddenGames;
window.clearSearch = clearSearch;
window.resetAllFilters = resetAllFilters;
window.openQR = openQR;
window.closeQR = closeQR;
window.markAsViewed = markAsViewed;
window.copyCoupon = copyCoupon;
window.showAbout = showAbout;
window.requestNotificationPermission = requestNotificationPermission;
