# 夜読 Yodoku - Manga Shelf Tracker

Trang web tĩnh (deploy được lên GitHub Pages) để theo dõi nhiều bộ manga/manhwa/manhua nằm rải rác trên nhiều trang đọc khác nhau, tất cả tra cứu ở một trang chủ duy nhất. Dữ liệu lấy trực tiếp từ **Google Sheet** — bạn chỉ cần sửa Sheet, trang sẽ tự cập nhật, không cần code lại.

## Tính năng

- **Trang chủ**: kệ sách với bìa truyện cỡ lớn, tìm kiếm theo tên, lọc theo thể loại.
- **Trang chi tiết mỗi bộ truyện**: danh sách chương hiển thị **5 chương mỗi hàng**, mỗi chương link thẳng ra trang đọc gốc của bộ đó (mỗi bộ truyện có thể ở một site khác nhau).
- Không cần server/backend — 100% tĩnh, chạy tốt trên GitHub Pages.

## 1. Chuẩn bị Google Sheet

Tạo một Google Sheet mới với **2 tab (sheet con)**: `Series` và `Chapters`.

### Tab "Series" — mỗi dòng là một bộ truyện

| Cột | Bắt buộc | Mô tả |
|---|---|---|
| `id` | ✅ | Mã định danh duy nhất, không dấu, không khoảng trắng (vd: `onepiece`) |
| `title` | ✅ | Tên bộ truyện |
| `cover` | | Link ảnh bìa (URL trực tiếp tới file ảnh) |
| `url` | | Link trang đọc gốc của bộ truyện này |
| `genre` | | Thể loại, cách nhau bằng dấu phẩy (vd: `Action,Fantasy`) |
| `status` | | `ongoing` hoặc `completed` |
| `description` | | Mô tả ngắn |

File mẫu: `example-series.csv` (import thẳng vào Google Sheet để có sẵn cấu trúc).

### Tab "Chapters" — mỗi dòng là một chương

| Cột | Bắt buộc | Mô tả |
|---|---|---|
| `series_id` | ✅ | Phải khớp với `id` ở tab Series |
| `number` | ✅ | Số chương (dùng để sắp xếp, mới nhất lên đầu) |
| `title` | | Tên/tiêu đề chương |
| `url` | ✅ | Link đọc chương đó trên site gốc |
| `date` | | Ngày ra chương |

File mẫu: `example-chapters.csv`.

> Mỗi bộ truyện có thể có `url` gốc khác nhau ở tab Series, và mỗi chương trong tab Chapters cũng có link riêng — nên bạn hoàn toàn tự do trỏ mỗi bộ (hoặc mỗi chương) tới một site đọc khác nhau.

## 2. Publish Sheet ra CSV

Với **từng tab** (Series, rồi Chapters):

1. Vào **File → Share → Publish to web**.
2. Ở mục "Link", chọn tab tương ứng (Series hoặc Chapters).
3. Chọn định dạng **Comma-separated values (.csv)**.
4. Bấm **Publish**, xác nhận.
5. Copy link được tạo ra, có dạng:
   `https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxx/pub?gid=123456&single=true&output=csv`

Lặp lại cho tab còn lại (mỗi tab có `gid` khác nhau).

## 3. Cấu hình trang web

Mở file `config.js`, dán 2 link CSV vào:

```js
const CONFIG = {
  SERIES_CSV_URL: "link_csv_cua_tab_Series",
  CHAPTERS_CSV_URL: "link_csv_cua_tab_Chapters",
  SITE_TITLE: "夜読 Yodoku",
  SITE_TAGLINE: "Kệ truyện của riêng bạn...",
  CHAPTERS_PER_ROW: 5,
};
```

## 4. Đưa lên GitHub Pages

```bash
git init
git add .
git commit -m "Manga shelf tracker"
git branch -M main
git remote add origin https://github.com/<ten-ban>/<ten-repo>.git
git push -u origin main
```

Sau đó vào repo trên GitHub: **Settings → Pages → Source: chọn branch `main`, thư mục `/ (root)`** → Save. Trang sẽ chạy tại:

```
https://<ten-ban>.github.io/<ten-repo>/
```

## 5. Cập nhật truyện sau này

Chỉ cần mở Google Sheet, thêm dòng mới vào tab `Series` (bộ truyện mới) hoặc `Chapters` (chương mới) — **không cần sửa code hay push lại gì cả**. Vì sheet đã "Publish to web", trang sẽ tự lấy dữ liệu mới nhất mỗi lần người dùng tải trang.

> Lưu ý: Google Sheet publish thường mất khoảng 1–5 phút để cập nhật cache sau khi bạn sửa dữ liệu.

## Cấu trúc file

```
index.html          → Trang chủ (kệ sách, tìm kiếm, lọc thể loại)
series.html         → Trang chi tiết bộ truyện (chương, 5/hàng)
style.css            → Toàn bộ giao diện
config.js            → Nơi bạn dán link Google Sheet
data.js              → Logic lấy & parse CSV
example-series.csv   → Mẫu cấu trúc tab Series
example-chapters.csv → Mẫu cấu trúc tab Chapters
```
