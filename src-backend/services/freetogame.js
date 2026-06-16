const axios = require('axios');
const logger = require('../utils/logger');

class FreeToGameService {
  constructor() {
    this.baseUrl = 'https://www.freetogame.com/api';
    this.timeout = 10000;
  }

  async fetchAll() {
    try {
      logger.info('Obteniendo juegos free-to-play de FreeToGame API...');
      const startTime = Date.now();

      const response = await axios.get(`${this.baseUrl}/games?platform=windows`, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'GameRadar/2.1'
        }
      });

      const games = response.data.map(game => this.formatGame(game));
      logger.success(`FreeToGame: ${games.length} juegos obtenidos (${Date.now() - startTime}ms)`);
      return games;

    } catch (err) {
      logger.error('Error fetching FreeToGame', err);
      return [];
    }
  }

  detectPlatform(game) {
    const plat = (game.platform || '').toLowerCase();
    const title = (game.title || '').toLowerCase();
    const genre = (game.genre || '').toLowerCase();

    // Detectar plataforma específica
    if (plat.includes('steam') || game.game_url?.includes('steampowered') || game.game_url?.includes('store.steam')) {
      return { platform: 'steam', name: 'Steam' };
    }
    if (plat.includes('epic') || game.game_url?.includes('epicgames')) {
      return { platform: 'epic', name: 'Epic Games' };
    }
    if (plat.includes('gog')) {
      return { platform: 'gog', name: 'GOG' };
    }
    if (plat.includes('itch')) {
      return { platform: 'itch', name: 'Itch.io' };
    }
    if (plat.includes('battlenet') || title.includes('blizzard') || game.publisher?.toLowerCase().includes('blizzard')) {
      return { platform: 'battlenet', name: 'Battle.net' };
    }

    // Por defecto, es un juego de PC (Windows)
    return { platform: 'pc', name: 'PC' };
  }

  detectGenre(genre) {
    if (!genre) return 'other';
    const g = genre.toLowerCase();
    const genreMap = {
      action: ['action', 'shooter', 'battle', 'fighting', 'mmofps'],
      rpg: ['rpg', 'mmorpg', 'adventure', 'role-playing', 'mmo', 'action-rpg', 'mmorts'],
      indie: ['indie', 'pixel', 'retro'],
      strategy: ['strategy', 'tower-defense', 'tower defense', 'card', 'moba', 'sandbox'],
      puzzle: ['puzzle', 'logic', 'trivia'],
      racing: ['racing', 'driving', 'sports', 'racing'],
      sports: ['sports', 'soccer', 'football', 'basketball'],
      shooter: ['shooter', 'fps', 'mmofps', 'first-person', 'third-person'],
    };

    for (const [genreKey, keywords] of Object.entries(genreMap)) {
      if (keywords.some(k => g.includes(k))) return genreKey;
    }
    return 'other';
  }

  formatGame(game) {
    const platformInfo = this.detectPlatform(game);

    return {
      id: `ftg-${game.id}`,
      title: game.title,
      description: game.short_description || 'Free-to-play game',
      image: game.thumbnail || 'https://placehold.co/300x150/1a1a2e/3b82f6?text=' + encodeURIComponent(game.title?.slice(0, 20) || 'Game'),
      url: game.game_url || `https://www.freetogame.com/open/${game.id}`,
      platform: platformInfo.platform,
      platformName: platformInfo.name,
      platformIcon: '🖥️',
      category: 'pc',
      endDate: null, // Permanently free, no end date
      worth: null,   // Free-to-play, not a giveaway
      type: 'free-to-play',
      genre: this.detectGenre(game.genre),
      source: 'freetogame',
      instructions: null,
      // Additional metadata
      publisher: game.publisher || null,
      developer: game.developer || null,
      releaseDate: game.release_date || null,
    };
  }
}

module.exports = new FreeToGameService();
