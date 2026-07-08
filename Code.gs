/**
 * ============================================================
 * Yodoku Manga Tracker — Apps Script Web App API (v2)
 * ============================================================
 * Cách dùng:
 * 1. Mở Google Sheet > Tiện ích (Extensions) > Apps Script.
 * 2. Xoá code cũ, dán toàn bộ nội dung file này vào, Save.
 * 3. Deploy > Manage deployments > sửa (bút chì) > Version: New version > Deploy.
 *    (Nếu chưa từng deploy: Deploy > New deployment > Web app,
 *     Execute as: Me | Who has access: Anyone)
 *
 * ĐỌC SHEET NHƯ THẾ NÀO:
 * Mỗi tab = 1 bộ truyện. Các dòng phía trên (metadata) được đọc theo
 * TỪNG CẶP CỘT liền nhau: cột lẻ = nhãn, cột chẵn kế bên = giá trị.
 * Ví dụ: A1="Tên bộ" B1="One Piece"  C1="Tựa phiên âm" D1="Wan Pisu" ...
 * Cứ thế trên 1 dòng có thể có nhiều cặp nhãn/giá trị nằm cạnh nhau.
 * Quét từ dòng 1 xuống, đến khi gặp dòng có cột A = "Tập" thì dừng lại
 * — dòng đó là header của bảng tập, các dòng dưới là dữ liệu từng tập
 * (map theo tên cột ở header, ví dụ "Tập", "Phụ đề", "Ngày phát hành",
 * "Giá bìa", "Ảnh bìa"...). Bạn có thể thêm/bớt cột trong bảng tập
 * hoặc thêm cặp nhãn/giá trị metadata mới bất kỳ lúc nào mà không
 * cần sửa code này.
 * ============================================================
 */

var EXCLUDED_SHEETS = ["Example"];

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "series";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result;

  try {
    if (action === "series") {
      result = getAllSeries(ss);
    } else if (action === "detail") {
      var name = e.parameter.name;
      result = name ? getSeriesDetail(ss, name) : { error: "Thiếu tham số 'name'" };
    } else {
      result = { error: "action không hợp lệ" };
    }
  } catch (err) {
    result = { error: String(err) };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Đọc 1 tab (1 bộ truyện). Trả về { id, meta: {...tất cả cặp nhãn/giá trị}, volumes: [...] }
 */
function parseSeriesSheet(sheet) {
  var data = sheet.getDataRange().getDisplayValues();
  var rawData = sheet.getDataRange().getValues();
  var meta = {};
  var tableStartRow = -1;
  var headers = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (String(row[0] || "").trim() === "Tập") {
      tableStartRow = i;
      headers = row.map(function (h) { return String(h || "").trim(); });
      break;
    }
    // Quét từng cặp cột (label, value) trên dòng này
    for (var c = 0; c + 1 < row.length; c += 2) {
      var label = String(row[c] || "").trim();
      var value = String(row[c + 1] || "").trim();
      if (label) meta[label] = value;
    }
  }

  var volumes = [];
  if (tableStartRow > -1) {
    for (var r = tableStartRow + 1; r < data.length; r++) {
      var row2 = data[r];
      var rawRow = rawData[r];
      if (!row2[0]) continue;

      var vol = {};
      for (var c2 = 0; c2 < headers.length; c2++) {
        if (!headers[c2]) continue;
        vol[headers[c2]] = row2[c2];
      }
      var coverIdx = headers.indexOf("Ảnh bìa");
      if (coverIdx > -1) vol["Ảnh bìa"] = String(rawRow[coverIdx] || "").trim();
      volumes.push(vol);
    }
  }

  return { id: sheet.getName(), meta: meta, volumes: volumes };
}

function getAllSeries(ss) {
  var sheets = ss.getSheets();
  var result = [];

  sheets.forEach(function (sheet) {
    var name = sheet.getName();
    if (EXCLUDED_SHEETS.indexOf(name) > -1) return;

    var parsed = parseSeriesSheet(sheet);
    var m = parsed.meta;
    var lastVolCover = parsed.volumes.length ? parsed.volumes[parsed.volumes.length - 1]["Ảnh bìa"] : "";
    var firstVolCover = parsed.volumes.length ? parsed.volumes[0]["Ảnh bìa"] : "";
    var firstVolPrice = parsed.volumes.length ? parsed.volumes[0]["Giá bìa"] : "";

    result.push({
      id: name,
      title: m["Tên bộ"] || name,
      genre: m["Thể loại"] || "",
      author: m["Tác giả"] || "",
      demographic: m["Đối tượng độc giả"] || "",
      publisherVN: m["Nhà xuất bản 🇻🇳"] || "",
      yearVN: m["Năm xuất bản 🇻🇳"] || "",
      statusVN: m["Trạng thái xuất bản 🇻🇳"] || "",
      totalVolumes: m["Tổng số tập"] || String(parsed.volumes.length || ""),
      price: m["Giá bìa"] || firstVolPrice || "",
      link: m["Link mua"] || m["Link"] || m["Trang bán"] || "",
      cover: m["Ảnh đại diện"] || lastVolCover || firstVolCover || "",
    });
  });

  return result;
}

function getSeriesDetail(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return { error: "Không tìm thấy tab '" + name + "'" };
  var parsed = parseSeriesSheet(sheet);
  return {
    id: parsed.id,
    meta: parsed.meta,
    volumes: parsed.volumes,
  };
}
