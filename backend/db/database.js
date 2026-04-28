// SQLite connection + schema bootstrap.
// Uses better-sqlite3 (sync API, zero config, great for this scale).
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.resolve(__dirname, 'weather.sqlite');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Schema per the spec:
//   id, location, date_from, date_to, temperature_data (JSON), created_at, updated_at
db.exec(`
  CREATE TABLE IF NOT EXISTS weather_searches (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    location          TEXT    NOT NULL,
    date_from         TEXT    NOT NULL,
    date_to           TEXT    NOT NULL,
    temperature_data  TEXT    NOT NULL,          -- JSON string
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_weather_searches_location
    ON weather_searches(location);
`);

module.exports = db;
