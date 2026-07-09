// ============================================================
// data.js — gọi Apps Script API, chuẩn hoá dữ liệu theo nhãn tiếng Việt
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

/** Trạng thái xuất bản -> { label, className } dùng chung cho pill/badge */
const STATUS_MAP = [
  { match: ["đang xuất bản"], label: "Đang xuất bản", cls: "status-ongoing" },
  { match: ["hoàn thành", "đã kết thúc"], label: "Hoàn thành", cls: "status-completed" },
  { match: ["tạm dừng"], label: "Tạm dừng", cls: "status-paused" },
  { match: ["tạm ngưng"], label: "Tạm ngưng", cls: "status-halted" },
  { match: ["công bố bản quyền"], label: "Công bố bản quyền", cls: "status-announced" },
];

function resolveStatus(raw) {
  const s = (raw || "").toLowerCase().trim();
  const found = STATUS_MAP.find(entry => entry.match.some(m => s.includes(m)));
  return found ? found : { label: raw || "", cls: "status-default" };
}

const ALL_FILTERS = STATUS_MAP.map(s => ({ label: s.label, cls: s.cls }));

/** Danh sách bộ truyện cho trang chủ */
async function loadSeriesList() {
  const rows = await callApi({ action: "series" });
  return rows.map(r => ({
    id: r.id,
    title: r.title,
    author: r.author || "",
    cover: r.cover || "",
    link: r.link || "",
    genre: (r.genre || "").split(/[,|]/).map(g => g.trim()).filter(Boolean),
    demographic: r.demographic || "",
    publisherVN: r.publisherVN || "",
    yearVN: r.yearVN || "",
    status: resolveStatus(r.statusVN),
    totalVolumes: r.totalVolumes || "",
    price: r.price || "",
  }));
}

/** Chi tiết 1 bộ truyện: trả về meta thô + volumes đã chuẩn hoá */
async function loadSeriesDetail(seriesId) {
  const r = await callApi({ action: "detail", name: seriesId });
  const m = r.meta || {};
  const volumes = (r.volumes || []).map(v => ({
    number: v["Tập"] || "",
    subtitle: v["Phụ đề"] || v["Phụ đề tập"] || "",
    subtitleRomaji: v["Phụ đề phiên âm"] || "",
    subtitleJP: v["Phụ đề JP"] || v["Phụ đề tập tiếng Nhật"] || "",
    chapterRange: v["Chương"] || v["Chương truyện"] || "",
    releaseDate: v["Ngày phát hành"] || v["Ngày xuất bản"] || "",
    price: v["Giá bìa"] || "",
    status: v["Trạng thái"] || "",
    cover: v["Ảnh bìa"] || "",
  }));

  return {
    id: r.id,
    meta: m,
    title: m["Tên bộ"] || r.id,
    genre: (m["Thể loại"] || "").split(/[,|]/).map(g => g.trim()).filter(Boolean),
    demographic: m["Đối tượng độc giả"] || "",
    status: resolveStatus(m["Trạng thái xuất bản 🇻🇳"]),
    statusJP: m["Trạng thái xuất bản 🇯🇵"] || "",
    link: m["Link mua"] || m["Link"] || m["Trang bán"] || "",
    volumes,
  };
}

/**
 * Xây bảng thông tin kiểu wiki, chia 3 nhóm.
 * Chỉ hiển thị dòng nào có dữ liệu trong sheet — thêm field mới vào
 * sheet với đúng nhãn dưới đây là tự động xuất hiện, không cần sửa code.
 */
function buildWikiSections(meta, volumes) {
  const firstVol = volumes[0];
  const lastVol = volumes[volumes.length - 1];

  const sections = [
    {
      title: "Thông tin tác phẩm",
      rows: [
        ["Tựa tiếng Việt", meta["Tên bộ"]],
        ["Tựa gốc", meta["Tựa gốc"]],
        ["Tựa phiên âm", meta["Tựa phiên âm"]],
        ["Tên tiếng Anh", meta["Tên tiếng Anh"]],
        ["Tác giả", meta["Tác giả"]],
        ["Họa sĩ", meta["Họa sĩ"]],
        ["Dịch giả", meta["Dịch giả"]],
        ["Tổng số tập", meta["Tổng số tập"]],
        ["Đối tượng độc giả", meta["Đối tượng độc giả"]],
      ],
    },
    {
      title: "Thông tin xuất bản",
      rows: [
        ["Nhà xuất bản 🇻🇳", meta["Nhà xuất bản 🇻🇳"]],
        ["Năm xuất bản 🇻🇳", meta["Năm xuất bản 🇻🇳"]],
        ["Trạng thái xuất bản 🇻🇳", meta["Trạng thái xuất bản 🇻🇳"]],
        ["Nhà xuất bản 🇯🇵", meta["Nhà xuất bản 🇯🇵"]],
        ["Năm xuất bản 🇯🇵", meta["Năm xuất bản 🇯🇵"]],
        ["Trạng thái xuất bản 🇯🇵", meta["Trạng thái xuất bản 🇯🇵"]],
        ["Tập đầu tiên", firstVol ? `${meta["Tên bộ"] || ""} - Vol. ${firstVol.number}`.trim() : ""],
        ["Tập mới nhất", lastVol ? `${meta["Tên bộ"] || ""} - Vol. ${lastVol.number}`.trim() : ""],
      ],
    },
    {
      title: "Thông tin ấn bản",
      rows: [
        ["Loại ấn phẩm", meta["Loại ấn phẩm"]],
        ["Phiên bản", meta["Phiên bản"]],
        ["Ấn bản", meta["Ấn bản"]],
        ["Định dạng bìa", meta["Định dạng bìa"]],
        ["Loại bìa", meta["Loại bìa"]],
        ["Khổ giấy (rộng x cao)", meta["Khổ giấy (rộng x cao)"]],
        ["Giá bìa", meta["Giá bìa"] || (firstVol && firstVol.price) || ""],
      ],
    },
  ];

  // Lọc bỏ các dòng không có dữ liệu
  return sections
    .map(sec => ({ title: sec.title, rows: sec.rows.filter(([, v]) => v && String(v).trim()) }))
    .filter(sec => sec.rows.length > 0);
}
