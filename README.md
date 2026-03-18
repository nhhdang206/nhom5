# 🎯 Padoro - Ứng Dụng Học Tập Thông Minh

Website học tập với AI, Pomodoro Timer, và Gamification được xây dựng hoàn toàn bằng HTML, CSS, và JavaScript.

## ✨ Tính Năng

### 🔐 Hệ Thống Xác Thực
- **Đăng ký**: Tạo tài khoản với username và email duy nhất
- **Đăng nhập**: Đăng nhập bằng username hoặc email
- **Quên mật khẩu**: Khôi phục mật khẩu qua mã xác thực (mô phỏng gửi email)
- **Thông báo lỗi rõ ràng**: Hệ thống thông báo chi tiết cho từng trường hợp lỗi

### ⏱️ Pomodoro Timer
- **3 chế độ**: Tập trung, Nghỉ ngắn, Nghỉ dài
- **Tùy chỉnh thời gian**: Điều chỉnh thời gian cho từng chế độ
- **Thông báo**: Thông báo trình duyệt khi hoàn thành
- **Theo dõi tiến độ**: Hiển thị số phiên, phút học, và EXP kiếm được
- **Tự động chuyển**: Tự động chuyển sang nghỉ sau khi hoàn thành phiên tập trung

### 🤖 AI Gemini Pro
- **Gợi ý thời gian**: AI phân tích thói quen và gợi ý thời gian Pomodoro tối ưu
- **Tạo lịch học**: AI tạo lịch học 7 ngày dựa trên yêu cầu của bạn
- **Lưu lịch**: Lưu và xem lại các lịch học đã tạo
- **Cần API Key**: Lấy miễn phí tại [Google AI Studio](https://makersuite.google.com/app/apikey)

### 🎮 Gamification
- **Streak System**: Chuỗi ngày học liên tục (reset nếu bỏ 1 ngày)
- **EXP Points**: Nhận điểm kinh nghiệm khi học (1 EXP/5 phút)
- **Phần thưởng hàng ngày**: Học ≥30 phút/ngày để nhận phần thưởng
- **Milestone Rewards**: Phần thưởng khi đạt 10, 50, 100 phiên học
- **Streak Rewards**: Phần thưởng khi đạt streak 7, 30 ngày

### 🐾 Hệ Thống Thú Cưng
- **Cửa hàng**: Mua thú cưng bằng EXP
- **10 loại thú cưng**: Từ mèo (miễn phí) đến kỳ lân (2000 EXP)
- **Hiển thị động**: Thú cưng nhảy nhót ở góc màn hình
- **Tùy chỉnh**: Ẩn/hiện, kéo thả di chuyển thú cưng

### 🎨 Giao Diện & Hiệu Ứng
- **Màu sắc tập trung**: Tông màu xanh/tím giúp tập trung
- **Hiệu ứng rơi**: Tuyết, hoa, lá, sao rơi (có thể tắt)
- **Glassmorphism**: Hiệu ứng kính mờ hiện đại
- **Animations mượt mà**: Các chuyển động và hiệu ứng mượt mà
- **Responsive**: Hoạt động tốt trên mọi thiết bị

### 🎵 Nhạc Nền
- **4 bài nhạc**: Lo-fi, Piano, Ambient
- **Điều chỉnh âm lượng**: Thanh trượt volume
- **Bật/tắt linh hoạt**: Chọn nhạc hoặc tắt hoàn toàn

### 📊 Báo Cáo Tuần
- **Tự động hiện**: Sau 1 tuần sử dụng
- **Feedback**: Báo cáo tiến độ và thành tích
- **Phần thưởng**: +50 EXP khi hoàn thành báo cáo

## 🚀 Cách Sử Dụng

### Bước 1: Mở Website
1. Mở file `index.html` trong trình duyệt
2. Hoặc sử dụng Live Server trong VS Code

### Bước 2: Đăng Ký Tài Khoản
1. Click "Đăng ký ngay"
2. Nhập username (≥3 ký tự), email, và mật khẩu (≥6 ký tự)
3. Xác nhận mật khẩu và đồng ý điều khoản
4. Click "Đăng ký"

### Bước 3: Đăng Nhập
1. Nhập username hoặc email
2. Nhập mật khẩu
3. Tùy chọn: Check "Ghi nhớ đăng nhập"
4. Click "Đăng nhập"

### Bước 4: Cài Đặt Gemini API Key (Tùy Chọn)
1. Vào [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập với Google Account
3. Click "Create API Key"
4. Copy API key
5. Trong app: Vào **Cài đặt** → Dán API key → Click "Lưu"

### Bước 5: Sử Dụng Pomodoro Timer
1. Vào tab **Pomodoro**
2. Chọn chế độ: Tập trung / Nghỉ ngắn / Nghỉ dài
3. Tùy chỉnh thời gian nếu muốn
4. Click "Bắt đầu"
5. Tập trung học tập! 💪

### Bước 6: Tạo Lịch Học với AI
1. Vào tab **Lịch học**
2. Click "AI tạo lịch"
3. Nhập yêu cầu của bạn, ví dụ:
   ```
   Tôi cần học 3 môn: Toán, Lý, Hóa. 
   Sáng học tốt hơn chiều. 
   Mỗi buổi học 2 tiếng.
   Tôi thích học Toán nhất.
   ```
4. Click "Tạo lịch"
5. AI sẽ tạo lịch 7 ngày chi tiết cho bạn!

### Bước 7: Mua Thú Cưng
1. Học tập để kiếm EXP
2. Vào tab **Cửa hàng**
3. Click vào thú cưng bạn thích
4. Click lại để chọn thú cưng đã mua

### Bước 8: Tùy Chỉnh Giao Diện
- **Hiệu ứng**: Chọn tuyết/hoa/lá/sao rơi (sidebar dưới)
- **Nhạc nền**: Click icon nhạc (góc trên phải)
- **Thú cưng**: Click icon mắt để ẩn/hiện, kéo để di chuyển

## 📁 Cấu Trúc Dự Án

```
padoro/
├── index.html              # Trang đăng nhập
├── register.html           # Trang đăng ký
├── forgot-password.html    # Trang quên mật khẩu
├── app.html                # Ứng dụng chính
├── README.md               # File này
├── public/
│   ├── css/
│   │   ├── main.css        # CSS chung
│   │   ├── auth.css        # CSS trang xác thực
│   │   └── app.css         # CSS ứng dụng chính
│   ├── js/
│   │   ├── storage.js      # Quản lý localStorage
│   │   ├── particles.js    # Hiệu ứng particle nền
│   │   ├── auth.js         # Xác thực người dùng
│   │   ├── effects.js      # Hiệu ứng rơi
│   │   ├── timer.js        # Pomodoro timer
│   │   ├── ai.js           # Tích hợp Gemini AI
│   │   ├── gamification.js # Hệ thống gamification
│   │   └── app.js          # App chính
│   ├── assets/             # Hình ảnh, icons
│   └── music/              # File nhạc (nếu có)
└── data/                   # Dữ liệu (localStorage)
```

## 🔧 Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling với Variables, Flexbox, Grid, Animations
- **JavaScript (Vanilla)**: Logic ứng dụng
- **LocalStorage**: Lưu trữ dữ liệu người dùng
- **Gemini Pro API**: AI assistance
- **Canvas API**: Hiệu ứng visual
- **Web Audio API**: Âm thanh thông báo
- **Notifications API**: Thông báo trình duyệt

## 📝 Lưu Ý

### Dữ Liệu
- Tất cả dữ liệu được lưu trong **LocalStorage** của trình duyệt
- **KHÔNG** xóa dữ liệu trình duyệt nếu muốn giữ tài khoản
- Nên export/backup dữ liệu định kỳ

### Bảo Mật
- Mật khẩu lưu dạng **văn bản thuần** (plain text)
- Đây là **demo app**, không dùng cho production
- Trong ứng dụng thực, cần:
  - Hash mật khẩu (bcrypt, argon2)
  - Sử dụng HTTPS
  - Backend server thật
  - Database an toàn

### API Key
- API Key Gemini được lưu trong LocalStorage
- **KHÔNG** chia sẻ API key với người khác
- API key miễn phí có giới hạn request/ngày
- Lấy API key tại: https://makersuite.google.com/app/apikey

### Trình Duyệt
- Khuyến nghị: Chrome, Edge, Firefox (bản mới nhất)
- Cần bật JavaScript
- Cần cho phép Notifications (để nhận thông báo Pomodoro)

## 🎯 Tips Học Tập Hiệu Quả

1. **Tập trung 100%**: Tắt mọi thứ gây xao nhãng khi timer chạy
2. **Nghỉ đúng cách**: Không xem điện thoại trong giờ nghỉ, hãy đứng dậy đi lại
3. **Giữ streak**: Học ít nhất 30 phút/ngày để giữ chuỗi
4. **Đặt mục tiêu**: Dùng AI để lập lịch học rõ ràng
5. **Feedback tuần**: Báo cáo tiến độ để tự đánh giá và cải thiện

## 🐛 Báo Lỗi & Góp Ý

Nếu gặp lỗi hoặc có ý tưởng cải thiện, vui lòng:
1. Mở DevTools (F12) → Console để xem lỗi
2. Chụp màn hình lỗi
3. Mô tả các bước tái hiện lỗi

## 📜 License

MIT License - Sử dụng tự do cho mục đích học tập và phát triển.

## 🙏 Credits

- **Pomodoro Technique**: Francesco Cirillo
- **AI**: Google Gemini Pro
- **Icons**: Emoji Unicode
- **Fonts**: Google Fonts (Inter)

---

**Chúc bạn học tập hiệu quả! 🚀📚**

Made with ❤️ by Padoro Team
