// ============================================================
// CẤU HÌNH — dán link Web App của Apps Script vào đây
// ============================================================
//
// Cách lấy link:
// 1. Mở Google Sheet > Tiện ích (Extensions) > Apps Script.
// 2. Dán nội dung file Code.gs vào, Save.
// 3. Deploy > New deployment > Web app.
//      Execute as: Me | Who has access: Anyone
// 4. Copy link "Web app URL" (dạng .../exec) và dán vào bên dưới.
//
// Mỗi khi bạn sửa Code.gs, phải Deploy > Manage deployments >
// bấm sửa (bút chì) > Version: New version > Deploy lại thì mới
// áp dụng thay đổi.

const CONFIG = {
  APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",

  SITE_TITLE: "夜読 Yodoku",
  SITE_TAGLINE: "Kệ truyện của riêng bạn — mỗi bộ một nhà, tất cả trong một kệ sách.",

  // Số tập hiển thị mỗi hàng ở trang chi tiết bộ truyện
  VOLUMES_PER_ROW: 5,
};
