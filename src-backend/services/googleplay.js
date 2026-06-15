const _gplay = require('google-play-scraper');
const gplay = _gplay.default || _gplay;
const logger = require('../utils/logger');

class GooglePlayService {
  constructor() {
    this.timeout = 15000;
  }

  async fetchAll() {
    const startTime = Date.now();

    try {
      logger.info('Obteniendo apps Android desde Google Play Store...');

      // Single fast call: TOP_FREE apps from Play Store
      // We don't filter by originalPrice because most free apps are permanently free (F2P).
      // The library's list() endpoint rarely returns originalPrice even for temporarily free apps.
      // Instead we just return top free games as-is — they're all free Android content.
      const apps = await gplay.list({
        collection: gplay.collection.TOP_FREE,
        num: 25,
        fullDetail: false,
      });

      if (!Array.isArray(apps)) return [];

      const seen = new Set();
      const result = [];

      apps.forEach(app => {
        if (!app || !app.title) return;

        const titleKey = app.title.toLowerCase().trim();
        if (seen.has(titleKey)) return;
        seen.add(titleKey);

        result.push(this.formatApp(app, 'Game'));
      });

      logger.success(`GooglePlayStore: ${result.length} apps obtenidas (${Date.now() - startTime}ms)`);
      return result;

    } catch (err) {
      logger.warn(`GooglePlayStore: error (${err?.message || err})`);
      return [];
    }
  }

  formatApp(app, type) {
    const titleKey = app.title.toLowerCase().trim();
    const appId = app.appId || `unknown-${titleKey.replace(/[^a-z0-9]/g, '-')}`;

    return {
      id: `gplay-${appId}`,
      title: app.title,
      description: (app.summary || app.title || '').substring(0, 300),
      image: app.icon || 'https://play-lh.googleusercontent.com/f6o5Q0KUC7lKJ7j0Gk0v0k0v0k0v0k0v0k0v0k0v0',
      url: app.url || `https://play.google.com/store/apps/details?id=${appId}`,
      platform: 'android',
      platformName: 'Play Store',
      platformIcon: '📱',
      category: 'android',
      endDate: null,
      worth: null, // All free apps, no deal price to show
      type: type,
      genre: app.genre ? app.genre.toLowerCase().replace(/\s+/g, '') : 'other',
      source: 'googleplay',
    };
  }
}

module.exports = new GooglePlayService();
