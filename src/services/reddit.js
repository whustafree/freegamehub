const axios = require('axios');
const logger = require('../utils/logger');

class RedditService {
  constructor() {
    this.baseUrl = 'https://www.reddit.com/r/googleplaydeals/new.json';
    this.timeout = 10000;
  }

  async fetchDeals(limit = 25) {
    try {
      logger.info('Obteniendo ofertas de Reddit...');
      const startTime = Date.now();

      const response = await axios.get(`${this.baseUrl}?limit=${limit}`, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'FreeGameHub/2.0'
        }
      });

      const deals = response.data.data.children
        .filter(post => this.isValidDeal(post.data))
        .map(post => this.formatDeal(post.data));

      logger.success(`Reddit: ${deals.length} ofertas obtenidas (${Date.now() - startTime}ms)`);
      return deals;

    } catch (err) {
      logger.error('Error fetching Reddit deals', err);
      return [];
    }
  }

  isValidDeal(post) {
    const title = post.title.toLowerCase();
    // Filtrar posts que sean apps o icon packs gratuitos
    const isAppOrPack = title.includes('[app') || 
                        title.includes('[icon pack') || 
                        title.includes('[game');
    const isFree = title.includes('free') || 
                   title.includes('100%') || 
                   title.includes('gratis');
    return isAppOrPack && isFree;
  }

  formatDeal(post) {
    // Extraer imagen del post
    let image = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg';
    
    if (post.thumbnail && post.thumbnail.startsWith('http')) {
      image = post.thumbnail;
    } else if (post.preview?.images?.[0]?.source?.url) {
      image = post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Determinar tipo
    const titleLower = post.title.toLowerCase();
    const type = titleLower.includes('[app') ? 'App' : 
                 titleLower.includes('[icon pack') ? 'Icon Pack' : 
                 'Game';

    // Limpiar título
    const title = post.title
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    return {
      id: `rd-${post.id}`,
      title: title,
      description: this.extractDescription(post) || 'Oferta de Google Play',
      image: image,
      url: post.url,
      platform: 'android',
      platformName: 'Play Store',
      endDate: this.extractEndDate(post.title),
      worth: this.extractPrice(post.title),
      type: type,
      category: 'android',
      genre: 'other',
      source: 'reddit'
    };
  }

  extractDescription(post) {
    if (post.selftext && post.selftext.length > 10) {
      return post.selftext.substring(0, 150) + '...';
    }
    return null;
  }

  extractEndDate(title) {
    // Buscar patrones como "until 01/31", "ends 31 Jan", etc.
    const patterns = [
      /until\s+(\d{1,2}[\/\.]\d{1,2})/i,
      /ends?\s+(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/i
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        // Intentar parsear la fecha
        try {
          const date = new Date(match[1]);
          if (!isNaN(date)) return date.toISOString();
        } catch (e) {}
      }
    }
    return null;
  }

  extractPrice(title) {
    // Buscar patrones como "$4.99", "was $9.99", etc.
    const match = title.match(/\$?(\d+\.?\d*)/);
    if (match) {
      return `$${match[1]}`;
    }
    return 'Pago';
  }
}

module.exports = new RedditService();
