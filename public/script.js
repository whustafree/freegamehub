let allGamesData = [];
let hiddenGames = JSON.parse(localStorage.getItem('hiddenGames')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let viewedGames = JSON.parse(localStorage.getItem('viewedGames')) || [];
let currentMode = 'pc';
let showFavoritesOnly = false;
let currentTheme = localStorage.getItem('theme') || 'default';

document.addEventListener('DOMContentLoaded', () => {
  setTheme(currentTheme);
  showSkeleton();
  loadFreeGames();
});

function toggleTheme() {
  currentTheme = currentTheme === 'default' ? 'cyberpunk' : (currentTheme === 'cyberpunk' ? 'matrix' : 'default');
  setTheme(currentTheme);
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function showSkeleton() {
  const container = document.getElementById('games-container');
  container.innerHTML = '';
  for(let i=0; i<6; i++) container.innerHTML += `<div class="skeleton"></div>`;
}

async function loadFreeGames() {
  try {
    const res = await fetch('/api/free-games');
    if (!res.ok) throw new Error('API Error');
    const { games, lastUpdated } = await res.json();
    allGamesData = games;
    if (lastUpdated) document.getElementById('last-update').textContent = new Date(lastUpdated).toLocaleString('es-CL');
    updateFavCount(); applyFilters(); 
  } catch (err) { document.getElementById('games-container').innerHTML = '<p style="text-align:center;">❌ Error cargando datos.</p>'; }
}

window.switchMode = function(mode) {
  currentMode = mode;
  document.getElementById('mode-pc').classList.toggle('active', mode === 'pc');
  document.getElementById('mode-android').classList.toggle('active', mode === 'android');
  document.getElementById('platform-filters').classList.toggle('hidden', mode === 'android');
  document.getElementById('sub-filters-pc').classList.toggle('hidden', mode !== 'pc');
  document.getElementById('sub-filters-android').classList.toggle('hidden', mode !== 'android');
  showFavoritesOnly = false;
  document.getElementById('btn-favorites').classList.remove('active');
  resetFilters(); applyFilters();
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
    if (game.category !== currentMode) return false;
    if (currentMode === 'pc' && activeStore !== 'all' && !game.platform.includes(activeStore)) return false;
    if (activeType !== 'all') {
        if (activeType === 'game' && game.type !== 'Game') return false;
        if (activeType === 'dlc' && game.type === 'Game') return false;
        if (activeType === 'app' && game.type !== 'App') return false;
    }
    if (activeGenre !== 'all') {
       if (!(game.title + ' ' + game.description).toLowerCase().includes(activeGenre)) return false;
    }
    return game.title.toLowerCase().includes(searchTerm) && !hiddenGames.includes(game.id);
  });

  if (sortMode === 'price-desc') filtered.sort((a, b) => parsePrice(b.worth) - parsePrice(a.worth));
  else if (sortMode === 'ending-soon') filtered.sort((a, b) => (a.endDate ? new Date(a.endDate) : 9e15) - (b.endDate ? new Date(b.endDate) : 9e15));

  calculateSavings(filtered);
  container.innerHTML = '';
  if (filtered.length === 0) { container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:2rem;">No hay resultados.</p>'; return; }
  filtered.forEach(g => createCard(g, container));
}

function createCard(game, container) {
  let timeText = 'Siempre Gratis', timeClass = 'normal';
  if (game.endDate) {
    const d = Math.floor((new Date(game.endDate) - new Date()) / 86400000);
    if (d > 0) { timeText = `🔥 ${d} días`; timeClass = 'urgent'; }
    else { timeText = 'Expirado'; timeClass = 'expired'; }
  } else if (game.type === 'App') { timeText = 'Oferta Flash'; timeClass = 'urgent'; }

  const isFav = favorites.includes(game.id);
  const isViewed = viewedGames.includes(game.id);
  const worthHtml = (game.worth && game.worth !== 'N/A') ? `<span class="worth-tag">${game.worth}</span>` : '';
  const ytLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' trailer')}`;

  const card = document.createElement('div');
  card.className = `game-card ${isViewed ? 'viewed' : ''}`;
  card.onclick = () => markAsViewed(game.id, card); // Marcar al tocar la tarjeta

  // Detector simple de cupones
  let couponBtn = '';
  const codeMatch = game.description.match(/\b[A-Z0-9]{5,}\b/);
  if (codeMatch && codeMatch[0] !== 'STEAM' && codeMatch[0] !== 'ANDROID') {
      couponBtn = `<button class="icon-btn" onclick="copyCode('${codeMatch[0]}', event)" title="Copiar Cupón">✂️</button>`;
  }

  card.innerHTML = `
    <div class="card-actions">
      <button class="icon-btn hide-btn" onclick="hideGame('${game.id}'); event.stopPropagation();">✕</button>
      <button class="icon-btn heart-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFav('${game.id}'); event.stopPropagation();">❤</button>
      <a href="${ytLink}" target="_blank" class="icon-btn trailer-btn" onclick="event.stopPropagation()" title="Ver Trailer">🎬</a>
      ${couponBtn}
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
        <a href="${game.url}" target="_blank" class="claim-btn" onclick="markAsViewed('${game.id}', this.closest('.game-card'))">VER</a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// === ACCIONES ===
function markAsViewed(id, cardElement) {
  if (!viewedGames.includes(id)) {
    viewedGames.push(id);
    localStorage.setItem('viewedGames', JSON.stringify(viewedGames));
    if (cardElement) cardElement.classList.add('viewed');
  }
}

window.hideGame = function(id) {
  if (confirm('¿Ocultar?')) { hiddenGames.push(id); localStorage.setItem('hiddenGames', JSON.stringify(hiddenGames)); applyFilters(); }
};
window.toggleFav = function(id) {
  if (favorites.includes(id)) favorites = favorites.filter(fid => fid !== id);
  else favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavCount(); applyFilters();
};
window.copyCode = function(code, e) {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    alert('Cupón copiado: ' + code);
};
window.shareGame = function(title, url) { if (navigator.share) navigator.share({ title: 'Juego Gratis', url: url }); else prompt('Copiar:', url); };
window.openQR = function() { document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`; document.getElementById('qr-modal').classList.remove('hidden'); };
window.closeQR = function() { document.getElementById('qr-modal').classList.add('hidden'); };
function updateFavCount() { document.getElementById('fav-count').textContent = favorites.length; }
function calculateSavings(games) { let total = 0; games.forEach(g => total += parsePrice(g.worth)); document.getElementById('total-savings').textContent = `$${total.toFixed(2)}`; }
function parsePrice(p) { if (!p || p === 'N/A') return 0; return parseFloat(p.replace(/[^0-9.]/g, '')) || 0; }

// EVENT LISTENERS
document.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', (e) => { document.querySelectorAll('.chip').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); applyFilters(); }));
document.querySelectorAll('.type-btn:not(.fav-btn), .filter-btn').forEach(btn => btn.addEventListener('click', (e) => { e.target.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); applyFilters(); }));
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('sort-select').addEventListener('change', applyFilters);
