const gplay = require('google-play-scraper');
const logger = require('../utils/logger');

class GooglePlayService {
  constructor() {
    this.timeout = 15000;
    // Categories to search for free/top games and apps
    this.categories = [
      { collection: gplay.collection.TOP_FREE_GAMES, type: 'Game', title: 'Top Free Games' },
      { collection: gplay.collection.GROSSING_GAMES, type: 'Game', title: 'Grossing Games' },
      { collection: gplay.collection.TOP_FREE, type: 'App', title: 'Top Free Apps' },
    ];
  }

  async fetchAll() {
    const startTime = Date.now();
    const allApps = [];
    const seen = new Set();

    try {
      logger.info('Obteniendo apps Android desde Google Play Store...');

      const results = await Promise.allSettled(
        this.categories.map(cat =>
          gplay.list({
            collection: cat.collection,
            num: 40, // Get up to 40 per category
            fullDetail: true,
          }).catch(() => [])
        )
      );

      results.forEach((result, idx) => {
        if (result.status !== 'fulfilled' || !Array.isArray(result.value)) return;
        const apps = result.value;
        const catInfo = this.categories[idx] || { type: 'Game', title: 'Unknown' };

        apps.forEach(app => {
          if (!app || !app.title) return;

          // Determine if this app is a premium-to-free deal
          // priceText: current price (typically 'Free' for free apps)
          // originalPrice: original price if on sale
          // sale: boolean flag if the app is on sale
          const isFree = !app.priceText || app.priceText === 'Free' || app.priceText === '0';
          const hasOriginalPrice = app.originalPrice && app.originalPrice !== '0' && app.originalPrice !== 'Free';
          const isOnSale = app.sale === true || app.sale === 'true';

          // Only keep apps that are currently FREE AND have an original price (was paid, now free)
          // OR apps that are on sale
          const isDeal = (isFree && hasOriginalPrice) || isOnSale;
          if (!isDeal) return;

          const titleKey = app.title.toLowerCase().trim();
          if (seen.has(titleKey)) return;
          seen.add(titleKey);

          const description = app.summary || app.description || app.title;
          const icon = app.icon || app.image ||
            'https://play-lh.googleusercontent.com/f6o5Q0KUC7lKJ7j0Gk0v0k0v0k0v0k0v0k0v0k0v0';

          const worthPrice = app.originalPrice || app.priceText || '';

          allApps.push({
            id: `gplay-${app.appId || titleKey.replace(/[^a-z0-9]/g, '-')}`,
            title: app.title,
            description: typeof description === 'string'
              ? description.substring(0, 300)
              : 'Android app on Google Play Store',
            image: icon,
            url: app.url || `https://play.google.com/store/apps/details?id=${app.appId || ''}`,
            platform: 'android',
            platformName: 'Play Store',
            platformIcon: '📱',
            category: 'android',
            endDate: null,
            worth: worthPrice.startsWith('$') ? worthPrice : `$${worthPrice}`,
            type: catInfo.type,
            genre: app.genre ? app.genre.toLowerCase().replace(/\s+/g, '') : 'other',
            source: 'googleplay',
          });
        });
      });

      // Also try fetching deals via search query
      try {
        const searchResults = await gplay.search({
          term: 'premium app free promotion',
          num: 20,
          fullDetail: true,
        });
        if (Array.isArray(searchResults)) {
          searchResults.forEach(app => {
            if (!app || !app.title) return;
            const titleKey = app.title.toLowerCase().trim();
            if (seen.has(titleKey)) return;

            const isFree = !app.priceText || app.priceText === 'Free' || app.priceText === '0';
            const hasOriginalPrice = app.originalPrice && app.originalPrice !== '0' && app.originalPrice !== 'Free';
            const isOnSale = app.sale === true || app.sale === 'true';
            const isDeal = (isFree && hasOriginalPrice) || isOnSale;
            if (!isDeal) return;

            seen.add(titleKey);

            const worthPrice = app.originalPrice || app.priceText || '';

            allApps.push({
              id: `gplay-s-${app.appId || titleKey.replace(/[^a-z0-9]/g, '-')}`,
              title: app.title,
              description: app.summary?.substring(0, 300) || 'Android app with offer on Google Play',
              image: app.icon || 'https://play-lh.googleusercontent.com/f6o5Q0KUC7lKJ7j0Gk0v0k0v0k0v0k0v0k0v0k0v0',
              url: app.url || `https://play.google.com/store/apps/details?id=${app.appId || ''}`,
              platform: 'android',
              platformName: 'Play Store',
              platformIcon: '📱',
              category: 'android',
              endDate: null,
              worth: worthPrice.startsWith('$') ? worthPrice : `$${worthPrice}`,
              type: 'Game',
              genre: app.genre ? app.genre.toLowerCase().replace(/\s+/g, '') : 'other',
              source: 'googleplay',
            });
          });
        }
      } catch (e) { /* search query failed */ }

      logger.success(`GooglePlayStore: ${allApps.length} apps/juegos obtenidos (${Date.now() - startTime}ms)`);
      return allApps;

    } catch (err) {
      logger.warn(`GooglePlayStore: error general (${err?.message || err})`);
      return [];
    }
  }
}

module.exports = new GooglePlayService();
