# Design System - ReliefCoord VN

## 🎨 Bảng Màu Chính (Color Palette)

### 🔵 Màu Thương Hiệu (Primary)

| Tên     | Màu | Hex       | Mục đích                                       |
| ------- | --- | --------- | ---------------------------------------------- |
| Primary | 🔵  | `#137fec` | CTA chính, active tab, button chính, highlight |

### 🌗 Màu Nền (Background)

| Tên              | Light     | Dark      | Dùng cho            |
| ---------------- | --------- | --------- | ------------------- |
| Background       | `#f6f7f8` | `#101922` | Nền tổng app        |
| Surface          | `#ffffff` | `#182430` | Card, table, panel  |
| Header / Sidebar | `#ffffff` | `#111a22` | Thanh điều hướng    |
| Sub-surface      | `#f8fafc` | `#1c2a38` | Table header, hover |

### ⚫ Màu Chữ (Text)

| Mức        | Light     | Dark      | Dùng cho              |
| ---------- | --------- | --------- | --------------------- |
| Text chính | `#0f172a` | `#ffffff` | Title, nội dung chính |
| Text phụ   | `#64748b` | `#92adc9` | Description, label    |
| Text mờ    | `#94a3b8` | `#586e85` | Placeholder, hint     |

### 🚦 Màu Trạng Thái (Status Colors)

#### 🔴 Danger / High Priority

- Ưu tiên cao: `bg-red-500`
- Hết hàng: `bg-red-50` / `text-red-700`
- SOS / cảnh báo: Đỏ

#### 🟠 Warning / Medium

- Ưu tiên trung bình: `bg-orange-500`
- Sắp hết: `bg-yellow-50` / `text-yellow-700`

#### 🔵 Info / Active

- Sẵn sàng: `bg-blue-50` / `text-blue-700`
- Active tab: `border-primary`

#### 🟢 Success

- Lương thực: `bg-green-100` / `text-green-800`
- Hoạt động ổn: Xanh lá

#### 🟣 Category Phụ

- Vật tư: `bg-purple-100` / `text-purple-800`
- Y tế: `bg-red-100` / `text-red-800`

## 🔤 Font & Typography

### ✍️ Font Sử Dụng

```css
font-family: 'Public Sans', 'Noto Sans', sans-serif;
```

| Vai trò            | Font                    |
| ------------------ | ----------------------- |
| Heading            | Public Sans             |
| Body               | Public Sans / Noto Sans |
| Vietnamese support | Noto Sans               |

### 🔠 Size & Weight (Chuẩn Dùng)

| Thành phần    | Size    | Weight          |
| ------------- | ------- | --------------- |
| Page title    | 32–40px | 800–900         |
| Section title | 18–20px | 700             |
| Table header  | 12px    | 700 (uppercase) |
| Body text     | 14–16px | 400–500         |
| Badge         | 12px    | 500             |

### Sử dụng trong Tailwind

```tsx
// Heading
<h1 className="text-3xl md:text-4xl font-black tracking-tight">Title</h1>

// Section title
<h2 className="text-lg md:text-xl font-bold">Section</h2>

// Body text
<p className="text-sm md:text-base font-normal">Content</p>

// Badge
<span className="text-xs font-medium">Badge</span>
```

## 🧩 Icon & Asset

### 🎯 Icon System

**Material Symbols Outlined**

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
```

**Icon style:** Outlined

**Size phổ biến:** 18px – 24px

### Sử dụng Icon

```tsx
// Basic usage
<span className="material-symbols-outlined text-[20px]">map</span>

// With size variants
<span className="material-symbols-outlined text-[18px]">dashboard</span>
<span className="material-symbols-outlined text-[24px]">warning</span>

// With color
<span className="material-symbols-outlined text-[20px] text-primary">navigation</span>
<span className="material-symbols-outlined text-[20px] text-red-500">sos</span>
```

### 🖼️ Hình Ảnh

- Thumbnail vuông: 40x40
- Border radius: `rounded-lg`
- Dùng cho: hàng hóa, kho, vật tư

## 📐 Layout & Component Chuẩn

### 🧱 Layout

| Thành phần        | Quy chuẩn                |
| ----------------- | ------------------------ |
| Sidebar           | `w-sidebar` (256px)      |
| Content max-width | `max-w-content` (1200px) |
| Grid              | Flex + responsive        |
| Dark mode         | `class="dark"`           |

### 🧩 Component Dùng Nhiều

#### ✅ Button

```tsx
// Primary
<button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-900/20">
  Button
</button>

// Secondary
<button className="bg-slate-200 dark:bg-[#233648] text-text-main-light dark:text-text-main-dark px-4 py-2 rounded-lg">
  Button
</button>

// Icon button
<button className="p-2 rounded-lg hover:bg-card-dark transition-colors">
  <span className="material-symbols-outlined text-[20px]">settings</span>
</button>
```

#### ✅ Table

```tsx
// Header nền xám
<thead className="bg-sub-surface-light dark:bg-sub-surface-dark">
  <tr>
    <th className="text-xs font-bold uppercase">Header</th>
  </tr>
</thead>

// Hover row
<tbody>
  <tr className="hover:bg-surface-light/70 dark:hover:bg-surface-dark/80">
    <td>Content</td>
  </tr>
</tbody>
```

#### ✅ Badge / Tag

```tsx
// Rounded-full
<span className="rounded-full flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1">
  <span className="size-2 bg-primary rounded-full"></span>
  <span className="text-xs font-medium">Active</span>
</span>

// Status badge
<span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
  SOS
</span>
```

#### ✅ Search & Filter

```tsx
<div className="flex items-center bg-card-dark rounded-lg h-10 px-3 gap-2 border border-slate-700 focus-within:border-primary">
  <span className="material-symbols-outlined text-slate-400">search</span>
  <input
    className="bg-transparent border-none text-sm text-white placeholder-slate-400 focus:ring-0 w-full"
    placeholder="Tìm kiếm..."
  />
</div>
```

## 🧠 Tinh Thần UI / UX

- ✔ Rõ ràng – hành chính – tin cậy
- ✔ Ưu tiên thông tin quan trọng (priority, status)
- ✔ Dark mode chuẩn dashboard
- ✔ Phù hợp hệ thống quản lý nhà nước / cứu trợ
- ✔ Không màu mè – tập trung vận hành

## 📦 Sử Dụng Trong Code

### Tailwind Classes

```tsx
// Background colors
<div className="bg-background-light dark:bg-background-dark">
<div className="bg-surface-light dark:bg-surface-dark">
<div className="bg-header-light dark:bg-header-dark">

// Text colors
<p className="text-text-main-light dark:text-text-main-dark">
<p className="text-text-sub-light dark:text-text-sub-dark">
<p className="text-text-muted-light dark:text-text-muted-dark">

// Layout
<div className="w-sidebar">Sidebar</div>
<div className="max-w-content mx-auto">Content</div>
```

### Theme Provider

ThemeProvider đã được wrap trong `App.tsx`, sử dụng `next-themes` với:

- `attribute="class"` - dùng class để toggle dark mode
- `defaultTheme="light"` - theme mặc định
- `enableSystem` - tự động detect system preference

### Dark Mode Toggle

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</button>
  );
}
```

## 📝 Notes

- Tất cả màu sắc đã được định nghĩa trong `tailwind.config.js`
- Fonts đã được import trong `index.html`
- Material Symbols đã được setup sẵn
- Custom scrollbar đã được config cho dark/light mode
- ThemeProvider đã được wrap trong App component
