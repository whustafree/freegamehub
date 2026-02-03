const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const config = require('./src/config');
const logger = require('./src/utils/logger');
const gamesService = require('./src/services/games');
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Archivos estáticos
app.use(express.static('public'));

// Rutas API
app.use('/api', apiRoutes);

// Ruta del panel de administración
app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Programar actualización automática cada N horas
const cronExpression = `0 */${config.app.updateIntervalHours} * * *`;
cron.schedule(cronExpression, () => {
  logger.info('Ejecutando actualización programada...');
  gamesService.updateAll();
});

// Iniciar servidor
app.listen(config.port, () => {
  logger.success(`🚀 FreeGameHub v2.0 iniciado en puerto ${config.port}`);
  logger.info(`Modo: ${config.nodeEnv}`);
  logger.info(`Telegram: ${config.telegram.enabled ? '✅ Activado' : '❌ Desactivado'}`);
  logger.info(`Actualización automática: cada ${config.app.updateIntervalHours} horas`);
  
  // Cargar caché y hacer primera actualización
  gamesService.updateAll();
});
