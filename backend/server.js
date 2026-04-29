// Entry point for the Express backend.
// Loads .env from the backend directory.
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const weatherRoutes  = require('./routes/weather');
const youtubeRoutes  = require('./routes/youtube');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

// Healthcheck — confirms the server and env are wired up correctly.
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'weather-app-backend',
    hasApiKey: Boolean(process.env.OPENWEATHER_API_KEY),
    time: new Date().toISOString(),
  });
});

// Mount CRUD + export routes at /api/weather.
app.use('/api/weather', weatherRoutes);

// Mount YouTube search route at /api/youtube.
app.use('/api/youtube', youtubeRoutes);

// 404 for anything that didn't match.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found: ' + req.method + ' ' + req.originalUrl });
});

// Centralized error handler. Every route forwards thrown errors here via next(err).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('[backend error]', err);
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('[backend] listening on http://localhost:' + PORT);
});
