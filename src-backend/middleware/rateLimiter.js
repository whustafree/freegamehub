// Rate limiter simple basado en memoria
const requests = new Map();
const WINDOW_MS = 60000; // 1 minuto
const MAX_REQUESTS = 60; // 60 requests por minuto
const CLEANUP_INTERVAL = 600000; // Limpiar IPs inactivas cada 10 minutos

let lastCleanup = Date.now();

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const hourAgo = now - 3600000;
  for (const [key, times] of requests.entries()) {
    if (times.length === 0 || times.every(t => t < hourAgo)) {
      requests.delete(key);
    }
  }
}

module.exports = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }
  
  const userRequests = requests.get(ip);
  
  // Limpiar requests antiguos
  const validRequests = userRequests.filter(time => now - time < WINDOW_MS);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones. Intenta más tarde.'
    });
  }
  
  validRequests.push(now);
  requests.set(ip, validRequests);
  
  // Limpiar IPs antiguas periodicamente (no probabilisticamente)
  cleanupOldEntries();
  
  next();
};
