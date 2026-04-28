// CRUD + export routes for saved weather searches.
// All routes are mounted at /api/weather in server.js.
const express = require('express');
const router = express.Router();

const db = require('../db/database');
const owm = require('../services/openweather');
const { validateCreateOrUpdate } = require('../utils/validators');
const exporters = require('../utils/exporters');

// Prepared statements, compiled once at module load for speed.
const stmtInsert = db.prepare(
  'INSERT INTO weather_searches (location, date_from, date_to, temperature_data) ' +
  'VALUES (@location, @dateFrom, @dateTo, @temperatureData)'
);
const stmtSelectAll = db.prepare(
  'SELECT * FROM weather_searches ORDER BY created_at DESC'
);
const stmtSelectOne = db.prepare(
  'SELECT * FROM weather_searches WHERE id = ?'
);
const stmtUpdate = db.prepare(
  "UPDATE weather_searches " +
  "SET location = @location, date_from = @dateFrom, date_to = @dateTo, " +
  "    temperature_data = @temperatureData, updated_at = datetime('now') " +
  "WHERE id = @id"
);
const stmtDelete = db.prepare(
  'DELETE FROM weather_searches WHERE id = ?'
);

// Turn DB row (temperature_data stored as JSON string) into nice JSON for the client.
function hydrate(row) {
  if (!row) return null;
  let temperatureData = null;
  try { temperatureData = JSON.parse(row.temperature_data); } catch (_) {}
  return {
    id: row.id,
    location: row.location,
    dateFrom: row.date_from,
    dateTo: row.date_to,
    temperatureData: temperatureData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---- CREATE ----
// POST /api/weather  { location, dateFrom, dateTo }
router.post('/', async (req, res, next) => {
  try {
    const input = validateCreateOrUpdate(req.body, { partial: false });
    // Validates the location exists AND fetches fresh temperature data in one round trip.
    const snapshot = await owm.getWeatherSnapshot(input.location);

    const info = stmtInsert.run({
      location: input.location,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      temperatureData: JSON.stringify(snapshot),
    });
    const row = stmtSelectOne.get(info.lastInsertRowid);
    res.status(201).json(hydrate(row));
  } catch (err) {
    next(err);
  }
});

// ---- READ (list) ----
// GET /api/weather
router.get('/', (req, res, next) => {
  try {
    const rows = stmtSelectAll.all();
    res.json(rows.map(hydrate));
  } catch (err) {
    next(err);
  }
});

// ---- GEOCODE (disambiguation) ----
// GET /api/weather/geocode?location=Springfield
// Returns up to 5 candidate matches so the frontend can render a picker
// when the query is ambiguous (e.g. "Springfield" → IL, MA, MO, OR, ...).
// Mounted BEFORE /:id so "geocode" is not interpreted as an id.
router.get('/geocode', async (req, res, next) => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    if (!location) {
      const e = new Error('Please enter a location to search.');
      e.statusCode = 400;
      throw e;
    }
    const matches = await owm.geocodeMany(location, 5);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

// ---- LOOKUP (no save) ----
// GET /api/weather/current?location=Oakland,CA
// Frontend calls this on every search. Does NOT persist — saves happen via POST.
// Must be mounted BEFORE /:id so "current" is not interpreted as an id.
router.get('/current', async (req, res, next) => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    if (!location) {
      const e = new Error('Please enter a location to search.');
      e.statusCode = 400;
      throw e;
    }
    const snapshot = await owm.getWeatherSnapshot(location);
    res.json(snapshot);
  } catch (err) {
    next(err);
  }
});

// ---- EXPORT ----
// GET /api/weather/export?format=json|csv|pdf|xml|md
// Mounted BEFORE /:id so "export" is not interpreted as an id.
router.get('/export', (req, res, next) => {
  try {
    const format = String(req.query.format || 'json').toLowerCase();
    const rows = stmtSelectAll.all().map(hydrate);

    switch (format) {
      case 'json':     return exporters.exportJson(rows, res);
      case 'csv':      return exporters.exportCsv(rows, res);
      case 'xml':      return exporters.exportXml(rows, res);
      case 'md':
      case 'markdown': return exporters.exportMarkdown(rows, res);
      case 'pdf':      return exporters.exportPdf(rows, res);
      default: {
        const e = new Error('Unsupported export format "' + format + '" (supported: json, csv, xml, md, pdf)');
        e.statusCode = 400;
        throw e;
      }
    }
  } catch (err) {
    next(err);
  }
});

// ---- READ (one) ----
// GET /api/weather/:id
router.get('/:id', (req, res, next) => {
  try {
    const row = stmtSelectOne.get(Number(req.params.id));
    if (!row) {
      const e = new Error('Record not found');
      e.statusCode = 404;
      throw e;
    }
    res.json(hydrate(row));
  } catch (err) {
    next(err);
  }
});

// ---- UPDATE ----
// PUT /api/weather/:id  { location?, dateFrom?, dateTo? }
// Re-validates the new location and re-fetches temperature data.
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = stmtSelectOne.get(id);
    if (!existing) {
      const e = new Error('Record not found');
      e.statusCode = 404;
      throw e;
    }

    const patch = validateCreateOrUpdate(req.body, { partial: true });
    const nextLocation = patch.location != null ? patch.location : existing.location;
    const nextDateFrom = patch.dateFrom != null ? patch.dateFrom : existing.date_from;
    const nextDateTo = patch.dateTo != null ? patch.dateTo : existing.date_to;

    // Re-validate the MERGED result against the guide invariants:
    //   "Re-validate the new location and date range on update."
    //   "Update the temperature_data field with fresh API data after update."
    validateCreateOrUpdate(
      { location: nextLocation, dateFrom: nextDateFrom, dateTo: nextDateTo },
      { partial: false }
    );
    const snapshot = await owm.getWeatherSnapshot(nextLocation);

    stmtUpdate.run({
      id: id,
      location: nextLocation,
      dateFrom: nextDateFrom,
      dateTo: nextDateTo,
      temperatureData: JSON.stringify(snapshot),
    });

    res.json(hydrate(stmtSelectOne.get(id)));
  } catch (err) {
    next(err);
  }
});

// ---- DELETE ----
// DELETE /api/weather/:id
router.delete('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = stmtDelete.run(id);
    if (result.changes === 0) {
      const e = new Error('Record not found');
      e.statusCode = 404;
      throw e;
    }
    res.json({ ok: true, message: 'Record ' + id + ' deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
