# Base.org 设计系统规范文档

本文档定义了项目完整的设计系统，严格遵循 **Base.org 官方设计语言**，确保视觉一致性和品牌识别度。

> **🎨 设计哲学**: "极致克制 + 精准爆发" — 90%的面积是干净的灰度/白色空间，只有关键行动点才释放强烈的 Base Blue 能量。

---

## 📋 目录

- [设计哲学](#设计哲学)
- [颜色系统](#颜色系统)
- [排版系统](#排版系统)
- [圆角系统](#圆角系统)
- [阴影系统](#阴影系统)
- [间距系统](#间距系统)
- [按钮规范](#按钮规范)
- [卡片与容器](#卡片与容器)
- [输入框规范](#输入框规范)
- [导航栏规范](#导航栏规范)
- [图标规范](#图标规范)
- [背景规范](#背景规范)
- [动画与过渡](#动画与过渡)
- [响应式设计](#响应式设计)
- [可访问性](#可访问性)
- [检查清单](#检查清单)

---

## 🎯 设计哲学

### 核心原则

1. **节奏胜过彩虹（Rhythm over Rainbow）** - 克制使用颜色，以灰度为主，突出一个强调色
2. **负空间至上** - 大量留白，让内容呼吸
3. **精准爆发** - 关键行动点使用 Base Blue 强调
4. **开放画布** - 简约、实用、可进化

### 视觉节奏

- 90% 灰度/白色空间
- 10% Base Blue 能量释放
- 强调点使用颜色爆发

---

## 🎨 颜色系统

### 核心调色板（Core Palette）

#### Base Blue - 主色

```css
/* 核心锚点色 - 用于信号动作、情感和可访问性 */
--base-blue: #0000ff;           /* RGB: 0, 0, 255 | Pantone: PMS 286 C | CMYK: 100, 72, 0, 0 */
--base-blue-rgb: 0, 0, 255;
```

**使用场景**：
- 主要按钮背景
- 链接文本
- 焦点环/高亮
- 关键行动提示

**注意**：在白色背景上通过 AA 对比度测试。避免在暗背景上直接使用。

#### 灰度渐变（Gray Ramp）

```css
/* 完整灰度系统 */
--gray-0: #ffffff;              /* RGB: 255, 255, 255 - 纯白，主背景 */
--gray-10: #eef0f3;             /* RGB: 238, 240, 243 - 浅灰，洗白效果 */
--gray-15: #dee1e7;             /* RGB: 222, 225, 231 - 分割线、边框 */
--gray-30: #b1b7c3;             /* RGB: 177, 183, 195 - 禁用状态 */
--gray-50: #717886;             /* RGB: 113, 120, 134 - 次要文本 */
--gray-60: #5b616e;             /* RGB: 91, 97, 110 - 辅助文本 */
--gray-80: #32353d;             /* RGB: 50, 53, 61 - 标题文本 */
--gray-100: #0a0b0d;            /* RGB: 10, 11, 13 - 近黑，高对比 */
```

#### 辅助调色板（Secondary Palette）

```css
/* 用于补充元素，如营销或社交内容 */
--cerulean: #3c8aff;            /* RGB: 60, 138, 255 - 温暖蓝、hover 状态 */
--tan: #b8a581;                 /* RGB: 184, 165, 129 - 土色调 */
--tan-light: #d3bc8d;           /* RGB: 211, 188, 141 */
--red: #ee2737;                 /* RGB: 238, 39, 55 - 紧迫/错误 */
--yellow: #ffd12f;              /* RGB: 255, 209, 47 - 警告 */
--yellow-gold: #ffd700;         /* RGB: 255, 215, 0 */
--pink: #fc9bb3;                /* RGB: 252, 155, 179 */
--green: #66c800;               /* RGB: 102, 200, 0 - 成功 */
--green-alt: #5bc500;           /* RGB: 91, 197, 0 */
--lime: #b6f569;                /* RGB: 182, 245, 105 */
--lime-alt: #8edd65;            /* RGB: 142, 221, 101 */
```

**使用规则**：
- 避免超过 3 种鲜艳色
- 总与一种柔和色配对
- 用于关键互动的颜色爆发

### 浅色主题 CSS 变量

```css
:root {
  /* 背景 */
  --background: 0 0% 100%;              /* #ffffff */
  --foreground: 220 10% 4%;             /* #0a0b0d */
  
  /* 卡片/弹出层 */
  --card: 0 0% 100%;                    /* #ffffff */
  --card-foreground: 220 10% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 10% 4%;
  
  /* 主色 - Base Blue */
  --primary: 240 100% 50%;              /* #0000ff */
  --primary-foreground: 0 0% 100%;      /* 白色文本 */
  
  /* 次要色 */
  --secondary: 220 14% 96%;             /* #eef0f3 */
  --secondary-foreground: 220 10% 20%;
  
  /* 静音色 */
  --muted: 220 14% 96%;                 /* #eef0f3 */
  --muted-foreground: 220 9% 46%;       /* #717886 */
  
  /* 强调色 - Cerulean */
  --accent: 214 100% 60%;               /* #3c8aff */
  --accent-foreground: 0 0% 100%;
  
  /* 危险/错误 */
  --destructive: 356 85% 55%;           /* #ee2737 */
  --destructive-foreground: 0 0% 100%;
  
  /* 成功 */
  --success: 90 100% 39%;               /* #66c800 */
  --success-foreground: 0 0% 100%;
  
  /* 警告 */
  --warning: 45 100% 56%;               /* #ffd12f */
  --warning-foreground: 220 10% 4%;
  
  /* 边框/输入框 */
  --border: 220 13% 91%;                /* #dee1e7 */
  --input: 220 13% 91%;
  --ring: 240 100% 50%;                 /* Base Blue 焦点环 */
}
```

### 深色主题 CSS 变量

```css
.dark {
  /* 背景 - 带极浅蓝/紫偏向的近黑 */
  --background: 230 14% 4%;             /* ~#05050a */
  --foreground: 0 0% 98%;               /* 浅色文本 */
  
  /* 卡片/弹出层 */
  --card: 230 12% 8%;                   /* 深灰 */
  --card-foreground: 0 0% 98%;
  --popover: 230 12% 8%;
  --popover-foreground: 0 0% 98%;
  
  /* 主色 - 保持 Base Blue，但用于白色文本 */
  --primary: 0 0% 100%;                 /* 深色模式下按钮用白色 */
  --primary-foreground: 240 100% 50%;   /* Base Blue 文本 */
  
  /* 次要色 */
  --secondary: 230 10% 15%;
  --secondary-foreground: 0 0% 98%;
  
  /* 静音色 */
  --muted: 230 10% 18%;
  --muted-foreground: 220 9% 60%;
  
  /* 强调色 */
  --accent: 214 100% 60%;               /* Cerulean */
  --accent-foreground: 0 0% 100%;
  
  /* 危险/错误 */
  --destructive: 356 85% 55%;
  --destructive-foreground: 0 0% 98%;
  
  /* 成功 */
  --success: 90 100% 39%;
  --success-foreground: 0 0% 100%;
  
  /* 警告 */
  --warning: 45 100% 56%;
  --warning-foreground: 220 10% 4%;
  
  /* 边框/输入框 */
  --border: 230 10% 15%;
  --input: 230 10% 12%;
  --ring: 214 100% 60%;                 /* Cerulean 焦点环 */
}
```

### 渐变规范

```css
/* 英雄区渐变 - 从深蓝到亮蓝 */
--gradient-hero: linear-gradient(135deg, #0000ff 0%, #3c8aff 100%);

/* 放射状渐变背景 */
--gradient-radial: radial-gradient(ellipse at center, rgba(0,0,255,0.05) 0%, transparent 70%);

/* 光晕效果 */
--glow-primary: 0 0 40px rgba(0, 0, 255, 0.3);
--glow-accent: 0 0 40px rgba(60, 138, 255, 0.3);
```

### 颜色使用示例

```tsx
// ✅ 正确：使用语义化颜色
<div className="bg-background text-foreground">
  <Card className="bg-card">
    <Button className="bg-primary text-primary-foreground">提交</Button>
  </Card>
</div>

// ✅ 正确：hover 状态使用 Cerulean
<Button className="bg-primary hover:bg-accent transition-colors">
  行动按钮
</Button>

// ❌ 错误：硬编码颜色值
<div className="bg-[#0000ff]">...</div>

// ❌ 错误：使用非 Base 调色板的颜色
<div className="bg-purple-500">...</div>
```

---

## 🔤 排版系统

### 字体家族

#### 主字体 - Inter (Base Sans 替代)

```css
--font-sans: "Inter", "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**字重**：
- 100 - Thin
- 300 - Light
- 400 - Regular
- 500 - Medium
- 700 - Bold
- 900 - Black

#### 等宽字体 - Roboto Mono (Base Mono 替代)

```css
--font-mono: "Roboto Mono", "Fira Code", "Consolas", monospace;
```

**使用场景**：代码块、元数据、数字、地址

### 排版规模

```css
/* Display - 超大展示标题 */
--text-display-1: 4rem;         /* 64px */
--text-display-2: 3rem;         /* 48px */

/* Heading - 标题 */
--text-h1: 2.5rem;              /* 40px */
--text-h2: 2rem;                /* 32px */
--text-h3: 1.5rem;              /* 24px */
--text-h4: 1.25rem;             /* 20px */

/* Body - 正文 */
--text-body-lg: 1.125rem;       /* 18px */
--text-body: 1rem;              /* 16px */
--text-body-sm: 0.875rem;       /* 14px */

/* Caption - 辅助文本 */
--text-caption: 0.8125rem;      /* 13px */
--text-overline: 0.75rem;       /* 12px */
```

### 字母间距（Tracking）

```css
/* 大标题 - 紧凑 */
--tracking-tighter: -0.03em;    /* -3% */
--tracking-tight: -0.02em;      /* -2% */

/* 正文 - 正常 */
--tracking-normal: 0;           /* 0% */

/* 小文本 - 稍宽 */
--tracking-wide: 0.01em;        /* +1% */
```

### 行高

```css
/* 标题 - 紧凑 */
--leading-none: 1;              /* 100% */
--leading-tight: 1.1;           /* 110% */

/* 正文 - 舒适 */
--leading-normal: 1.4;          /* 140% */
--leading-relaxed: 1.6;         /* 160% */
```

### 排版样式示例

```tsx
// Display 1 - 超大展示标题
<h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
  VIBE <span className="text-primary">SUMMARIZER</span>
</h1>

// Headline - 页面标题
<h2 className="text-4xl font-bold tracking-tight leading-tight">
  页面标题
</h2>

// Subheadline - 子标题
<h3 className="text-2xl font-normal tracking-tight leading-snug text-muted-foreground">
  这是一段子标题描述文字
</h3>

// Body - 正文
<p className="text-base font-normal leading-relaxed">
  正文内容，使用舒适的行高确保阅读体验。
</p>

// Caption - 辅助说明
<span className="text-sm font-light text-muted-foreground">
  辅助说明文字
</span>

// Overline - 大写标签
<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
  分类标签
</span>

// Code/Mono - 代码文本
<code className="font-mono text-sm tabular-nums">
  0x1234...5678
</code>
```

---

## 🔘 圆角系统

### 圆角规模

```css
/* 基于形状令牌的圆角系统 */
--radius-100: 4px;              /* 最小 - 徽章、标签 */
--radius-150: 6px;              /* 小元素 */
--radius-200: 8px;              /* 小按钮 */
--radius-300: 12px;             /* 标准按钮、输入框、小卡片 - 甜点值 */
--radius-400: 16px;             /* 大卡片、模态框 */
--radius-500: 20px;             /* 英雄区容器 */
--radius-600: 24px;             /* 超大卡片 */
--radius-full: 9999px;          /* 完全圆形 - 药丸按钮、头像 */
```

### 圆角应用规范

| 元素类型 | 圆角值 | Tailwind 类 |
|---------|-------|-------------|
| 小徽章/标签 | 4-6px | `rounded` / `rounded-md` |
| 小按钮 | 8px | `rounded-lg` |
| 标准按钮 | 12px | `rounded-xl` |
| 输入框 | 12px | `rounded-xl` |
| 小卡片 | 12px | `rounded-xl` |
| 大卡片 | 16-24px | `rounded-2xl` / `rounded-3xl` |
| 模态框 | 16-24px | `rounded-2xl` / `rounded-3xl` |
| 药丸按钮 | 9999px | `rounded-full` |
| 头像 | 9999px | `rounded-full` |
| 英雄区图片 | 16-24px | `rounded-2xl` / `rounded-3xl` |

### 圆角使用示例

```tsx
// 标准卡片
<Card className="rounded-2xl">

// 大卡片/英雄区容器
<div className="rounded-3xl">

// 药丸按钮
<Button className="rounded-full">

// 输入框
<Input className="rounded-xl">

// 头像
<Avatar className="rounded-full">

// 徽章
<Badge className="rounded-md">
```

---

## 🚫 无阴影设计原则

Base.org 采用**完全无阴影**的设计哲学，通过**背景色差异**和**边框**来创建视觉层次。

### 核心原则

- ❌ **禁止使用阴影** - 不使用任何 `shadow-*` 类
- ✅ **背景色差异** - 使用 `bg-muted`、`bg-secondary` 创建层次
- ✅ **极简边框** - 仅在必要时使用极浅边框 `border border-border`
- ✅ **颜色对比** - 通过颜色对比而非阴影来突出元素

### 视觉层次创建方式

```tsx
// ✅ 正确：通过背景色差异
<Card className="bg-card">  // 白色卡片在白色背景上
<Card className="bg-muted">  // 浅灰卡片创建层次

// ✅ 正确：极浅边框（仅在需要时）
<div className="border-t border-border">  // 分割线

// ❌ 错误：使用阴影
<Card className="shadow-md">
<Button className="shadow-lg">
```

---

## 📐 间距系统

### 间距规模

基于 4px 基单位的间距系统：

```css
--space-0: 0px;
--space-0_5: 2px;               /* 0.5 单位 */
--space-1: 4px;                 /* 1 单位 */
--space-2: 8px;                 /* 2 单位 */
--space-3: 12px;                /* 3 单位 */
--space-4: 16px;                /* 4 单位 */
--space-5: 20px;                /* 5 单位 */
--space-6: 24px;                /* 6 单位 */
--space-8: 32px;                /* 8 单位 */
--space-10: 40px;               /* 10 单位 */
--space-12: 48px;               /* 12 单位 */
--space-16: 64px;               /* 16 单位 */
--space-20: 80px;               /* 20 单位 */
--space-24: 96px;               /* 24 单位 */
```

### 间距应用

```tsx
// 容器内边距
<div className="p-4 md:p-6 lg:p-8">

// 元素间距
<div className="space-y-4 md:space-y-6">

// 网格间距
<div className="grid gap-4 md:gap-6 lg:gap-8">

// 页面区块间距
<section className="py-16 md:py-24">

// 组件内部间距
<Card className="p-6">

// 按钮内边距
<Button className="px-6 py-3">
```

---

## 🔵 按钮规范

### 核心原则：无边框设计

Base.org 的按钮**不使用边框**，通过纯色背景创建视觉层次。

### 按钮类型

#### 主要按钮（Primary）- 无边框

```tsx
<Button className="
  bg-primary text-primary-foreground
  rounded-lg
  h-12 px-6
  font-medium
  hover:bg-primary/90
  active:scale-[0.98]
  transition-all duration-200
">
  主要操作
</Button>
```

**特点**：
- ✅ 无边框 `border-0`
- ✅ Base Blue 背景
- ✅ 悬停时颜色变深 `hover:bg-primary/90`
- ✅ 点击时轻微缩放 `active:scale-[0.98]`

#### 次要按钮（Secondary）- 无边框

```tsx
<Button variant="secondary" className="
  bg-secondary text-secondary-foreground
  rounded-lg
  h-12 px-6
  font-medium
  hover:bg-secondary/80
  transition-colors duration-200
">
  次要操作
</Button>
```

**特点**：
- ✅ 无边框
- ✅ 浅灰背景 `bg-secondary`
- ✅ 悬停时背景变深

#### Ghost 按钮 - 无边框

```tsx
<Button variant="ghost" className="
  rounded-lg
  h-12 px-6
  font-medium
  hover:bg-muted
  transition-colors duration-200
">
  Ghost 按钮
</Button>
```

**特点**：
- ✅ 无边框
- ✅ 透明背景
- ✅ 悬停时显示背景 `hover:bg-muted`

#### 药丸按钮（Pill）- 无边框

```tsx
<Button className="
  bg-primary text-primary-foreground
  rounded-full
  h-12 px-8
  font-medium
  hover:bg-primary/90
  active:scale-[0.98]
  transition-all duration-200
">
  药丸按钮
</Button>
```

**注意**：Base.org 不使用轮廓按钮（outline），所有按钮都是纯色背景。

### 按钮尺寸

```tsx
// 小按钮
<Button size="sm" className="h-9 px-4 text-sm rounded-lg">

// 中按钮（默认）
<Button size="default" className="h-12 px-6 rounded-xl">

// 大按钮
<Button size="lg" className="h-14 px-8 text-lg rounded-xl">
```

### 按钮状态

```tsx
// 悬停状态 - 仅颜色变化，无边框
<Button className="hover:bg-primary/90 transition-colors duration-200">

// 焦点状态 - 无边框无环，仅背景色变化
<Button className="focus:bg-primary/90 focus:outline-none transition-colors duration-200">

// 禁用状态
<Button disabled className="opacity-50 cursor-not-allowed">

// 加载状态
<Button disabled className="relative">
  <Loader2 className="w-4 h-4 animate-spin" />
  <span className="ml-2">加载中...</span>
</Button>
```

**重要规则**：
- ❌ **禁止 hover 边框** - 不使用 `hover:border-*`
- ❌ **禁止 focus 边框/环** - 不使用 `focus:border-*` 或 `focus:ring-*`
- ✅ **仅背景色变化** - `hover:bg-primary/90` 或 `focus:bg-primary/90`
- ✅ **无边框设计** - 所有状态都无边框

---

## 🃏 卡片与容器

### 核心原则：无边框 + 背景色差异

Base.org 的卡片**不使用边框和阴影**，通过背景色差异创建视觉层次。

### 标准卡片 - 无边框

```tsx
<Card className="
  bg-card
  rounded-xl
  hover:bg-muted/50
  transition-colors duration-200
">
  <CardHeader className="p-6">
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    内容
  </CardContent>
</Card>
```

**特点**：
- ✅ 无边框 `border-0`
- ✅ 无阴影
- ✅ 白色背景 `bg-card`
- ✅ 悬停时背景变化 `hover:bg-muted/50`
- ❌ **禁止 hover 边框** - 不使用 `hover:border-*`

### 次要卡片 - 背景色差异

```tsx
<Card className="
  bg-muted
  rounded-xl
  hover:bg-muted/80
  transition-colors duration-200
">
  内容
</Card>
```

**特点**：
- ✅ 使用 `bg-muted` 创建层次
- ✅ 无边框无阴影

### 容器规范

```tsx
// 页面容器
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// 内容容器
<div className="max-w-5xl mx-auto">

// 窄容器（阅读内容）
<div className="max-w-3xl mx-auto">

// 全宽容器
<div className="w-full">
```

### 分割线规范

仅在需要明确分割时使用极浅边框，且**不随 hover 变化**：

```tsx
// ✅ 正确：静态分割线（不随 hover 变化）
<div className="border-t border-border/50">  // 顶部分割
<div className="border-b border-border/50">  // 底部分割

// ❌ 错误：卡片边框
<Card className="border border-border">

// ❌ 错误：hover 边框
<div className="hover:border-primary">
```

---

## ⌨️ 输入框规范

### 核心原则：无边框设计

Base.org 的输入框**不使用边框**，通过背景色变化创建视觉层次。

### 标准输入框 - 无边框

```tsx
<Input className="
  h-12
  rounded-lg
  border-0
  bg-muted
  px-4
  text-base
  placeholder:text-muted-foreground
  focus:bg-background
  focus:outline-none
  transition-all duration-200
" />
```

**特点**：
- ✅ 无边框 `border-0`
- ✅ 默认 `bg-muted` 背景
- ✅ 焦点时 `focus:bg-background` 变白
- ❌ **禁止 hover 边框** - 不使用 `hover:border-*`
- ❌ **禁止 focus 边框/环** - 不使用 `focus:border-*` 或 `focus:ring-*`

### 大尺寸输入框 - 无边框

```tsx
<Input className="
  h-14 md:h-16
  rounded-lg
  border-0
  bg-muted
  px-6
  text-lg
  focus:bg-background
  focus:outline-none
  transition-all duration-200
" />
```

### 搜索输入框 - 无边框

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
  <Input className="
    h-14
    rounded-full
    border-0
    bg-muted
    pl-12 pr-6
    text-base
    focus:bg-background
    focus:outline-none
    transition-all duration-200
  " />
</div>
```

---

## 🧭 导航栏规范

### 桌面导航

```tsx
<nav className="
  fixed top-0 inset-x-0
  h-16
  bg-background/80
  backdrop-blur-xl
  border-b border-border/50
  z-50
">
  <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    {/* Logo */}
    <Logo />
    
    {/* 导航链接 */}
    <nav className="hidden md:flex items-center gap-8">
      <NavLink>产品</NavLink>
      <NavLink>文档</NavLink>
      <NavLink>社区</NavLink>
    </nav>
    
    {/* 操作按钮 */}
    <div className="flex items-center gap-4">
      <Button variant="ghost">登录</Button>
      <Button>开始使用</Button>
    </div>
  </div>
</nav>
```

### 移动端导航

```tsx
// 移动端推荐底部导航栏
<nav className="
  fixed bottom-0 inset-x-0
  h-16
  bg-background/95
  backdrop-blur-xl
  border-t border-border/50
  z-50
  md:hidden
">
  <div className="grid grid-cols-4 h-full">
    <NavItem icon={Home} label="首页" />
    <NavItem icon={Search} label="搜索" />
    <NavItem icon={User} label="我的" />
    <NavItem icon={Settings} label="设置" />
  </div>
</nav>

// 侧边抽屉菜单
<Sheet>
  <SheetContent className="
    w-[80vw] max-w-sm
    bg-background/95
    backdrop-blur-xl
  ">
    {/* 菜单内容 */}
  </SheetContent>
</Sheet>
```

---

## 🎯 图标规范

### 图标样式

- **描边宽度**：2-2.5px
- **风格**：线框风格（outline）
- **拐角**：轻微圆角

### 图标尺寸

```tsx
// 小图标 - 按钮内、辅助
<Icon className="w-4 h-4" />   /* 16px */

// 中图标 - 标准
<Icon className="w-5 h-5" />   /* 20px */

// 大图标 - 强调
<Icon className="w-6 h-6" />   /* 24px */

// 超大图标 - 装饰
<Icon className="w-8 h-8" />   /* 32px */
```

### 图标颜色

```tsx
// 默认
<Icon className="text-foreground" />

// 次要
<Icon className="text-muted-foreground" />

// 主色
<Icon className="text-primary" />

// 交互状态
<Icon className="text-muted-foreground hover:text-foreground transition-colors" />
```

---

## 🌌 背景规范

### 浅色模式背景

```css
/* 纯白主背景 */
background-color: #ffffff;

/* 浅灰次要背景 */
background-color: #eef0f3;

/* 渐变装饰（可选） */
background: linear-gradient(180deg, #ffffff 0%, #eef0f3 100%);
```

### 深色模式背景

```css
/* 带蓝调的近黑 */
background-color: #05050a;  /* 或 #0a0b12 */

/* 玻璃态卡片 */
background: rgba(10, 11, 13, 0.8);
backdrop-filter: blur(20px);
```

### 背景纹理（可选）

```css
/* 极轻微的噪声纹理 */
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}
```

### 背景装饰

```tsx
// 放射状渐变光晕
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

// Base 标志水印
<div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
  <BaseSquare className="w-[600px] h-[600px]" />
</div>
```

---

## ✨ 动画与过渡

### 过渡时间

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### 缓动函数

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### 页面加载动画

```tsx
// 逐行淡入 + 上移
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  <h1 className="delay-0">标题</h1>
  <p className="delay-100">描述</p>
  <Button className="delay-200">按钮</Button>
</div>
```

### 交互动画

```tsx
// 按钮悬停
<Button className="
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-200
">

// 卡片悬停
<Card className="
  hover:shadow-lg
  hover:-translate-y-1
  transition-all duration-200 ease-out
">

// 图片悬停缩放
<div className="overflow-hidden rounded-2xl">
  <img className="
    hover:scale-105
    transition-transform duration-300 ease-out
  " />
</div>
```

### 主题切换

```css
/* 平滑主题切换 */
* {
  transition: background-color 0.4s ease, border-color 0.4s ease;
}
```

### 微交互

```tsx
// 涟漪效果（按钮点击）
<Button className="relative overflow-hidden">
  <span className="absolute inset-0 bg-white/20 scale-0 rounded-full group-active:scale-100 transition-transform duration-300" />
  按钮文本
</Button>

// 外发光（焦点状态）
<Button className="
  focus:shadow-[0_0_0_4px_rgba(0,0,255,0.2)]
  transition-shadow duration-200
">
```

---

## 📱 响应式设计

### 断点系统

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 响应式布局

```tsx
// 网格布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// 弹性布局
<div className="flex flex-col md:flex-row gap-4 md:gap-8">

// 容器宽度
<div className="max-w-sm md:max-w-2xl lg:max-w-5xl mx-auto">

// 间距响应式
<div className="p-4 md:p-6 lg:p-8">

// 字体响应式
<h1 className="text-3xl md:text-5xl lg:text-7xl">
```

### 移动端优化

- 核心动作置于屏幕顶部或中间
- 支持单手操作和拇指触达
- 最小触摸目标 44px
- 汉堡菜单 → 侧滑抽屉
- 底部导航栏用于快速访问

---

## ♿ 可访问性

### 对比度要求

- 所有文本：WCAG AA 标准（≥4.5:1）
- 大文本：≥3:1
- 非文本元素：≥3:1

### 焦点状态

Base.org 的焦点状态通过**背景色变化**而非边框/环来实现：

```tsx
// ✅ 正确：通过背景色变化
<Button className="
  focus:bg-primary/90
  focus:outline-none
  transition-colors duration-200
">

// ✅ 正确：输入框焦点
<Input className="
  bg-muted
  focus:bg-background
  focus:outline-none
  transition-colors duration-200
">

// ❌ 错误：使用焦点环
<Button className="focus:ring-2 focus:ring-primary">

// ❌ 错误：使用焦点边框
<Input className="focus:border-primary">
```

**注意**：虽然移除了视觉焦点指示器，但键盘导航仍然可用。对于需要更强可访问性的场景，可以考虑使用 `focus-visible:bg-primary/90` 仅在键盘焦点时显示。

### 触摸目标

```tsx
// 最小 44px 触摸目标
<Button className="min-h-[44px] min-w-[44px]">

// 图标按钮
<Button size="icon" className="h-11 w-11">
  <Icon className="w-5 h-5" />
</Button>
```

### 减少动画

```tsx
// 尊重用户偏好
<div className="motion-reduce:transition-none motion-reduce:animate-none">
```

---

## ✅ 检查清单

### 视觉风格检查

- [ ] 主色是 Base Blue (#0000ff)，不是其他颜色
- [ ] 灰度使用官方灰度调色板
- [ ] 卡片圆角 16-24px（`rounded-2xl` / `rounded-3xl`）
- [ ] 按钮圆角 12px 或药丸形（`rounded-xl` / `rounded-full`）
- [ ] 阴影克制，使用轻微 y-offset 阴影
- [ ] 边框极浅（opacity 6-10%）
- [ ] 间距基于 4px/8px 基单位

### 排版检查

- [ ] 字体使用 Inter 或 Space Grotesk
- [ ] 大标题 tracking -2% 到 -3%
- [ ] 正文行高 140-160%
- [ ] 代码/数字使用等宽字体

### 交互检查

- [ ] 所有按钮有 hover 状态
- [ ] 悬停过渡 150-300ms
- [ ] 焦点状态清晰可见
- [ ] 触摸目标 ≥44px

### 响应式检查

- [ ] 移动端布局正确
- [ ] 触摸操作友好
- [ ] 导航适配小屏幕

### 可访问性检查

- [ ] 对比度 ≥4.5:1
- [ ] 焦点状态可见
- [ ] 支持减少动画偏好

---

## 📚 参考资源

- [Base.org 官方设计规范](https://base.org)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [WCAG 可访问性指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 更新日志

- **2026-01-09**: 全面更新为完整 Base.org 设计规范
  - 新增完整灰度调色板
  - 新增辅助色系统
  - 更新圆角系统（12px 甜点值）
  - 新增阴影系统详细规范
  - 新增渐变和玻璃态规范
  - 新增动画与过渡详细规范
  - 新增可访问性规范
- **2026-01-08**: 初始 Base.org 风格 - 蓝色主色调

---

**注意**: 本文档是项目的设计圣经，所有 UI 开发必须严格遵循。
