const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const vapidService = require('./vapid');

const SUBSCRIPTIONS_FILE = path.join(__dirname, '..', '..', 'data', 'push-subscriptions.json');

// Ensure data directory exists
const DATA_DIR = path.dirname(SUBSCRIPTIONS_FILE);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSubscriptions() {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Error loading push subscriptions:', err);
    return [];
  }
}

function saveSubscriptions(subscriptions) {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Error saving push subscriptions:', err);
  }
}

function addSubscription(subscription, platforms) {
  const subs = loadSubscriptions();
  const existing = subs.findIndex(s => s.endpoint === subscription.endpoint);
  const entry = {
    ...subscription,
    platforms: platforms || ['pc', 'android'],
    updatedAt: new Date().toISOString(),
  };

  if (existing >= 0) {
    subs[existing] = { ...subs[existing], ...entry };
  } else {
    entry.createdAt = new Date().toISOString();
    subs.push(entry);
  }

  // Keep max 200 subscriptions
  const trimmed = subs.slice(-200);
  saveSubscriptions(trimmed);
  return subs.length;
}

function removeSubscription(endpoint) {
  const subs = loadSubscriptions().filter(s => s.endpoint !== endpoint);
  saveSubscriptions(subs);
  return subs.length;
}

function getSubscriptions() {
  return loadSubscriptions();
}

/**
 * Envía una notificación push a una suscripción usando web-push
 * con cifrado VAPID (encriptación ECDH estándar del protocolo Web Push).
 */
async function sendPushToSubscription(subscription, payload) {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys) return false;

  const result = await vapidService.sendPush(subscription, payload);

  if (result.expired) {
    // Subscription expired, clean it up
    removeSubscription(endpoint);
    logger.info('Push subscription removed (expired):', endpoint.slice(0, 50));
    return false;
  }

  return result.success;
}

/**
 * Envía una notificación a todas las suscripciones activas.
 * Solo envía a suscripciones que coincidan con la plataforma.
 */
async function broadcastNotification(title, body, icon, platform = null) {
  const subs = loadSubscriptions();
  let sent = 0;
  let failed = 0;

  const payload = {
    notification: {
      title,
      body,
      icon: icon || 'https://gameradar-iota.vercel.app/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: 'https://gameradar-iota.vercel.app/' },
    },
  };

  for (const sub of subs) {
    // Filter by platform if specified
    if (platform && sub.platforms && !sub.platforms.includes(platform)) continue;

    const ok = await sendPushToSubscription(sub, payload);
    if (ok) sent++;
    else failed++;
  }

  logger.success(`Push broadcast: ${sent} sent, ${failed} failed (${subs.length} total subscriptions)`);
  return { sent, failed, total: subs.length };
}

module.exports = {
  addSubscription,
  removeSubscription,
  getSubscriptions,
  broadcastNotification,
  sendPushToSubscription,
};
