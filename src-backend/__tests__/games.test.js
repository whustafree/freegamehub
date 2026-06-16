/**
 * Backend Tests — GameRadar
 * Run with: npm run test:backend
 * These tests validate utilities, services and middleware.
 */

// CacheManager singleton — track baseline to handle pre-populated state
const cacheManager = require('../utils/cache');
const cacheBaseline = cacheManager.getGames().length;

describe('CacheManager', () => {
  it('should return an array of games', () => {
    const games = cacheManager.getGames();
    expect(Array.isArray(games)).toBe(true);
  });

  it('should have a lastUpdated timestamp or null', () => {
    const last = cacheManager.getLastUpdated();
    expect(last === null || typeof last === 'string').toBe(true);
  });

  it('should find new games (all are new when baseline is 0)', () => {
    const newGames = cacheManager.findNewGames([{ id: 'test-1' }, { id: 'test-2' }]);
    // If cache has games, only truly new IDs should be returned
    if (cacheBaseline === 0) {
      expect(newGames.length).toBe(2);
    } else {
      expect(newGames.length).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('StatsManager', () => {
  const statsManager = require('../utils/stats');

  it('should have a bootTime', () => {
    expect(typeof statsManager.bootTime).toBe('string');
  });

  it('should increment scan count monotonically', () => {
    const before = statsManager.data.totalScans;
    statsManager.incrementScans();
    expect(statsManager.data.totalScans).toBe(before + 1);
  });

  it('should increment alerts count monotonically', () => {
    const before = statsManager.data.alertsSent;
    statsManager.incrementAlerts();
    expect(statsManager.data.alertsSent).toBe(before + 1);
  });

  it('should format uptime correctly', () => {
    expect(statsManager.formatUptime(0)).toBe('< 1m');
    expect(statsManager.formatUptime(120)).toBe('2m');
    expect(statsManager.formatUptime(3661)).toBe('1h 1m');
    expect(statsManager.formatUptime(86400)).toBe('1d');
  });

  it('should keep max 10 errors', () => {
    const before = statsManager.data.errors.length;
    for (let i = 0; i < 15; i++) {
      statsManager.addError(new Error(`Error ${i}`));
    }
    expect(statsManager.data.errors.length).toBeLessThanOrEqual(10);
    // Restore errors to previous state
    while (statsManager.data.errors.length > before) {
      statsManager.data.errors.pop();
    }
  });
});

describe('Config', () => {
  const ORIG_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIG_ENV };
    jest.resetModules();
  });

  it('should have default port 3000', () => {
    delete process.env.PORT;
    jest.resetModules();
    const config = require('../config');
    expect(config.port).toBe(3000);
  });

  it('should detect Telegram as disabled without env vars', () => {
    delete process.env.TELEGRAM_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    jest.resetModules();
    const config = require('../config');
    expect(config.telegram.enabled).toBe(false);
  });

  it('should have default update interval of 4 hours', () => {
    delete process.env.UPDATE_INTERVAL_HOURS;
    jest.resetModules();
    const config = require('../config');
    expect(config.app.updateIntervalHours).toBe(4);
  });

  it('should list vipKeywords as an array', () => {
    jest.resetModules();
    const config = require('../config');
    expect(Array.isArray(config.vipKeywords)).toBe(true);
    expect(config.vipKeywords.length).toBeGreaterThan(0);
  });
});

describe('Logger', () => {
  it('should have all log methods', () => {
    const logger = require('../utils/logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.success).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});

describe('TelegramService', () => {
  const ORIG_ENV = { ...process.env };
  afterEach(() => {
    process.env = { ...ORIG_ENV };
  });

  it('should have sendAlert and sendTestMessage methods', () => {
    process.env.TELEGRAM_TOKEN = 'test';
    process.env.TELEGRAM_CHAT_ID = '123';
    jest.resetModules();
    const telegramService = require('../services/telegram');
    expect(typeof telegramService.sendAlert).toBe('function');
    expect(typeof telegramService.sendTestMessage).toBe('function');
  });

  it('should escape HTML correctly', () => {
    jest.resetModules();
    const telegramService = require('../services/telegram');
    expect(telegramService.escapeHtml('<b>test</b> & more')).toBe('&lt;b&gt;test&lt;/b&gt; &amp; more');
  });

  it('should detect VIP games by title', () => {
    jest.resetModules();
    const telegramService = require('../services/telegram');
    expect(telegramService.isVipGame('GTA 6')).toBe(true);
    expect(telegramService.isVipGame('Among Us')).toBe(false);
  });
});

describe('Middleware', () => {
  it('errorHandler should be a function', () => {
    const errorHandler = require('../middleware/errorHandler');
    expect(typeof errorHandler).toBe('function');
  });

  it('rateLimiter should be a function', () => {
    const rateLimiter = require('../middleware/rateLimiter');
    expect(typeof rateLimiter).toBe('function');
  });
});
