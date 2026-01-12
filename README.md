# 🌊 ReliefCare Platform

**ReliefCare** là nền tảng hỗ trợ điều phối và quản lý cứu trợ thiên tai (bão lũ, hạn hán, sạt lở…) với mục tiêu **kết nối nhanh – phân bổ đúng – minh bạch dữ liệu** giữa ban điều phối, đội cứu trợ và người dân.

---

## 🚀 Tính năng chính

* 📍 **Bản đồ cứu trợ thời gian thực**

  * Đánh dấu khu vực bị ảnh hưởng
  * Tính khoảng cách & thời gian di chuyển từ trụ sở/đội cứu trợ
  * Gợi ý tuyến đường & phương tiện phù hợp

* 📦 **Quản lý hàng cứu trợ**

  * Theo dõi tồn kho
  * Phiếu nhập / xuất kho
  * Phân bổ vật tư theo khu vực

* 👥 **Quản lý đội cứu trợ**

  * Phân công nhiệm vụ
  * Theo dõi trạng thái hoạt động

* 🔔 **Thông báo & cảnh báo**

  * Gửi thông báo khẩn
  * Cập nhật tình hình cho các bên liên quan

* 📊 **Báo cáo & thống kê**

  * Tổng hợp dữ liệu cứu trợ
  * Minh bạch số lượng & tiến độ

---

## 🧱 Công nghệ sử dụng

### Frontend

* ⚛️ React / React Native
* 🎨 TailwindCSS / Shadcn UI
* 🗺️ Goong Map API

### DevOps

* 🐳 Docker
* 🔁 GitLab CI/CD
* ☁️ VPS Deployment

---

## 📂 Cấu trúc thư mục (tham khảo)

```
reliefCare/
├── frontend/
│   ├── src/
│   └── public/
└── README.md
```

---

## ⚙️ Setup dự án

### 1. Clone repository

```bash
git clone https://github.com/vnthuan01/SEP490_FE_SP25.git
cd SEP490_FE_SP25
npm run dev
```

### 2. Cài đặt dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/reliefcare
JWT_SECRET=your_secret_key
GOONG_API_KEY=your_goong_api_key
```

### 4. Chạy dự án (Dev)

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

---

## 🐳 Chạy bằng Docker

```bash
docker-compose up --build
```

Ứng dụng sẽ chạy tại:

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3000`

---

## 🧠 Định hướng phát triển

* 🤖 AI dự đoán nhu cầu cứu trợ
* 📡 Tích hợp IoT / dữ liệu thời tiết
* 📱 Mobile App cho đội cứu trợ
* 🌍 Hỗ trợ đa ngôn ngữ

---

## 👨‍💻 Tác giả

* **Nguyễn Minh Thuận**
* GitHub: [https://github.com/vnthuan01](https://github.com/vnthuan01)

---

## 📜 Giấy phép

Dự án được phát hành theo giấy phép **MIT License**.

---

> *reliefCare – Công nghệ vì cộng đồng, không ai bị bỏ lại phía sau.* ❤️
