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

      // Fetch multiple subreddits for Android deals (solo 'new' para ofertas activas)
      const subreddits = [
        `https://www.reddit.com/r/googleplaydeals/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/FreeGameFindings/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/AndroidGaming/new.json?limit=${Math.min(limit, 15)}&raw_json=1`,
        `https://www.reddit.com/r/AppHookup/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/efreebies/new.json?limit=${limit}&raw_json=1`,
        `https://www.reddit.com/r/AndroidApps/new.json?limit=${Math.min(limit, 15)}&raw_json=1`,
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
    if (titleLower.includes('[app') || titleLower.includes('(app') || titleLower.includes('app,')) type = 'App';

    // Better title cleaning: remove tags, brackets, common prefixes
    let title = (post.title || '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/^\s*(?:100% off|FREE|Freebie|Deal|Sale|Giveaway|App|Game)\s*[:-]\s*/i, '')
      .replace(/&amp;/g, '&')
      .trim();

    // Detect actual platform from URL if it's a Play Store link
    let platform = 'android';
    let platformName = 'Play Store';
    let platformIcon = '📱';
    let category = 'android';

    const postUrl = post.url || '';
    if (postUrl.includes('play.google.com')) {
      platform = 'android';
      platformName = 'Play Store';
      platformIcon = '📱';
      category = 'android';
    } else if (postUrl.includes('apps.apple.com') || postUrl.includes('itunes.apple.com')) {
      platform = 'ios';
      platformName = 'App Store';
      platformIcon = '🍎';
      category = 'ios';
    } else if (postUrl.includes('steampowered.com') || postUrl.includes('store.steampowered.com')) {
      platform = 'steam';
      platformName = 'Steam';
      platformIcon = '🟦';
      category = 'pc';
    }

    return {
      id: `rd-${post.id}`,
      title: title || 'App Deal',
      description: post.selftext?.substring(0, 200) + '...' || 'Oferta temporal gratuita',
      image: image,
      url: post.url || 'https://play.google.com/store/apps',
      platform: platform,
      platformName: platformName,
      platformIcon: platformIcon,
      category: category,
      endDate: this.extractEndDate(post.title, post.selftext),
      worth: this.extractPrice(titleLower),
      type: type,
      genre: 'other',
      source: 'reddit'
    };
  }

  extractEndDate(title, selfText) {
    const text = `${title || ''} ${selfText || ''}`;
    const patterns = [
      /(?:until|ends?|expires?|válido hasta|finaliza)\s*(?::|)\s*(\d{1,2})[\/\s\.](\d{1,2})[\/\s\.]?(\d{2,4})/i,
      /(?:until|ends?|válido hasta|finaliza)\s*(?::|)\s*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*,?\s*(\d{4})?)/i,
      /(\d{1,2})\s*(?:day|día)s?\s*(?:left|restantes)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) return date.toISOString();
        } catch (e) { /* ignore */ }
      }
    }
    return null;
  }

  extractPrice(text) {
    if (!text) return null;
    // Try to extract price like $4.99, 4,99€, 3.99 USD, etc.
    const patterns = [
      /\$(\d+\.?\d*)/,
      /(\d+[.,]\d+)\s*(?:€|eur|usd)/i,
      /(?:was|precio|original|before|normally|valía)\s*(?::|)\s*\$?(\d+\.?\d*)/i,
      /(?:\$|€)(\d+\.?\d*)\s*(?:→|->|⇒|➡️|➡|>)\s*(?:0|free|gratis)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const price = match[1] || match[0];
        const numPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(numPrice) && numPrice > 0 && numPrice < 1000) {
          return `$${numPrice.toFixed(2)}`;
        }
      }
    }
    
    // Special case: "100% off" - no price info but clearly a deal
    if (text.includes('100%') || text.includes('gratis') || text.includes('freebie')) {
      return null; // No original price known
    }
    
    return null;
  }
}

module.exports = new RedditService();
