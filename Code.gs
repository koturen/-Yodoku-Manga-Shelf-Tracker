/**
 * ============================================================
 * Yodoku Manga Tracker — Apps Script Web App API
 * ============================================================
 * Cách dùng:
 * 1. Mở Google Sheet của bạn.
 * 2. Vào Tiện ích (Extensions) > Apps Script.
 * 3. Xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 4. Sửa mảng EXCLUDED_SHEETS bên dưới nếu bạn có tab mẫu/nháp
 *    không muốn hiển thị lên web (mặc định đã loại "Example").
 * 5. Bấm Deploy > New deployment > chọn loại "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy "Web app URL" được cấp, dán vào config.js (APPS_SCRIPT_URL).
 *
 * Mỗi lần bạn sửa code này, nhớ Deploy > Manage deployments >
 * bấm nút sửa (bút chì) > Version: New version > Deploy lại,
 * nếu không thay đổi sẽ không được áp dụng.
 * ============================================================
 */

// Các tab không phải là bộ truyện thật (tab mẫu, tab nháp...)
var EXCLUDED_SHEETS = ["Example"];

/**
 * Điểm vào chính khi web app nhận GET request.
 * ?action=series           -> danh sách tất cả bộ truyện (cho trang chủ)
 * ?action=detail&name=XXX  -> chi tiết 1 bộ truyện theo tên tab (cho trang chi tiết)
 */
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
 * Đọc 1 sheet (1 tab = 1 bộ truyện).
 * Quét từ trên xuống: mỗi dòng có cột A là nhãn (vd "Tên bộ", "Thể loại",
 * "Tình trạng", "Link mua"...) được coi là metadata (key ở cột A, value ở cột B).
 * Khi gặp dòng có cột A = "Tập", dòng đó là header của bảng tập,
 * các dòng phía dưới là dữ liệu từng tập, map theo tên cột ở header.
 * Cách này giúp bạn thêm/bớt dòng metadata (vd thêm "Link mua") mà
 * không cần sửa code.
 */
function parseSeriesSheet(sheet) {
  var data = sheet.getDataRange().getDisplayValues(); // displayValues để lấy text đã format (vd giá tiền)
  var rawData = sheet.getDataRange().getValues();
  var meta = {};
  var tableStartRow = -1;
  var headers = [];

  for (var i = 0; i < data.length; i++) {
    var label = String(data[i][0] || "").trim();
    if (label === "Tập") {
      tableStartRow = i;
      headers = data[i].map(function (h) { return String(h || "").trim(); });
      break;
    }
    if (label) {
      meta[label] = String(data[i][1] || "").trim();
    }
  }

  var volumes = [];
  if (tableStartRow > -1) {
    for (var r = tableStartRow + 1; r < data.length; r++) {
      var row = data[r];
      var rawRow = rawData[r];
      if (!row[0]) continue; // bỏ dòng trống

      var vol = {};
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        vol[headers[c]] = row[c];
      }
      // Với ảnh bìa, ưu tiên lấy URL gốc (raw) thay vì text hiển thị,
      // vì cột "Ảnh bìa" thường chứa link ảnh trực tiếp.
      var coverColIndex = headers.indexOf("Ảnh bìa");
      if (coverColIndex > -1) {
        vol["Ảnh bìa"] = String(rawRow[coverColIndex] || "").trim();
      }
      volumes.push(vol);
    }
  }

  return {
    id: sheet.getName(),
    meta: meta,
    volumes: volumes,
  };
}

function getAllSeries(ss) {
  var sheets = ss.getSheets();
  var result = [];

  sheets.forEach(function (sheet) {
    var name = sheet.getName();
    if (EXCLUDED_SHEETS.indexOf(name) > -1) return;

    var parsed = parseSeriesSheet(sheet);
    var firstVolumeCover = parsed.volumes.length > 0 ? parsed.volumes[0]["Ảnh bìa"] : "";

    result.push({
      id: name,
      title: parsed.meta["Tên bộ"] || name,
      genre: parsed.meta["Thể loại"] || "",
      status: parsed.meta["Tình trạng"] || "",
      link: parsed.meta["Link mua"] || parsed.meta["Link"] || parsed.meta["Trang bán"] || "",
      cover: parsed.meta["Ảnh đại diện"] || firstVolumeCover || "",
      volumeCount: parsed.volumes.length,
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
    title: parsed.meta["Tên bộ"] || parsed.id,
    genre: parsed.meta["Thể loại"] || "",
    status: parsed.meta["Tình trạng"] || "",
    link: parsed.meta["Link mua"] || parsed.meta["Link"] || parsed.meta["Trang bán"] || "",
    volumes: parsed.volumes,
  };
}
