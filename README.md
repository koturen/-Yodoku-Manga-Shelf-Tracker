# 夜読 Yodoku — Manga Shelf Tracker

Trang web tĩnh (deploy lên GitHub Pages) theo dõi nhiều bộ manga, mỗi bộ là **một tab riêng** trong Google Sheet của bạn. Dữ liệu lấy qua **Google Apps Script Web App** (không dùng CSV publish-to-web vì hay bị cache/lỗi với sheet nhiều tab).

## Cấu trúc sheet của bạn (giữ nguyên, không cần đổi)

Mỗi tab = 1 bộ truyện. Trong mỗi tab:

```
A1: Tên bộ        B1: <tên bộ truyện>
A2: Thể loại       B2: <thể loại, cách nhau dấu phẩy>
A3: Tình trạng     B3: On-going / End
A4: Tập | Trạng thái | Giá bìa | Giá sẵn | Ảnh bìa | Hình hiển thị
A5: Tập 1 | Chưa xuất bản | ... | ... | <link ảnh> | =IMAGE(...)
A6: Tập 2 | ...
...
```

Script đọc theo **nhãn ở cột A**, không theo số dòng cố định — nên bạn có thể thêm dòng metadata mới bất cứ lúc nào (xem mục dưới) mà không sợ vỡ code.

### Thêm link mua (khuyến nghị)

Vì mỗi bộ truyện của bạn có thể mua ở một trang/site khác nhau, thêm 1 dòng metadata mới **trước dòng "Tập"** ở mỗi tab, ví dụ chèn ở A4 (đẩy bảng Tập xuống):

```
A4: Link mua    B4: https://tiki.vn/...-cua-bo-nay
```

Script sẽ tự nhận diện field `Link mua` (hoặc `Link`, `Trang bán`) và hiển thị nút "Mua tại trang gốc" ở trang chi tiết.

> Tab nào không có dòng "Link mua" thì trang chi tiết sẽ đơn giản là không hiện nút mua — không lỗi gì cả.

### Tab không muốn hiển thị

Sửa mảng `EXCLUDED_SHEETS` trong `Code.gs` (mặc định đã loại tab `"Example"`).

## 1. Cài Apps Script

1. Mở Google Sheet > **Tiện ích (Extensions) > Apps Script**.
2. Xoá code mẫu, dán toàn bộ nội dung file `Code.gs` vào.
3. Bấm **Deploy > New deployment**.
4. Chọn loại **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Bấm **Deploy**, cấp quyền khi được hỏi (Authorize access).
6. Copy **Web app URL** (dạng kết thúc bằng `/exec`).

> Mỗi lần bạn sửa `Code.gs` sau này, phải vào **Deploy > Manage deployments** > bấm sửa (icon bút chì) > **Version: New version** > Deploy lại thì thay đổi mới có hiệu lực trên web.

## 2. Cấu hình trang web

Mở `config.js`, dán link Web App vào:

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/xxxxx/exec",
  SITE_TITLE: "夜読 Yodoku",
  SITE_TAGLINE: "...",
  VOLUMES_PER_ROW: 5,
};
```

Kiểm tra nhanh: mở link `APPS_SCRIPT_URL + "?action=series"` thẳng trên trình duyệt, phải thấy JSON danh sách bộ truyện. Nếu lỗi 403/401, kiểm tra lại bước "Who has access: Anyone".

## 3. Đưa lên GitHub Pages

```bash
git init
git add .
git commit -m "Manga shelf tracker (Apps Script backend)"
git branch -M main
git remote add origin https://github.com/<ten-ban>/<ten-repo>.git
git push -u origin main
```

Repo trên GitHub > **Settings > Pages > Source: branch `main`, thư mục `/ (root)`** > Save.

## 4. Cập nhật truyện sau này

Chỉ cần sửa trực tiếp trong Google Sheet (thêm tab mới = thêm bộ truyện mới, thêm dòng = thêm tập mới) — **không cần deploy lại Apps Script**, chỉ deploy lại khi bạn sửa code `Code.gs`. Trang web luôn lấy dữ liệu mới nhất mỗi lần tải lại (không cache như CSV publish).

## Cấu trúc file

```
index.html   → Trang chủ: kệ sách các bộ truyện, tìm kiếm, lọc thể loại
series.html  → Trang chi tiết: ảnh bìa từng tập cỡ lớn, 5 tập/hàng, giá, trạng thái
style.css    → Giao diện "kệ sách ban đêm"
config.js    → Nơi dán link Apps Script Web App
data.js      → Gọi API, chuẩn hoá dữ liệu
Code.gs      → Backend Apps Script, dán vào Google Sheet của bạn
```
