const fs = require('fs');
const config = require('../config');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.data = {
      games: [],
      lastUpdated: null
    };
    // En Vercel no podemos escribir archivos, solo usamos memoria
    this.isVercel = !!process.env.VERCEL;
    if (!this.isVercel) {
      this.load();
    } else {
      logger.info('Caché en modo memoria (Vercel)');
    }
  }

  load() {
    try {
      if (fs.existsSync(config.cache.filePath)) {
        const fileData = JSON.parse(fs.readFileSync(config.cache.filePath, 'utf8'));
        this.data = {
          games: fileData.games || [],
          lastUpdated: fileData.lastUpdated || null
        };
        logger.success(`Caché cargado: ${this.data.games.length} juegos`);
      }
    } catch (err) {
      logger.error('Error cargando caché', err);
    }
  }

  save() {
    if (this.isVercel) return; // No escribir en Vercel
    try {
      fs.writeFileSync(config.cache.filePath, JSON.stringify(this.data, null, 2));
      logger.debug('Caché guardado');
    } catch (err) {
      logger.error('Error guardando caché', err);
    }
  }

  getGames() {
    return this.data.games;
  }

  setGames(games) {
    // Ordenar por startDate descendente (más nuevos primero)
    // Si no tiene startDate, usar endDate descendente como fallback
    // Si no tiene ninguna fecha, dejar al final
    const sorted = [...games].sort((a, b) => {
      const aDate = a.startDate || a.endDate;
      const bDate = b.startDate || b.endDate;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    this.data.games = sorted;
    this.data.lastUpdated = new Date().toISOString();
    this.save();
  }

  getLastUpdated() {
    return this.data.lastUpdated;
  }

  cleanupExpired() {
    const now = new Date();
    const beforeCount = this.data.games.length;
    this.data.games = this.data.games.filter(game => {
      if (!game.endDate) return true;
      return new Date(game.endDate) > now;
    });
    const removed = beforeCount - this.data.games.length;
    if (removed > 0) {
      logger.info(`${removed} juegos expirados eliminados`);
      this.save();
    }
  }

  findNewGames(newGames) {
    // Si el cache esta vacio (primera ejecucion), considerar todos como nuevos
    if (this.data.games.length === 0) return newGames;
    return newGames.filter(newGame => 
      !this.data.games.some(oldGame => oldGame.id === newGame.id)
    );
  }
}

module.exports = new CacheManager();
