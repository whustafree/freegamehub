/**
 * FreeGameHub v2.0 - Frontend JavaScript
 * Mejorado con menú colapsable, notificaciones y mejor UX
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

// Constantes de almacenamiento
const STORAGE_KEYS = {
  HIDDEN: 'fgh_hiddenGames_v2',
  FAVORITES: 'fgh_favorites_v2',
  VIEWED: 'fgh_viewedGames_v2',
  THEME: 'fgh_theme'
};

// Mapeo de géneros para el filtrado
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
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const clearBtn = document.querySelector('.clear-search');
      if (clearBtn) clearBtn.classList.toggle('hidden', !e.target.value);
      searchTimeout = setTimeout(applyFilters, 300);
    });
  }

  // Ordenar
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);

  // Chips de género
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Botones de tipo (Juegos/DLCs/Apps)
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.sub-filters');
      container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Botones de plataforma (Steam/Epic/etc)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFilters();
    });
  });

  // Atajos de teclado
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
// LÓGICA DE MENÚ COLAPSABLE (MÓVIL)
// ========================================

function toggleFilters() {
  const menu = document.getElementById('filter-menu');
  const arrow = document.getElementById('filter-arrow');
  
  if (menu) {
    menu.classList.toggle('active');
    // Cambia la flecha según el estado
    if (arrow) {
      arrow.textContent = menu.classList.contains('active') ? '▲' : '▼';
    }
  }
}

// ========================================
// CARGA Y RENDERIZADO
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
    
    showToast('Juegos actualizados', 'success');
  } catch (err) {
    console.error('Error loading games:', err);
    showError('Error al conectar con el servidor.');
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  state.isLoading = show;
  const loader = document.getElementById('loading-state');
  const container = document.getElementById('games-container');
  if (loader) loader.classList.toggle('hidden', !show);
  if (container) container.classList.toggle('hidden', show);
}

function updateLastUpdate(timestamp) {
  const el = document.getElementById('last-update');
  if (!el || !timestamp) return;
  const date = new Date(timestamp);
  const diff = Math.floor((new Date() - date) / 60000);
  
  let text = diff < 1 ? 'Ahora' : diff < 60 ? `${diff}m` : `${Math.floor(diff/60)}h`;
  el.textContent = text;
}

function updateCounts() {
  const visible = state.allGames.filter(g => !state.hiddenGames.includes(g.id));
  const gamesCountEl = document.getElementById('games-count');
  const favCountEl = document.getElementById('fav-count');
  const savingsEl = document.getElementById('total-savings');

  if (gamesCountEl) gamesCountEl.textContent = visible.length;
  if (favCountEl) favCountEl.textContent = state.favorites.length;
  
  if (savingsEl) {
    const total = visible.reduce((sum, g) => sum + parsePrice(g.worth), 0);
    savingsEl.textContent = formatCurrency(total);
  }
}

// ========================================
// FILTROS
// ========================================

function applyFilters() {
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
  const sortMode = document.getElementById('sort-select')?.value || 'default';
  const activeGenre = document.querySelector('.chip.active')?.dataset.genre || 'all';
  const activeStore = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  
  let activeType = 'all';
  const subFilterId = state.currentMode === 'pc' ? '#sub-filters-pc' : '#sub-filters-android';
  const activeTypeBtn = document.querySelector(`${subFilterId} .type-btn.active`);
  if (activeTypeBtn) activeType = activeTypeBtn.dataset.type;

  let filtered = state.allGames.filter(game => {
    if (state.showFavoritesOnly) return state.favorites.includes(game.id);
    if (state.showHiddenOnly) return state.hiddenGames.includes(game.id);
    if (state.hiddenGames.includes(game.id)) return false;
    
    if (game.category !== state.currentMode) return false;
    
    if (state.currentMode === 'pc' && activeStore !== 'all') {
      if (!game.platform?.includes(activeStore)) return false;
    }
    
    if (activeType !== 'all') {
      const type = game.type?.toLowerCase() || '';
      if (!type.includes(activeType)) return false;
    }
    
    if (activeGenre !== 'all') {
      const keywords = GENRE_KEYWORDS[activeGenre] || [];
      const text = `${game.title} ${game.description}`.toLowerCase();
      if (!keywords.some(k => text.includes(k))) return false;
    }
    
    if (searchTerm) {
      const text = `${game.title} ${game.description} ${game.platformName}`.toLowerCase();
      if (!text.includes(searchTerm)) return false;
    }
    
    return true;
  });

  state.filteredGames = sortGames(filtered, sortMode);
  renderGames(state.filteredGames);
}

function sortGames(games, mode) {
  const sorted = [...games];
  if (mode === 'price-desc') sorted.sort((a, b) => parsePrice(b.worth) - parsePrice(a.worth));
  else if (mode === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
  else if (mode === 'ending-soon') {
    sorted.sort((a, b) => (new Date(a.endDate || '2099')) - (new Date(b.endDate || '2099')));
  }
  return sorted;
}

function renderGames(games) {
  const container = document.getElementById('games-container');
  const empty = document.getElementById('empty-state');
  if (!container) return;

  if (games.length === 0) {
    container.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  } else {
    container.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    container.innerHTML = games.map((g, i) => createGameCard(g, i)).join('');
  }
}

function createGameCard(game, index) {
  const isFav = state.favorites.includes(game.id);
  const isViewed = state.viewedGames.includes(game.id);
  const worth = game.worth && game.worth !== 'N/A' ? `<span class="platform-badge worth-badge">${game.worth}</span>` : '';
  
  return `
    <article class="game-card ${isViewed ? 'viewed' : ''}" data-id="${game.id}" style="animation-delay: ${index * 0.05}s">
      <div class="card-actions">
        <button class="icon-btn" onclick="hideGame('${game.id}', event)">🙈</button>
        <button class="icon-btn heart-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavorite('${game.id}', event)">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-image-wrapper">
        <img src="${game.image}" alt="${game.title}" loading="lazy">
        <div class="badges-container">
          <span class="platform-badge ${game.platform}">${game.platformName || game.platform}</span>
          ${worth}
        </div>
      </div>
      <div class="game-info">
        <h3>${game.title}</h3>
        <p>${game.description || ''}</p>
        <div class="meta-info">
          <a href="${game.url}" target="_blank" class="claim-btn" onclick="markAsViewed('${game.id}')">Reclamar →</a>
        </div>
      </div>
    </article>
  `;
}

// ========================================
// ACCIONES Y UTILIDADES
// ========================================

function markAsViewed(id) {
  if (!state.viewedGames.includes(id)) {
    state.viewedGames.push(id);
    localStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(state.viewedGames));
    document.querySelector(`[data-id="${id}"]`)?.classList.add('viewed');
  }
}

function toggleFavorite(id, event) {
  event?.stopPropagation();
  const idx = state.favorites.indexOf(id);
  if (idx > -1) state.favorites.splice(idx, 1);
  else state.favorites.push(id);
  
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
  updateCounts();
  applyFilters();
  showToast(idx > -1 ? 'Quitado de favoritos' : 'Agregado a favoritos ❤️');
}

function hideGame(id, event) {
  event?.stopPropagation();
  state.hiddenGames.push(id);
  localStorage.setItem(STORAGE_KEYS.HIDDEN, JSON.stringify(state.hiddenGames));
  updateCounts();
  applyFilters();
  showToast('Juego ocultado 🙈');
}

function switchMode(mode) {
  state.currentMode = mode;
  document.getElementById('mode-pc').classList.toggle('active', mode === 'pc');
  document.getElementById('mode-android').classList.toggle('active', mode === 'android');
  document.getElementById('platform-section').classList.toggle('hidden', mode === 'android');
  document.getElementById('sub-filters-pc').classList.toggle('hidden', mode !== 'pc');
  document.getElementById('sub-filters-android').classList.toggle('hidden', mode !== 'android');
  applyFilters();
}

function toggleTheme() {
  const themes = ['default', 'cyberpunk', 'matrix'];
  state.currentTheme = themes[(themes.indexOf(state.currentTheme) + 1) % themes.length];
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, state.currentTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icons = { default: '🎨', cyberpunk: '💜', matrix: '💚' };
  const el = document.getElementById('theme-icon');
  if (el) el.textContent = icons[state.currentTheme];
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function parsePrice(p) {
  const m = p?.toString().match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function formatCurrency(n) {
  return n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n.toFixed(0)}`;
}

function openQR() {
  const img = document.getElementById('qr-image');
  if (img) img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
  document.getElementById('qr-modal')?.classList.remove('hidden');
}

function closeQR() {
  document.getElementById('qr-modal')?.classList.add('hidden');
}

function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(updateNotificationIcon);
}

function updateNotificationIcon() {
  const el = document.getElementById('notif-icon');
  if (el) el.textContent = Notification.permission === 'granted' ? '🔔' : '🔕';
}

// Exponer funciones al objeto window para los onclick del HTML
window.switchMode = switchMode;
window.toggleTheme = toggleTheme;
window.toggleFilters = toggleFilters;
window.toggleFavorite = toggleFavorite;
window.hideGame = hideGame;
window.openQR = openQR;
window.closeQR = closeQR;
window.markAsViewed = markAsViewed;
window.requestNotificationPermission = requestNotificationPermission;
window.toggleShowFavorites = () => { state.showFavoritesOnly = !state.showFavoritesOnly; applyFilters(); };
window.showHiddenGames = () => { state.showHiddenOnly = !state.showHiddenOnly; applyFilters(); };
