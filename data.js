// ============================================================
// data.js — fetch & parse Google Sheet CSV data
// ============================================================

/**
 * Fetch a CSV URL and parse it into an array of row objects,
 * keyed by the header row.
 */
async function fetchSheet(url) {
  if (!url || url.startsWith("PASTE_YOUR")) {
    throw new Error("MISSING_CONFIG");
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("FETCH_FAILED");
  const text = await res.text();
  return parseCSV(text);
}

/**
 * Minimal, dependency-free CSV parser that handles quoted fields,
 * commas inside quotes, and escaped quotes ("").
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(field); field = ""; }
      else if (char === '\r') { /* skip */ }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else field += char;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const filtered = rows.filter(r => r.some(cell => cell.trim() !== ""));
  if (filtered.length === 0) return [];

  const headers = filtered[0].map(h => h.trim().toLowerCase());
  return filtered.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

/** Fetch and normalize the Series sheet. */
async function loadSeries() {
  const rows = await fetchSheet(CONFIG.SERIES_CSV_URL);
  return rows
    .filter(r => r.id && r.title)
    .map(r => ({
      id: r.id,
      title: r.title,
      cover: r.cover || "",
      url: r.url || "",
      genre: (r.genre || "").split(/[,|]/).map(g => g.trim()).filter(Boolean),
      status: (r.status || "").toLowerCase(),
      description: r.description || "",
    }));
}

/** Fetch and normalize the Chapters sheet. */
async function loadChapters() {
  const rows = await fetchSheet(CONFIG.CHAPTERS_CSV_URL);
  return rows
    .filter(r => r.series_id && r.number)
    .map(r => ({
      seriesId: r.series_id,
      number: r.number,
      title: r.title || "",
      url: r.url || "",
      date: r.date || "",
    }))
    .sort((a, b) => parseFloat(b.number) - parseFloat(a.number));
}
