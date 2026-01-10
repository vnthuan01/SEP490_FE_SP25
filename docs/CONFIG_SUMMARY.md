# Tóm Tắt Cấu Hình Design System

## ✅ Đã Hoàn Thành

### 1. Tailwind CSS Configuration (`tailwind.config.js`)

- ✅ Cập nhật `darkMode: 'class'` để hỗ trợ dark mode
- ✅ Thêm color palette đầy đủ:
  - Primary: `#137fec`
  - Background (light/dark)
  - Surface (light/dark)
  - Header (light/dark)
  - Sub-surface (light/dark)
  - Text colors (main/sub/muted với light/dark variants)
  - Status colors (danger, warning, success, info)
- ✅ Cập nhật font family:
  - `font-display`: Public Sans (cho headings)
  - `font-body`: Noto Sans, Public Sans (cho body text)
- ✅ Thêm custom values:
  - `borderRadius`: DEFAULT, lg, xl, full
  - `maxWidth.content`: 1200px
  - `width.sidebar`: 256px
- ✅ Thêm plugin: `@tailwindcss/forms`

### 2. HTML Configuration (`index.html`)

- ✅ Thêm Google Fonts:
  - Public Sans (weights: 400, 500, 700, 900)
  - Noto Sans (weights: 400, 500, 700)
- ✅ Thêm Material Symbols Outlined
- ✅ Cập nhật lang attribute: `lang="vi"`
- ✅ Cập nhật meta tags cho ReliefCoord VN

### 3. Global Styles (`src/index.css`)

- ✅ Custom scrollbar cho dark theme:
  - Track: `#111418`
  - Thumb: `#283039`
  - Hover: `#3d4955`
- ✅ Custom scrollbar cho light theme
- ✅ Cập nhật body styles:
  - Background colors theo theme
  - Text colors theo theme
  - Font family: Public Sans, Noto Sans
- ✅ Material Symbols base styles

### 4. App Configuration (`src/App.tsx`)

- ✅ Wrap `ThemeProvider` vào App component
- ✅ Đảm bảo theme system hoạt động đúng

### 5. Theme Provider (`src/components/provider/ThemeProvider.tsx`)

- ✅ Đã có sẵn và được config đúng:
  - `attribute="class"` - dùng class để toggle
  - `defaultTheme="light"`
  - `enableSystem` - auto detect system preference

## 📦 Dependencies Đã Cài Đặt

- ✅ `@tailwindcss/forms` - Plugin cho form styling

## 🎯 Cách Sử Dụng

### Sử dụng Colors

```tsx
// Background
<div className="bg-background-light dark:bg-background-dark">
<div className="bg-surface-light dark:bg-surface-dark">

// Text
<p className="text-text-main-light dark:text-text-main-dark">
<p className="text-text-sub-light dark:text-text-sub-dark">

// Primary
<button className="bg-primary text-white">
```

### Sử dụng Fonts

```tsx
// Display font (headings)
<h1 className="font-display text-4xl font-black">

// Body font
<p className="font-body text-base">
```

### Sử dụng Icons

```tsx
<span className="material-symbols-outlined text-[20px]">map</span>
<span className="material-symbols-outlined text-[24px] text-primary">dashboard</span>
```

### Sử dụng Layout

```tsx
// Sidebar width
<aside className="w-sidebar">

// Content max width
<div className="max-w-content mx-auto">
```

### Toggle Dark Mode

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</button>;
}
```

## 📚 Tài Liệu Tham Khảo

Xem file `docs/DESIGN_SYSTEM.md` để biết chi tiết đầy đủ về:

- Color palette
- Typography
- Icons
- Components
- Layout guidelines
- UI/UX principles

## 🔄 Next Steps

1. ✅ Design system đã được config đầy đủ
2. Có thể bắt đầu tạo components theo design system
3. Sử dụng các utility classes đã được định nghĩa
4. Tham khảo `DESIGN_SYSTEM.md` khi cần

## ⚠️ Lưu Ý

- Các CSS linter warnings về `@tailwind`, `@apply`, `@theme` là bình thường - đây là Tailwind directives
- Đảm bảo sử dụng `dark:` prefix cho mọi style cần dark mode
- Luôn test cả light và dark mode khi phát triển
