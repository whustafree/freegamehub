/**
 * Backend Tests — Servicios de Android
 * Tests para fdroid.js y googleplaydeals.js
 * Run with: npm run test:backend
 */

describe('FDroidService', () => {
  it('should have fetchAll method', () => {
    const fdroidService = require('../services/fdroid');
    expect(typeof fdroidService.fetchAll).toBe('function');
  });

  it('should have formatApp method', () => {
    const fdroidService = require('../services/fdroid');
    expect(typeof fdroidService.formatApp).toBe('function');
  });

  it('should format a valid app correctly', () => {
    const fdroidService = require('../services/fdroid');
    const app = {
      packageName: 'com.example.game',
      name: 'Test Game',
      summary: 'A test game',
      categories: ['Games'],
      icon: 'com.example.game_icon.png',
      authorName: 'TestDev',
      license: 'GPL-3.0',
    };
    const result = fdroidService.formatApp(app);
    expect(result).not.toBeNull();
    expect(result.title).toBe('Test Game');
    expect(result.source).toBe('fdroid');
    expect(result.category).toBe('android');
    expect(result.license).toBe('GPL-3.0');
    expect(result.publisher).toBe('TestDev');
    expect(result.endDate).toBeNull();
    expect(result.worth).toBeNull();
    expect(result.url).toContain('com.example.game');
    expect(result.id).toBe('fdroid-com-example-game');
  });

  it('should return null for app without packageName', () => {
    const fdroidService = require('../services/fdroid');
    const result = fdroidService.formatApp({ name: 'Invalid', categories: ['Games'] });
    expect(result).toBeNull();
  });

  it('should map categories to genres correctly', () => {
    const fdroidService = require('../services/fdroid');
    expect(fdroidService.mapCategory(['Action'])).toBe('action');
    expect(fdroidService.mapCategory(['Puzzle'])).toBe('puzzle');
    expect(fdroidService.mapCategory(['Racing'])).toBe('racing');
    // Usa la PRIMERA categoría para mapear género (Games -> other)
    // Los géneros tipo 'Role Playing' vienen en categorías separadas
    expect(fdroidService.mapCategory(['Games', 'Role Playing'])).toBe('other');
    expect(fdroidService.mapCategory(['Role Playing'])).toBe('rpg');
    expect(fdroidService.mapCategory(['Strategy'])).toBe('strategy');
    expect(fdroidService.mapCategory(['Sports'])).toBe('sports');
    expect(fdroidService.mapCategory(['Connectivity'])).toBe('other');
  });

  it('should respect maxApps limit', () => {
    const fdroidService = require('../services/fdroid');
    expect(fdroidService.maxApps).toBe(30);
  });

  it('should have target categories configured', () => {
    const fdroidService = require('../services/fdroid');
    expect(fdroidService.targetCategories.has('games')).toBe(true);
    expect(fdroidService.targetCategories.has('entertainment')).toBe(true);
    expect(fdroidService.targetCategories.has('emulation')).toBe(true);
    expect(fdroidService.targetCategories.has('music')).toBe(true);
    expect(fdroidService.targetCategories.has('reading')).toBe(true);
    expect(fdroidService.targetCategories.has('sports')).toBe(true);
  });
});

describe('GooglePlayDealsService', () => {
  it('should have fetchAll method', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    expect(typeof googlePlayDealsService.fetchAll).toBe('function');
  });

  it('should have formatRedditDeal method', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    expect(typeof googlePlayDealsService.formatRedditDeal).toBe('function');
  });

  it('should format a valid Reddit post as a deal', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    const post = {
      id: 'abc123',
      title: 'Premium App - 100% off (was $4.99)',
      selftext: 'Limited time offer',
      url: 'https://play.google.com/store/apps/details?id=com.test.app',
      over_18: false,
      thumbnail: '',
      preview: {
        images: [{ source: { url: 'https://example.com/img.jpg' } }],
      },
    };
    const result = googlePlayDealsService.formatRedditDeal(post);
    expect(result).not.toBeNull();
    expect(result.source).toBe('googleplaydeals');
    expect(result.category).toBe('android');
    expect(result.platform).toBe('android');
    expect(result.url).toContain('play.google.com');
    expect(result.title).not.toContain('[100%'); // Sin brackets
    expect(result.description).toBe('Limited time offer');
  });

  it('should return null for post with very short title', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    const result = googlePlayDealsService.formatRedditDeal({ id: 'x', title: 'AB', url: 'https://play.google.com' });
    expect(result).toBeNull();
  });

  it('should extract price from post titles', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    
    // Price in title: "was $4.99" shouldn't set worth since it uses extractPrice logic
    const post1 = { id: 'a', title: 'App 100% off (was $4.99)', url: 'https://play.google.com/store/apps/details?id=com.app', over_18: false, thumbnail: '' };
    const result = googlePlayDealsService.formatRedditDeal(post1);
    expect(result?.worth).toBeTruthy();
  });

  it('should map Google Play Store genres correctly', () => {
    const googlePlayDealsService = require('../services/googleplaydeals');
    expect(googlePlayDealsService.mapGenre('Action & Adventure')).toBe('action');
    expect(googlePlayDealsService.mapGenre('Puzzle')).toBe('puzzle');
    expect(googlePlayDealsService.mapGenre('Racing')).toBe('racing');
    expect(googlePlayDealsService.mapGenre('Role Playing')).toBe('rpg');
    expect(googlePlayDealsService.mapGenre('Strategy')).toBe('strategy');
    expect(googlePlayDealsService.mapGenre('Sports')).toBe('sports');
    expect(googlePlayDealsService.mapGenre('Communication')).toBe('other');
  });
});
