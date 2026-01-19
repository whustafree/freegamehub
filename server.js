const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// TUS CREDENCIALES
const TELEGRAM_TOKEN = '8221559622:AAEXsYhMq3MSp9kBqat7iR1AWe2vN1NQV98';
const TELEGRAM_CHAT_ID = '7132481311';

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_FILE = path.join(__dirname, 'games-cache.json');

app.use(cors());
app.use(express.static('public'));

let cachedGames = [];
let lastUpdated = null;

// === SNIPER MODE: Palabras clave VIP ===
const VIP_KEYWORDS = ['gta', 'assassin', 'cyberpunk', 'elden', 'fifa', 'call of duty', 'battlefield', 'sims', 'fallout', 'skyrim', 'witcher', 'red dead'];

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      cachedGames = data.games || [];
      lastUpdated = data.lastUpdated || null;
      console.log(`📦 Caché cargado: ${cachedGames.length} items.`);
    }
  } catch (err) { console.error('⚠️ Error caché:', err.message); }
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ lastUpdated, games: cachedGames }, null, 2));
    console.log('💾 Caché guardado.');
  } catch (err) { console.error('⚠️ Error guardando:', err.message); }
}

// === LIMPIEZA AUTOMÁTICA ===
function cleanupExpired() {
  const now = new Date();
  const initialCount = cachedGames.length;
  cachedGames = cachedGames.filter(g => {
    if (!g.endDate) return true; // Si no tiene fecha, se queda
    return new Date(g.endDate) > now; // Si la fecha es futura, se queda
  });
  const deleted = initialCount - cachedGames.length;
  if (deleted > 0) {
    console.log(`🧹 Limpieza: Se eliminaron ${deleted} ofertas expiradas.`);
    saveCache();
  }
}

// === TELEGRAM AVANZADO ===
async function sendTelegramAlert(newGames) {
  if (!newGames || newGames.length === 0) return;

  // Detectar VIPs (Sniper Mode)
  const vips = newGames.filter(g => VIP_KEYWORDS.some(k => g.title.toLowerCase().includes(k)));
  const isVipAlert = vips.length > 0;

  let header = isVipAlert ? '🚨🚨 <b>¡ALERTA SNIPER: JUEGO AAA DETECTADO!</b> 🚨🚨' : '✨ <b>Nuevas Ofertas Detectadas</b>';
  let message = `${header}\n\n`;

  const limit = 10;
  const showList = newGames.slice(0, limit);

  showList.forEach(g => {
    // Icono especial si es VIP
    const isVip = VIP_KEYWORDS.some(k => g.title.toLowerCase().includes(k));
    const icon = isVip ? '💎' : (g.category === 'android' ? '📱' : '💻');
    const title = g.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    message += `${icon} <b>${title}</b>\n`;
    message += `➜ <a href="${g.url}">Reclamar</a>\n\n`;
  });

  if (newGames.length > limit) message += `<i>...y ${newGames.length - limit} más.</i>\n`;
  message += `👀 <a href="https://freegamehub.onrender.com">Ver en la Web</a>`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('✅ Notificación enviada.');
  } catch (err) { console.error('❌ Error Telegram:', err.message); }
}

// === DATOS ===
async function fetchGamerPower() {
  try {
    const [pcRes, androidRes] = await Promise.all([
      axios.get('https://www.gamerpower.com/api/giveaways?platform=pc', { timeout: 8000 }),
      axios.get('https://www.gamerpower.com/api/giveaways?platform=android', { timeout: 8000 })
    ]);
    const formatGP = (g, cat) => ({
      id: 'gp-' + g.id, title: g.title, description: g.description, image: g.image,
      url: g.open_giveaway_url, platform: cat === 'android' ? 'android' : (g.platforms.toLowerCase().includes('steam') ? 'steam' : 'epic'),
      platformName: cat === 'android' ? 'Play Store' : g.platforms, endDate: g.end_date !== "N/A" ? g.end_date : null,
      worth: g.worth, type: g.type, category: cat
    });
    return [...pcRes.data.map(g => formatGP(g, 'pc')), ...androidRes.data.map(g => formatGP(g, 'android'))];
  } catch (err) { return []; }
}

async function fetchRedditApps() {
  try {
    const { data } = await axios.get('https://www.reddit.com/r/googleplaydeals/new.json?limit=25', { headers: { 'User-Agent': 'FreeGameHub/1.0' } });
    return data.data.children.filter(post => {
        const t = post.data.title.toLowerCase();
        return (t.includes('[app') || t.includes('[icon pack')) && (t.includes('free') || t.includes('100%'));
      }).map(post => {
        const p = post.data;
        let img = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg'; 
        if (p.thumbnail && p.thumbnail.startsWith('http')) img = p.thumbnail;
        else if (p.preview?.images?.[0]?.source?.url) img = p.preview.images[0].source.url.replace('&amp;', '&');
        return {
          id: 'rd-' + p.id, title: p.title.replace(/\[.*?\]/g, '').trim(), description: 'Oferta Google Play.', image: img,
          url: p.url, platform: 'android', platformName: 'Play Store', endDate: null, worth: 'Pago', type: 'App', category: 'android'
        };
      });
  } catch (err) { return []; }
}

async function updateFreeGames() {
  console.log('🔄 Actualizando...');
  try {
    const [gpGames, redditApps] = await Promise.all([fetchGamerPower(), fetchRedditApps()]);
    const total = [...gpGames, ...redditApps];

    if (total.length > 0) {
      if (cachedGames.length > 0) {
        const newItems = total.filter(newItem => !cachedGames.some(oldItem => oldItem.id === newItem.id));
        if (newItems.length > 0) await sendTelegramAlert(newItems);
      }
      cachedGames = total;
      lastUpdated = new Date().toISOString();
      cleanupExpired(); // Limpieza cada vez que actualizamos
      saveCache();
    }
  } catch (err) { console.error('Error update:', err.message); }
}

cron.schedule('0 */4 * * *', updateFreeGames);

app.get('/api/free-games', (req, res) => res.json({ lastUpdated, games: cachedGames }));
app.listen(PORT, () => { console.log(`🚀 Server on port ${PORT}`); loadCache(); updateFreeGames(); });
