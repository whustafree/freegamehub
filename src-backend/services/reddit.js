const axios = require('axios');
const logger = require('../utils/logger');

class RedditService {
  constructor() {
    this.timeout = 10000;
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    if (!this.clientId || !this.clientSecret) return null;
    if (this.accessToken && Date.now() < this.tokenExpiresAt) return this.accessToken;
    try {
      const response = await axios.post('https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        { timeout: this.timeout, auth: { username: this.clientId, password: this.clientSecret },
          headers: { 'User-Agent': 'GameRadar/2.1 (by /u/whustafree)', 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
      return this.accessToken;
    } catch (err) {
      return null;
    }
  }

  async fetchReddit(url) {
    const headers = { 'User-Agent': 'GameRadar/2.1 (by /u/whustafree)' };
    const token = await this.getAccessToken();
    if (token) headers['Authorization'] = `bearer ${token}`;
    return axios.get(url, { timeout: this.timeout, headers });
  }

  async fetchDeals(limit = 25) {
    try {
      logger.info('Obteniendo ofertas Android desde Reddit...');
      const startTime = Date.now();

      // Fetch multiple subreddits for Android deals
      const subreddits = [
        `https://www.reddit.com/r/googleplaydeals/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/AndroidGaming/hot.json?limit=${Math.min(limit, 15)}&raw_json=1`,
        `https://www.reddit.com/r/FreeGameFindings/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/AppHookup/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/efreebies/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/AndroidApps/hot.json?limit=${Math.min(limit, 15)}&raw_json=1`,
        `https://www.reddit.com/r/AppSales/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/GameDeals/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/GameDealsFree/new.json?limit=${limit}&raw_json=1`,
      ];

      const results = await Promise.allSettled(
        subreddits.map(url => this.fetchReddit(url))
      );

      const allDeals = [];
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value?.data?.data?.children) {
          const subName = subreddits[idx].split('/r/')[1].split('/')[0];
          const posts = result.value.data.data.children
            .filter(post => this.isValidDeal(post.data, subName))
            .map(post => this.formatDeal(post.data));
          allDeals.push(...posts);
        }
      });

      // Deduplicate by title
      const seen = new Set();
      const unique = allDeals.filter(d => {
        const key = d.title.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      logger.success(`Reddit: ${unique.length} ofertas Android obtenidas de ${subreddits.length} subreddits (${Date.now() - startTime}ms)`);
      return unique;

    } catch (err) {
      logger.error('Error fetching Reddit deals', err?.message || err);
      return [];
    }
  }

  isValidDeal(post, subName) {
    if (post.over_18) return false;
    const title = (post.title || '').toLowerCase();
    const selfText = (post.selftext || '').toLowerCase();
    const combined = `${title} ${selfText}`;

    // For googleplaydeals, all posts are Android deals
    if (subName === 'googleplaydeals') return true;

    // For FreeGameFindings, check if it mentions Android/Play Store
    if (subName === 'freegamefindings') {
      const androidKeywords = ['android', 'google play', 'play store', 'gplay', 'apk', '.apk'];
      if (!androidKeywords.some(k => combined.includes(k))) return false;
    }

    // For AndroidGaming, check for free/deal keywords
    if (subName === 'androidgaming') {
      const dealKeywords = ['free', '100% off', 'freebie', 'gratis', '$0', '0.00'];
      if (!dealKeywords.some(k => combined.includes(k))) return false;
    }

    // For AppHookup, check for Android/Play Store keywords
    if (subName === 'apphookup') {
      const androidKeywords = ['android', 'google play', 'play store', 'gplay', 'apk'];
      if (!androidKeywords.some(k => combined.includes(k))) return false;
    }

    // For efreebies, check for Android keywords
    if (subName === 'efreebies') {
      const androidKeywords = ['android', 'google play', 'play store', 'apk', 'mobile', 'app'];
      if (!androidKeywords.some(k => combined.includes(k))) return false;
    }

    // For AndroidApps, check for free/deal keywords
    if (subName === 'androidapps') {
      const dealKeywords = ['free', '100% off', 'freebie', 'gratis', 'sale', 'promo', 'discount', 'deal'];
      if (!dealKeywords.some(k => combined.includes(k))) return false;
    }

    // For AppSales, filter for Android deals
    if (subName === 'appsales') {
      const androidKeywords = ['android', 'google play', 'play store', 'gplay', 'apk', 'mobile'];
      const dealKeywords = ['free', '100% off', 'freebie', 'sale', 'promo', 'discount'];
      if (!dealKeywords.some(k => combined.includes(k))) return false;
      if (!androidKeywords.some(k => combined.includes(k))) return false;
    }

    // For GameDeals, filter for Android/Google Play + deal keywords
    if (subName === 'gamedeals') {
      const androidKeywords = ['android', 'google play', 'play store', 'gplay', 'apk', 'mobile'];
      const dealKeywords = ['free', '100% off', 'sale', 'discount', 'giveaway', 'promo', 'coupon'];
      if (!androidKeywords.some(k => combined.includes(k))) return false;
      if (!dealKeywords.some(k => combined.includes(k))) return false;
    }

    // For GameDealsFree, filter for Android/Google Play
    if (subName === 'gamedealsfree') {
      const androidKeywords = ['android', 'google play', 'play store', 'gplay', 'apk', 'mobile'];
      if (!androidKeywords.some(k => combined.includes(k))) return false;
    }

    return true;
  }

  formatDeal(post) {
    let image = 'https://play-lh.googleusercontent.com/f6o5Q0KUC7lKJ7j0Gk0v0k0v0k0v0k0v0k0v0k0v0';
    if (post.thumbnail && post.thumbnail.startsWith('http') && !post.thumbnail.includes('default')) {
      image = post.thumbnail;
    } else if (post.preview?.images?.[0]?.source?.url) {
      image = post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    const titleLower = (post.title || '').toLowerCase();
    let type = 'Game';
    if (titleLower.includes('[app')) type = 'App';

    const title = (post.title || '')
      .replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();

    return {
      id: `rd-${post.id}`,
      title: title || 'Android App Deal',
      description: post.selftext?.substring(0, 200) + '...' || 'Oferta temporal gratuita en Google Play Store',
      image: image,
      url: post.url || 'https://play.google.com/store/apps',
      platform: 'android',
      platformName: 'Play Store',
      platformIcon: '📱',
      category: 'android',
      endDate: this.extractEndDate(post.title),
      worth: this.extractPrice(post.title),
      type: type,
      genre: 'other',
      source: 'reddit'
    };
  }

  extractEndDate(title) {
    if (!title) return null;
    const patterns = [
      /until\s+(\d{1,2}[\/\.]\d{1,2}[\/\.]?\d{0,4})/i,
      /ends?\s+(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/i,
    ];
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) return date.toISOString();
        } catch (e) { /* ignore */ }
      }
    }
    return null;
  }

  extractPrice(title) {
    if (!title) return null;
    const match = title.match(/\$(\d+\.?\d*)/);
    if (match) return `$${match[1]}`;
    return null;
  }
}

module.exports = new RedditService();
