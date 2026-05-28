/**
 * FreeGameHub v2.0 - Vercel Serverless Entry Point
 * 
 * Este archivo adapta la app Express para funcionar como 
 * función serverless en Vercel.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Cargar .env solo si no estamos en Vercel (Vercel injecta las env vars)
if (!process.env.VERCEL) {
  require('dotenv').config();
}

const config = require('../src/config');
const gamesService = require('../src/services/games');
const apiRoutes = require('../src/routes/api');
const errorHandler = require('../src/middleware/errorHandler');
const rateLimiter = require('../src/middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats page
app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'stats.html'));
});

// Static files (para Vercel, esto se maneja con vercel.json)
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback: servir index.html para rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handler
app.use(errorHandler);

// Exportar para Vercel serverless
module.exports = app;
