let allGamesData = [];
let hiddenGames = JSON.parse(localStorage.getItem('hiddenGames')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentMode = 'pc';
let showFavoritesOnly = false;

async function loadFreeGames() {
  const container = document.getElementById('games-container');
  try {
    const res = await fetch('/api/free-games');
    if (!res.ok) throw new Error('API Error');
    const { games, lastUpdated } = await res.json();
    allGamesData = games;
    if (lastUpdated) document.getElementById('last-update').textContent = new Date(lastUpdated).toLocaleString('es-CL');
    
    updateFavCount();
    applyFilters(); 
  } catch (err) { container.innerHTML = '<p style="text-align:center;">❌ Error de conexión.</p>'; }
}

/* === LÓGICA PRINCIPAL === */
window.switchMode = function(mode) {
  currentMode = mode;
  document.getElementById('mode-pc').classList.toggle('active', mode === 'pc');
  document.getElementById('mode-android').classList.toggle('active', mode === 'android');
  
  const filtersDiv = document.getElementById('platform-filters');
  filtersDiv.classList.toggle('hidden', mode === 'android');

  document.getElementById('sub-filters-pc').classList.toggle('hidden', mode !== 'pc');
  document.getElementById('sub-filters-android').classList.toggle('hidden', mode !== 'android');

  // Resetear al cambiar de modo
  showFavoritesOnly = false;
  document.getElementById('btn-favorites').classList.remove('active');
  document.querySelectorAll('.filter-btn, .type-btn:not(.fav-btn)').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  
  if(mode === 'pc') document.querySelector('#sub-filters-pc .type-btn[data-type="all"]').classList.add('active');
  else document.querySelector('#sub-filters-android .type-btn[data-type="all"]').classList.add('active');

  applyFilters();
};

window.toggleShowFavorites = function() {
  showFavoritesOnly = !showFavoritesOnly;
  document.getElementById('btn-favorites').classList.toggle('active', showFavoritesOnly);
  applyFilters();
}

function applyFilters() {
  const container = document.getElementById('games-container');
  container.innerHTML = '';
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const sortMode = document.getElementById('sort-select').value;
  
  const activeStore = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  let activeType = currentMode === 'pc' 
    ? (document.querySelector('#sub-filters-pc .type-btn.active')?.dataset.type || 'all')
    : (document.querySelector('#sub-filters-android .type-btn.active')?.dataset.type || 'all');

  let filtered = allGamesData.filter(game => {
    // Si estamos viendo favoritos, ignoramos el modo y filtros, solo mostramos lo guardado
    if (showFavoritesOnly) return favorites.includes(game.id);

    if (game.category !== currentMode) return false;
    if (currentMode === 'pc' && activeStore !== 'all' && !game.platform.includes(activeStore)) return false;
    
    if (activeType !== 'all') {
        if (activeType === 'game' && game.type !== 'Game') return false;
        if (activeType === 'dlc' && game.type === 'Game') return false;
        if (activeType === 'app' && game.type !== 'App') return false;
    }

    const matchesSearch = game.title.toLowerCase().includes(searchTerm);
    return matchesSearch && !hiddenGames.includes(game.id);
  });

  // ORDENAR
  if (sortMode === 'price-desc') filtered.sort((a, b) => parsePrice(b.worth) - parsePrice(a.worth));
  else if (sortMode === 'ending-soon') filtered.sort((a, b) => (a.endDate ? new Date(a.endDate) : 9e15) - (b.endDate ? new Date(b.endDate) : 9e15));

  // CALCULAR AHORRO
  calculateSavings(filtered);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:2rem;">No hay resultados.</p>';
    return;
  }
  filtered.forEach(g => createCard(g, container));
}

function calculateSavings(games) {
  let total = 0;
  games.forEach(g => total += parsePrice(g.worth));
  document.getElementById('total-savings').textContent = `$${total.toFixed(2)} USD`;
}

function createCard(game, container) {
  // Tiempos
  let timeText = 'Siempre Gratis', timeClass = 'normal';
  if (game.endDate) {
    const d = Math.floor((new Date(game.endDate) - new Date()) / 86400000);
    if (d > 0) { timeText = `🔥 ${d} días`; timeClass = 'urgent'; }
    else { timeText = 'Expirado'; timeClass = 'expired'; }
  } else if (game.type === 'App') { timeText = 'Oferta Flash'; timeClass = 'urgent'; }

  // Etiquetas
  let typeLabel = 'JUEGO', typeClass = 'type-game';
  if (game.type === 'App') { typeLabel = 'APP'; typeClass = 'type-app'; }
  else if (game.type === 'DLC') { typeLabel = 'DLC'; typeClass = 'type-dlc'; }

  const isFav = favorites.includes(game.id);
  const worthHtml = (game.worth && game.worth !== 'N/A') ? `<span class="worth-tag">${game.worth}</span>` : '';

  const card = document.createElement('div');
  card.className = 'game-card';
  card.innerHTML = `
    <div class="card-actions">
      <button class="icon-btn hide-btn" onclick="hideGame('${game.id}')" title="Ocultar">✕</button>
      <button class="icon-btn heart-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFav('${game.id}')" title="Favorito">❤</button>
      <button class="icon-btn share-btn" onclick="shareGame('${game.title}', '${game.url}')" title="Compartir">🔗</button>
    </div>
    <div class="card-image-wrapper">
      <img src="${game.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x150?text=Gratis'">
      <div class="badges-container">
          <span class="type-badge ${typeClass}">${typeLabel}</span>
          <span class="platform-badge ${game.platform}">${game.platformName}</span>
      </div>
    </div>
    <div class="game-info">
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <div class="meta-info">
        <div class="price-time-box">
           ${worthHtml}
           <span class="time-tag ${timeClass}">${timeText}</span>
        </div>
        <a href="${game.url}" target="_blank" class="claim-btn">OBTENER ➜</a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

/* === ACCIONES === */
window.hideGame = function(id) {
  if (confirm('¿Ocultar?')) { hiddenGames.push(id); localStorage.setItem('hiddenGames', JSON.stringify(hiddenGames)); applyFilters(); }
};

window.toggleFav = function(id) {
  if (favorites.includes(id)) favorites = favorites.filter(fid => fid !== id);
  else favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavCount();
  applyFilters(); // Re-renderizar para actualizar el corazón
};

window.shareGame = function(title, url) {
  if (navigator.share) {
    navigator.share({ title: 'Juego Gratis', text: `¡Mira esto! ${title} está gratis:`, url: url });
  } else {
    navigator.clipboard.writeText(`${title} Gratis: ${url}`);
    alert('Enlace copiado al portapapeles');
  }
};

window.openQR = function() {
  const url = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  document.getElementById('qr-image').src = qrUrl;
  document.getElementById('qr-modal').classList.remove('hidden');
};
window.closeQR = function() { document.getElementById('qr-modal').classList.add('hidden'); };

function updateFavCount() { document.getElementById('fav-count').textContent = favorites.length; }
function parsePrice(p) { if (!p || p === 'N/A') return 0; return parseFloat(p.replace(/[^0-9.]/g, '')) || 0; }

// Listeners Filtros
document.querySelectorAll('.type-btn:not(.fav-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.parentNode.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        applyFilters();
    });
});
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        applyFilters();
    });
});
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('sort-select').addEventListener('change', applyFilters);
document.addEventListener('DOMContentLoaded', loadFreeGames);
