// ============================================================
// CẤU HÌNH GOOGLE SHEET — điền link CSV của bạn vào đây
// ============================================================
//
// Cách lấy link:
// 1. Mở Google Sheet của bạn.
// 2. Đảm bảo có 2 tab (sheet con) tên là "Series" và "Chapters"
//    (xem cấu trúc cột mẫu trong README.md).
// 3. Vào File > Share > Publish to web.
// 4. Ở mục "Link", chọn từng sheet con (Series, rồi Chapters),
//    chọn định dạng "Comma-separated values (.csv)", bấm Publish.
// 5. Copy link được tạo ra và dán vào bên dưới.
//
// Link sẽ có dạng:
// https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxx/pub?gid=0&single=true&output=csv

const CONFIG = {
  SERIES_CSV_URL: "PASTE_YOUR_SERIES_SHEET_CSV_LINK_HERE",
  CHAPTERS_CSV_URL: "PASTE_YOUR_CHAPTERS_SHEET_CSV_LINK_HERE",

  // Tên site hiển thị trên trang
  SITE_TITLE: "夜読 Yodoku",
  SITE_TAGLINE: "Kệ truyện của riêng bạn — mỗi bộ một nhà, tất cả trong một kệ sách.",

  // Số chương hiển thị mỗi hàng ở trang chi tiết bộ truyện
  CHAPTERS_PER_ROW: 5,
};
