// Export helpers for GET /api/weather/export.
// Each exporter takes the hydrated record list and writes an appropriate
// response on the Express res object.

const { Parser: Json2CsvParser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Flatten a record to a row with the most useful top-level fields from the
// temperature snapshot. Keeps CSVs readable while preserving the raw JSON below.
function flatten(rec) {
  const current = rec.temperatureData && rec.temperatureData.current;
  const loc = rec.temperatureData && rec.temperatureData.location;
  const main = current && current.main;
  const weather = current && current.weather && current.weather[0];
  return {
    id: rec.id,
    location: rec.location,
    resolvedName: loc ? loc.resolvedName : null,
    state: loc ? loc.state : null,
    country: loc ? loc.country : null,
    dateFrom: rec.dateFrom,
    dateTo: rec.dateTo,
    tempF: main ? main.temp : null,
    feelsLikeF: main ? main.feels_like : null,
    humidity: main ? main.humidity : null,
    condition: weather ? weather.main : null,
    description: weather ? weather.description : null,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
  };
}

// Build "Resolved Name, ST, CC" with whatever fields are present, falling
// back to the user-typed location string if the geocoder gave us nothing.
function formatPlace(flat) {
  if (!flat.resolvedName) return flat.location || '';
  const parts = [flat.resolvedName];
  if (flat.state) parts.push(flat.state);
  if (flat.country) parts.push(flat.country);
  return parts.join(', ');
}

function exportJson(records, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="weather-records.json"');
  res.send(JSON.stringify(records, null, 2));
}

function exportCsv(records, res) {
  const fields = [
    'id', 'location', 'resolvedName', 'state', 'country',
    'dateFrom', 'dateTo',
    'tempF', 'feelsLikeF', 'humidity',
    'condition', 'description',
    'createdAt', 'updatedAt',
  ];
  const parser = new Json2CsvParser({ fields });
  const csv = records.length === 0
    ? fields.join(',')
    : parser.parse(records.map(flatten));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="weather-records.csv"');
  res.send(csv);
}

function exportXml(records, res) {
  // Small hand-rolled XML writer — avoids pulling in another dep.
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<weatherRecords>'];
  for (const rec of records.map(flatten)) {
    lines.push('  <record>');
    for (const [k, v] of Object.entries(rec)) {
      lines.push('    <' + k + '>' + esc(v) + '</' + k + '>');
    }
    lines.push('  </record>');
  }
  lines.push('</weatherRecords>');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="weather-records.xml"');
  res.send(lines.join('\n'));
}

function exportMarkdown(records, res) {
  const lines = ['# Saved weather records', ''];
  if (records.length === 0) {
    lines.push('_No records yet._');
  } else {
    lines.push('| ID | Location | Dates | Temp (°F) | Condition |');
    lines.push('|---:|:---------|:------|----------:|:----------|');
    for (const r of records.map(flatten)) {
      const dates = r.dateFrom + ' → ' + r.dateTo;
      const temp = r.tempF == null ? '—' : Math.round(r.tempF);
      lines.push(
        '| ' + r.id +
        ' | ' + formatPlace(r) +
        ' | ' + dates +
        ' | ' + temp +
        ' | ' + (r.condition || '—') + ' |'
      );
    }
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="weather-records.md"');
  res.send(lines.join('\n'));
}

function exportPdf(records, res) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="weather-records.pdf"');

  const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
  doc.pipe(res);

  doc.fontSize(18).text('Saved weather records', { underline: false });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#555')
    .text('PM Accelerator AI Engineer Intern Assessment  ·  Built by Arinze Ohaemesi');
  doc.moveDown();
  doc.fillColor('black');

  if (records.length === 0) {
    doc.fontSize(12).text('No records yet.');
  } else {
    for (const r of records.map(flatten)) {
      doc.fontSize(13).text(formatPlace(r) + '   [#' + r.id + ']');
      doc.fontSize(10).fillColor('#333').text(
        'Dates: ' + r.dateFrom + ' → ' + r.dateTo
      );
      doc.text(
        'Temp: ' + (r.tempF == null ? '—' : Math.round(r.tempF) + '°F') +
        '   Feels like: ' + (r.feelsLikeF == null ? '—' : Math.round(r.feelsLikeF) + '°F') +
        '   Humidity: ' + (r.humidity == null ? '—' : r.humidity + '%')
      );
      doc.text('Condition: ' + (r.description || r.condition || '—'));
      doc.moveDown(0.75);
      doc.fillColor('black');
    }
  }

  doc.end();
}

module.exports = {
  exportJson, exportCsv, exportXml, exportMarkdown, exportPdf,
};
