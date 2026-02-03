const express = require('express');
const router = express.Router();
const gamesService = require('../services/games');
const telegramService = require('../services/telegram');
const logger = require('../utils/logger');

// GET /api/free-games
router.get('/free-games', (req, res) => {
  try {
    const data = gamesService.getGames();
    res.json({
      success: true,
      ...data,
      count: data.games.length
    });
  } catch (err) {
    logger.error('Error en /api/free-games', err);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo juegos'
    });
  }
});

// GET /api/stats
router.get('/stats', (req, res) => {
  try {
    const stats = gamesService.getStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    logger.error('Error en /api/stats', err);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    });
  }
});

// POST /api/refresh (forzar actualización manual)
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Actualización manual solicitada');
    await gamesService.updateAll();
    res.json({
      success: true,
      message: 'Actualización completada',
      ...gamesService.getGames()
    });
  } catch (err) {
    logger.error('Error en /api/refresh', err);
    res.status(500).json({
      success: false,
      error: 'Error en actualización'
    });
  }
});

// POST /api/test-telegram
router.post('/test-telegram', async (req, res) => {
  try {
    const result = await telegramService.sendTestMessage();
    res.json({
      success: result,
      message: result ? 'Mensaje enviado' : 'Error enviando mensaje'
    });
  } catch (err) {
    logger.error('Error en /api/test-telegram', err);
    res.status(500).json({
      success: false,
      error: 'Error enviando mensaje de prueba'
    });
  }
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
