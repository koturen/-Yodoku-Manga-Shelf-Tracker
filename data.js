// ============================================================
// data.js — gọi Apps Script Web App để lấy dữ liệu
// ============================================================

async function callApi(params) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.startsWith("PASTE_YOUR")) {
    throw new Error("MISSING_CONFIG");
  }
  const url = new URL(CONFIG.APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("FETCH_FAILED");
  const json = await res.json();
  if (json && json.error) throw new Error("API_ERROR: " + json.error);
  return json;
}

/** Lấy danh sách tất cả bộ truyện (mỗi tab sheet = 1 bộ truyện). */
async function loadSeriesList() {
  const rows = await callApi({ action: "series" });
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    cover: r.cover || "",
    link: r.link || "",
    genre: (r.genre || "").split(/[,|]/).map(g => g.trim()).filter(Boolean),
    status: r.status || "",
    volumeCount: r.volumeCount || 0,
  }));
}

/** Lấy chi tiết 1 bộ truyện (metadata + danh sách tập) theo tên tab. */
async function loadSeriesDetail(seriesId) {
  const r = await callApi({ action: "detail", name: seriesId });
  return {
    id: r.id,
    title: r.title,
    genre: (r.genre || "").split(/[,|]/).map(g => g.trim()).filter(Boolean),
    status: r.status || "",
    link: r.link || "",
    volumes: (r.volumes || []).map(v => ({
      number: v["Tập"] || "",
      status: v["Trạng thái"] || "",
      priceCover: v["Giá bìa"] || "",
      priceSale: v["Giá sẵn"] || "",
      cover: v["Ảnh bìa"] || "",
    })),
  };
}
