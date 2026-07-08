# Yodoku — Manga Tracker (v2, Flat / Light+Dark)

Bản redesign theo phong cách tracker/wiki phẳng (Flat Design), có **Light Mode / Dark Mode**, trang chi tiết bộ truyện gộp 3 phần (thông tin chính → bảng wiki → danh sách Vol.), grid 5 card/hàng, responsive Desktop/Tablet/Mobile.

## 1. Cấu trúc Google Sheet (mới)

Mỗi **tab** = 1 bộ truyện. Các dòng phía trên là **metadata**, đọc theo **từng cặp cột liền nhau** (cột lẻ = nhãn, cột kế bên = giá trị) — một dòng có thể chứa nhiều cặp nhãn/giá trị nằm cạnh nhau:

```
A1:Tên bộ        B1:<...>   C1:Tựa phiên âm      D1:<...>   E1:Dịch giả              F1:<...>
G1:Đối tượng độc giả  H1:<...>   I1:Nhà xuất bản 🇻🇳  J1:<...>   K1:Trạng thái xuất bản 🇻🇳 L1:<...>
M1:Năm xuất bản 🇯🇵   N1:<...>   O1:Loại ấn phẩm       P1:<...>   Q1:Khổ giấy (rộng x cao)  R1:<...>

A2:Thể loại      B2:<...>   C2:Tác giả           D2:<...>   E2:Tổng số tập           F2:<...>
I2:Năm xuất bản 🇻🇳  J2:<...>   K2:Nhà xuất bản 🇯🇵    L2:<...>   M2:Trạng thái xuất bản 🇯🇵 N2:<...>
O2:Định dạng bìa  P2:<...>   Q2:Loại bìa           R2:<...>

A4:Tập  B4:Phụ đề  C4:Phụ đề JP  D4:Chương  E4:Ngày phát hành  F4:Giá bìa  G4:Ảnh bìa
A5:1    ...
```

Script quét từ trên xuống, đọc mọi cặp (nhãn, giá trị) trên mỗi dòng, cho tới khi gặp dòng có cột A = **"Tập"** — dòng đó là header bảng tập, các dòng dưới là dữ liệu từng tập (map theo tên cột, cột nào cũng được, thêm/bớt tuỳ ý).

**Muốn thêm trường mới** (vd "Tựa gốc", "Họa sĩ", "Tên tiếng Anh", "Phiên bản", "Ấn bản"...): chỉ cần thêm 1 cặp cột (nhãn/giá trị) vào bất kỳ dòng metadata nào — trang sẽ tự nhận và hiển thị trong bảng wiki, không cần sửa code. Các nhãn trang web đang nhận diện: xem danh sách trong `data.js` (hàm `buildWikiSections`).

**Link mua** (để hiện nút "Mua tại trang gốc"): thêm cặp `Link mua | <url>` ở bất kỳ đâu trong phần metadata.

## 2. Cài Apps Script

1. Mở Sheet > **Extensions > Apps Script**.
2. Dán toàn bộ `Code.gs` vào (thay code cũ nếu có), Save.
3. **Deploy > New deployment** (hoặc nếu đã deploy trước: **Manage deployments** > sửa > **Version: New version**) > **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy link `.../exec`, dán vào `config.js` → `APPS_SCRIPT_URL`.

Kiểm tra nhanh: mở `<link>?action=series` trên trình duyệt phải thấy JSON.

## 3. Tuỳ chỉnh logo & theme mặc định

Trong `config.js`:

```js
LOGO_TEXT: "Yodoku",              // logo dạng chữ
LOGO_IMAGE_URL: "",               // dán link ảnh logo nếu muốn dùng ảnh thay vì chữ
SITE_TAGLINE: "...",
DEFAULT_THEME: "light",           // "light" hoặc "dark"
```

Người dùng có thể tự đổi Light/Dark bằng nút mặt trời/mặt trăng ở góc phải header — lựa chọn được lưu lại (khi trang được host thật trên GitHub Pages; bản xem trước trong khung chat của Claude có thể không lưu do giới hạn của môi trường xem trước).

## 4. Đưa lên GitHub Pages

```bash
git add .
git commit -m "Redesign v2: flat light/dark, wiki table, volume grid"
git push
```

Repo > **Settings > Pages > Source: branch `main`, `/ (root)`**.

## 5. Cấu trúc file

```
index.html    → Trang chủ: grid series 5/hàng, tìm kiếm, lọc trạng thái có màu, toggle theme
series.html   → Trang chi tiết: hero 2 cột + bảng wiki 3 nhóm + danh sách Vol. 5/3/2 responsive
style.css     → Design system Light/Dark, flat 12px radius
config.js     → Logo, tagline, theme mặc định, link Apps Script
theme.js      → Xử lý chuyển Light/Dark, lưu lựa chọn
data.js       → Gọi API, chuẩn hoá dữ liệu, xây bảng wiki tự động theo nhãn có trong sheet
Code.gs       → Backend Apps Script, đọc sheet theo cặp cột (nhãn, giá trị)
```

## Ghi chú về màu trạng thái

| Trạng thái | Màu |
|---|---|
| Đang xuất bản | Xanh lá |
| Hoàn thành | Xanh dương |
| Tạm dừng | Cam |
| Tạm ngưng | Đỏ |
| Công bố bản quyền | Tím |

Trang chủ lọc theo field **Trạng thái xuất bản 🇻🇳**. Đổi màu/label thì sửa `STATUS_MAP` trong `data.js`.
