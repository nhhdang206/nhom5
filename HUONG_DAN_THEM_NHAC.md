# 🎵 HƯỚNG DẪN THÊM NHẠC VÀO PADORO

## ✅ Nhạc đã có sẵn trong app:

File nhạc local của anh đã được tích hợp:
- 🎵 "Hôm Nay Tôi Buồn" - L.R ft LVK

## 📁 Cách 1: Thêm nhạc trực tiếp trong app (Dễ nhất!)

1. Vào ứng dụng Padoro (app.html)
2. Click vào **icon nhạc** ở góc trên bên phải
3. Click nút **"📁 Thêm nhạc"**
4. Chọn file nhạc từ máy tính (mp3, wav, ogg,...)
5. Nhạc sẽ tự động thêm vào danh sách!

**Lưu ý:** Nhạc được lưu trong trình duyệt, nếu xóa cache sẽ mất.

---

## 📂 Cách 2: Thêm file nhạc vào thư mục (Permanent)

### Bước 1: Copy file nhạc
1. Mở thư mục: `d:\padoro\public\music\`
2. Copy file nhạc (.mp3) vào đây

### Bước 2: Cập nhật code
1. Mở file: `d:\padoro\public\js\app.js`
2. Tìm dòng: `const localMusicFiles = [`
3. Thêm tên file của anh vào, ví dụ:

```javascript
const localMusicFiles = [
    'Hôm Nay Tôi Buồn L.R ft LVK (A An Bau).mp3',
    'Ten-file-nhac-cua-anh.mp3',  // ← Thêm dòng này
    'File-nhac-khac.mp3'
    // Add more files here as you add them to the folder
];
```

### Bước 3: Lưu và reload
1. Save file `app.js`
2. Refresh trang web (F5)
3. Nhạc mới sẽ xuất hiện trong danh sách!

---

## 🎶 File nhạc được hỗ trợ:

- ✅ MP3 (khuyên dùng)
- ✅ WAV
- ✅ OGG
- ✅ M4A
- ✅ AAC

---

## 💡 Tips:

### Đổi tên hiển thị:
Code sẽ tự động:
- Xóa đuôi `.mp3`
- Xóa nội dung trong ngoặc đơn `(...)`
- Giữ lại phần tên chính

Ví dụ:
- File: `Hôm Nay Tôi Buồn L.R ft LVK (A An Bau).mp3`
- Hiển thị: `Hôm Nay Tôi Buồn L.R ft LVK`

### Tự động phát tiếp:
- Khi hết bài, app tự động chuyển sang bài kế tiếp
- Nhạc được phát loop (lặp lại)

### Điều chỉnh âm lượng:
- Kéo thanh âm lượng trong music controller
- Âm lượng được lưu tự động

---

## ⚠️ Lỗi thường gặp:

**1. Không thấy nhạc trong danh sách?**
- Kiểm tra đã save file `app.js` chưa
- Refresh trang (Ctrl + F5)
- Kiểm tra tên file trong code khớp với tên file thật

**2. Nhạc không phát được?**
- Kiểm tra file nhạc không bị lỗi
- Thử file khác xem có phát được không
- Kiểm tra volume không phải 0

**3. Nhạc upload bị mất?**
- Nhạc upload qua nút "Thêm nhạc" lưu trong LocalStorage
- Clear cache sẽ mất → Dùng Cách 2 để lưu vĩnh viễn

---

## 🎯 Khuyến nghị:

**Cho nhạc quan trọng:**
→ Dùng Cách 2 (thêm vào thư mục)

**Cho nhạc test thử:**
→ Dùng Cách 1 (upload trong app)

---

Chúc anh tận hưởng nhạc khi học tập! 🎧✨
