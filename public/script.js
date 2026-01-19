let allGamesData = [];
let hiddenGames = JSON.parse(localStorage.getItem('hiddenGames')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentMode = 'pc';
let showFavoritesOnly = false;
let currentTheme = localStorage.getItem('theme') || 'default';

// === INICIO ===
document.addEventListener('DOMContentLoaded', () => {
  setTheme(currentTheme);
  showSkeleton(); // Muestra la animación de carga
  loadFreeGames();
});

// === TEMAS ===
function toggleTheme() {
  if (currentTheme === 'default') currentTheme = 'cyberpunk';
  else if (currentTheme === 'cyberpunk') currentTheme = 'matrix';
  else currentTheme = 'default';
  
  setTheme(currentTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  currentTheme = theme;
}

// === SKELETON ===
function showSkeleton() {
  const container = document.getElementById('games-container');
  container.innerHTML = '';
  // Crea 6 tarjetas vacías animadas
  for(let i=0; i<6; i++) {
    container.innerHTML += `<div class="skeleton"></div>`;
  }
}

// === CARGA DATOS ===
async function loadFreeGames() {
  try {
    const res = await fetch('/api/free-games');
    if (!res.ok) throw new Error('API Error');
    const { games, lastUpdated } = await res.json();
    allGamesData = games;
    if (lastUpdated) document.getElementById('last-update').textContent = new Date(lastUpdated).toLocaleString('es-CL');
    updateFavCount();
    applyFilters(); 
  } catch (err) { 
    document.getElementById('games-container').innerHTML = '<p style="text-align:center;">❌ Error cargando datos.</p>'; 
  }
}

// === FILTROS PRINCIPALES ===
window.switchMode = function(mode) {
  currentMode = mode;
  document.getElementById('mode-pc').classList.toggle('active', mode === 'pc');
  document.getElementById('mode-android').classList.toggle('active', mode === 'android');
  
  document.getElementById('platform-filters').classList.toggle('hidden', mode === 'android');
  document.getElementById('sub-filters-pc').classList.toggle('hidden', mode !== 'pc');
  document.getElementById('sub-filters-android').classList.toggle('hidden', mode !== 'android');

  showFavoritesOnly = false;
  document.getElementById('btn-favorites').classList.remove('active');
  resetFilters();
  applyFilters();
};

function resetFilters() {
  document.querySelectorAll('.filter-btn, .type-btn:not(.fav-btn), .chip').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  document.querySelector('.chip[data-genre="all"]').classList.add('active');
  
  const subFilterId = currentMode === 'pc' ? '#sub-filters-pc' : '#sub-filters-android';
  document.querySelector(`${subFilterId} .type-btn[data-type="all"]`).classList.add('active');
}

window.toggleShowFavorites = function() {
  showFavoritesOnly = !showFavoritesOnly;
  document.getElementById('btn-favorites').classList.toggle('active', showFavoritesOnly);
  applyFilters();
}

// === FILTRADO LÓGICO ===
function applyFilters() {
  const container = document.getElementById('games-container');
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const sortMode = document.getElementById('sort-select').value;
  
  const activeStore = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const activeGenre = document.querySelector('.chip.active')?.dataset.genre || 'all';
  
  let activeType = 'all';
  if (currentMode === 'pc') activeType = document.querySelector('#sub-filters-pc .type-btn.active')?.dataset.type || 'all';
  else activeType = document.querySelector('#sub-filters-android .type-btn.active')?.dataset.type || 'all';

  let filtered = allGamesData.filter(game => {
    if (showFavoritesOnly) return favorites.includes(game.id);

    // Filtros base
    if (game.category !== currentMode) return false;
    if (currentMode === 'pc' && activeStore !== 'all' && !game.platform.includes(activeStore)) return false;
    if (activeType !== 'all') {
        if (activeType === 'game' && game.type !== 'Game') return false;
        if (activeType === 'dlc' && game.type === 'Game') return false;
        if (activeType === 'app' && game.type !== 'App') return false;
    }

    // Filtro Género (Inteligente por texto)
    if (activeGenre !== 'all') {
       const text = (game.title + ' ' + game.description).toLowerCase();
       if (!text.includes(activeGenre)) return false;
    }

    const matchesSearch = game.title.toLowerCase().includes(searchTerm);
    return matchesSearch && !hiddenGames.includes(game.id);
  });

  // Ordenar
  if (sortMode === 'price-desc') filtered.sort((a, b) => parsePrice(b.worth) - parsePrice(a.worth));
  else if (sortMode === 'ending-soon') filtered.sort((a, b) => (a.endDate ? new Date(a.endDate) : 9e15) - (b.endDate ? new Date(b.endDate) : 9e15));

  calculateSavings(filtered);

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:2rem;">No hay resultados.</p>';
    return;
  }
  filtered.forEach(g => createCard(g, container));
}

// === RENDERIZADO TARJETA ===
function createCard(game, container) {
  let timeText = 'Siempre Gratis', timeClass = 'normal';
  if (game.endDate) {
    const d = Math.floor((new Date(game.endDate) - new Date()) / 86400000);
    if (d > 0) { timeText = `🔥 ${d} días`; timeClass = 'urgent'; }
    else { timeText = 'Expirado'; timeClass = 'expired'; }
  } else if (game.type === 'App') { timeText = 'Oferta Flash'; timeClass = 'urgent'; }

  const isFav = favorites.includes(game.id);
  const worthHtml = (game.worth && game.worth !== 'N/A') ? `<span class="worth-tag">${game.worth}</span>` : '';
  const typeLabel = game.type === 'App' ? 'APP' : (game.type === 'DLC' ? 'DLC' : 'JUEGO');

  const card = document.createElement('div');
  card.className = 'game-card';
  card.innerHTML = `
    <div class="card-actions">
      <button class="icon-btn hide-btn" onclick="hideGame('${game.id}')">✕</button>
      <button class="icon-btn heart-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFav('${game.id}')">❤</button>
      <button class="icon-btn share-btn" onclick="shareGame('${game.title}', '${game.url}')">🔗</button>
    </div>
    <div class="card-image-wrapper">
      <img src="${game.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x150?text=Gratis'">
      <div class="badges-container">
          <span class="platform-badge ${game.platform}">${game.platformName}</span>
      </div>
    </div>
    <div class="game-info">
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <div class="meta-info">
        <div class="price-time-box">
           ${worthHtml} <span class="time-tag ${timeClass}">${timeText}</span>
        </div>
        <a href="${game.url}" target="_blank" class="claim-btn">VER</a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// === ACCIONES ===
window.hideGame = function(id) {
  if (confirm('¿Ocultar?')) { hiddenGames.push(id); localStorage.setItem('hiddenGames', JSON.stringify(hiddenGames)); applyFilters(); }
};
window.toggleFav = function(id) {
  if (favorites.includes(id)) favorites = favorites.filter(fid => fid !== id);
  else favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavCount(); applyFilters();
};
window.shareGame = function(title, url) {
  if (navigator.share) navigator.share({ title: 'Juego Gratis', url: url });
  else prompt('Copiar enlace:', url);
};
window.openQR = function() {
  document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
  document.getElementById('qr-modal').classList.remove('hidden');
};
window.closeQR = function() { document.getElementById('qr-modal').classList.add('hidden'); };
function updateFavCount() { document.getElementById('fav-count').textContent = favorites.length; }
function calculateSavings(games) {
  let total = 0; games.forEach(g => total += parsePrice(g.worth));
  document.getElementById('total-savings').textContent = `$${total.toFixed(2)}`;
}
function parsePrice(p) { if (!p || p === 'N/A') return 0; return parseFloat(p.replace(/[^0-9.]/g, '')) || 0; }

// EVENT LISTENERS
document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', (e) => {
   document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
   e.target.classList.add('active'); applyFilters();
}));
document.querySelectorAll('.type-btn:not(.fav-btn), .filter-btn').forEach(btn => btn.addEventListener('click', (e) => {
   e.target.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('active'));
   e.target.classList.add('active'); applyFilters();
}));
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('sort-select').addEventListener('change', applyFilters);
