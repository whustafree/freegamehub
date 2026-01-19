const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// === TUS CREDENCIALES DE TELEGRAM ===
const TELEGRAM_TOKEN = '8221559622:AAEXsYhMq3MSp9kBqat7iR1AWe2vN1NQV98';
const TELEGRAM_CHAT_ID = '7132481311';

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_FILE = path.join(__dirname, 'games-cache.json');

app.use(cors());
app.use(express.static('public'));

let cachedGames = [];
let lastUpdated = null;

// Cargar Caché al inicio
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

// === NOTIFICACIONES TELEGRAM ===
async function sendTelegramAlert(newGames) {
  if (!newGames || newGames.length === 0) return;

  console.log(`📨 Enviando alerta por ${newGames.length} juegos nuevos...`);

  // Construir el mensaje (Máx 4096 caracteres, así que enviamos un resumen)
  let message = `🚨 <b>¡NUEVOS REGALOS DETECTADOS!</b> 🚨\n\n`;

  // Listar máximo 10 juegos para no saturar
  const limit = 10;
  const showList = newGames.slice(0, limit);

  showList.forEach(g => {
    const icon = g.category === 'android' ? '📱' : '💻';
    const typeIcon = g.type === 'App' ? '🛠️' : (g.type === 'DLC' ? '📦' : '🎮');
    // Escapar caracteres especiales para HTML de Telegram
    const title = g.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    message += `${icon} ${typeIcon} <b>${title}</b>\n`;
    message += `➜ <a href="${g.url}">Reclamar Ahora</a>\n\n`;
  });

  if (newGames.length > limit) {
    message += `<i>...y ${newGames.length - limit} más en tu web.</i>\n`;
  }
  
  message += `👀 <a href="http://192.168.1.9:3000">Ver lista completa</a>`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    console.log('✅ Mensaje enviado a Telegram.');
  } catch (err) {
    console.error('❌ Error enviando Telegram:', err.message);
  }
}

// === FUENTES DE DATOS ===
async function fetchGamerPower() {
  try {
    const [pcRes, androidRes] = await Promise.all([
      axios.get('https://www.gamerpower.com/api/giveaways?platform=pc', { timeout: 8000 }),
      axios.get('https://www.gamerpower.com/api/giveaways?platform=android', { timeout: 8000 })
    ]);

    const formatGP = (g, cat) => ({
      id: 'gp-' + g.id,
      title: g.title,
      description: g.description.length > 100 ? g.description.slice(0, 100) + '...' : g.description,
      image: g.image,
      url: g.open_giveaway_url,
      platform: cat === 'android' ? 'android' : (g.platforms.toLowerCase().includes('steam') ? 'steam' : 'epic'),
      platformName: cat === 'android' ? 'Play Store' : g.platforms,
      endDate: g.end_date !== "N/A" ? g.end_date : null,
      worth: g.worth,
      type: g.type, 
      category: cat
    });

    return [...pcRes.data.map(g => formatGP(g, 'pc')), ...androidRes.data.map(g => formatGP(g, 'android'))];
  } catch (err) { console.error('⚠️ GamerPower Error:', err.message); return []; }
}

async function fetchRedditApps() {
  try {
    const { data } = await axios.get('https://www.reddit.com/r/googleplaydeals/new.json?limit=25', { headers: { 'User-Agent': 'FreeGameHub/1.0' } });
    return data.data.children
      .filter(post => {
        const t = post.data.title.toLowerCase();
        return (t.includes('[app') || t.includes('[icon pack')) && (t.includes('free') || t.includes('100%'));
      })
      .map(post => {
        const p = post.data;
        let img = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg'; 
        if (p.thumbnail && p.thumbnail.startsWith('http')) img = p.thumbnail;
        else if (p.preview?.images?.[0]?.source?.url) img = p.preview.images[0].source.url.replace('&amp;', '&');
        return {
          id: 'rd-' + p.id,
          title: p.title.replace(/\[.*?\]/g, '').trim(),
          description: 'Oferta temporal en Google Play.',
          image: img,
          url: p.url,
          platform: 'android',
          platformName: 'Play Store (App)',
          endDate: null,
          worth: 'Pago',
          type: 'App',
          category: 'android'
        };
      });
  } catch (err) { console.error('⚠️ Reddit Error:', err.message); return []; }
}

async function updateFreeGames() {
  console.log('🔄 Buscando actualizaciones...');
  try {
    const [gpGames, redditApps] = await Promise.all([fetchGamerPower(), fetchRedditApps()]);
    const total = [...gpGames, ...redditApps];

    if (total.length > 0) {
      // Lógica de Detección de Nuevos Juegos
      if (cachedGames.length > 0) {
        // Filtramos los que NO estaban en la caché anterior
        const newItems = total.filter(newItem => !cachedGames.some(oldItem => oldItem.id === newItem.id));
        
        if (newItems.length > 0) {
           console.log(`✨ ¡${newItems.length} items nuevos detectados!`);
           await sendTelegramAlert(newItems);
        } else {
           console.log('💤 Sin novedades.');
        }
      } else {
        console.log('🚀 Primera carga (Silenciando notificaciones masivas).');
      }

      cachedGames = total;
      lastUpdated = new Date().toISOString();
      saveCache();
      console.log(`✅ TOTAL: ${total.length} items.`);
    }
  } catch (err) { console.error('💥 Error actualizando:', err.message); }
}

// Actualizar cada 4 horas
cron.schedule('0 */4 * * *', updateFreeGames);

app.get('/api/free-games', (req, res) => res.json({ lastUpdated, games: cachedGames }));
app.get('/api/refresh', async (req, res) => { await updateFreeGames(); res.json({ count: cachedGames.length }); });

// RUTA DE PRUEBA: Para forzar una notificación ahora mismo
app.get('/test-telegram', async (req, res) => {
  const fakeGame = [{
    id: 'test-' + Date.now(),
    title: 'Juego de Prueba para Telegram',
    url: 'https://google.com',
    category: 'pc',
    type: 'Game',
    worth: '$59.99'
  }];
  await sendTelegramAlert(fakeGame);
  res.send('Notificación de prueba enviada. ¡Revisa tu Telegram!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server en http://localhost:${PORT}`);
  loadCache();
  updateFreeGames();
});
