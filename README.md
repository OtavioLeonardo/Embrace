# Embrace 摄影网站开发白皮书

## 一、项目概述

拙石是一个基于 Astro 框架开发的个人摄影作品集网站，以其独特的「粗野主义」设计风格和卓越的图像展示能力著称。项目名称「拙石」源自中国传统文化，象征着朴素、自然的摄影理念。

### 1.1 核心理念

- **极简主义设计**: 采用黑白配色、明显的边框线条、无衬线字体，营造纯粹的照片观赏体验
- **内容优先**: 以照片为核心，文字说明为辅，强调影像本身的表现力
- **响应式体验**: 完美适配桌面端和移动端，提供一致的浏览体验
- **性能优化**: 利用 Astro 的静态生成和图片优化能力，确保快速加载

### 1.2 主要功能模块

| 模块 | 功能描述 |
|------|----------|
| 影集 (Collection) | 按主题分类的照片集，支持前言/后记文字说明 |
| 日常 (Daily) | 零散照片的瀑布流展示，支持时间线视图 |
| 故事 (Stories) | 长篇文章系统，配合封面图片讲述照片背后的故事 |
| 灯箱 (Lightbox) | 全屏图片查看器，支持键盘导航和触摸滑动 |
| EXIF 展示 | 自动读取并显示相机参数（机型、光圈、快门、ISO 等） |

---

## 二、技术架构

### 2.1 技术栈清单

```json
{
  "框架": "Astro 5.13.10",
  "UI框架": "React 19.2.4",
  "样式方案": "Tailwind CSS 4.1.18",
  "编程语言": "TypeScript 5.9.2",
  "图片处理": "Astro Assets (Sharp)",
  "元数据读取": "exifr 7.1.3",
  "Markdown解析": "marked 17.0.1",
  "智能标点": "smartypants 0.2.2",
  "灯箱库": "@fancyapps/ui 6.0.32",
  "平滑滚动": "@studio-freight/lenis 1.0.42",
  "代码规范": "Biome 2.2.4",
  "代码审查": "Husky 9.1.7",
  "样式检查": "Stylelint 16.24.0"
}
```

### 2.2 项目结构

```
Embrace/
├── .astro/                    # Astro 内部生成文件
│   ├── collections/           # 内容集合类型定义
│   ├── content-assets.mjs    # 内容资源清单
│   ├── content-modules.mjs   # 内容模块
│   ├── content.d.ts         # 内容类型声明
│   └── settings.json         # 项目设置
├── .github/                  # GitHub Actions 配置
├── .husky/                   # Git 钩子配置
├── .vscode/                  # VS Code 配置
├── public/                   # 静态公共资源
│   ├── cover.png            # 网站封面图
│   └── favicon.svg          # 网站图标
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Footer.astro     # 页脚组件
│   │   ├── Lightbox.astro   # 灯箱组件
│   │   ├── MobileNavigation.astro  # 移动端导航
│   │   ├── Navigation.astro       # 桌面端导航
│   │   ├── Photo.astro           # 图片展示组件
│   │   ├── PhotoCard.astro       # 照片卡片组件
│   │   └── PhotoModal.jsx        # React 照片弹窗
│   ├── content/             # 内容集合
│   │   ├── config.ts        # 内容集合配置
│   │   └── stories/        # 故事文章 Markdown 文件
│   ├── images/              # 图片资源目录
│   │   ├── 01_咔嚓_KACHA!/   # 影集文件夹（支持中英文命名）
│   │   ├── 02_拥入怀中_Embrace/
│   │   ├── 03_显停定_Develop｜Stop｜Fix/
│   │   ├── *.jpg            # 根目录图片（日常照片）
│   │   ├── intro.md         # 影集前言（可选）
│   │   └── outro.md         # 影集后记（可选）
│   ├── layouts/             # 页面布局
│   │   └── BaseLayout.astro # 基础布局
│   ├── pages/               # 页面路由
│   │   ├── index.astro     # 首页（影集列表）
│   │   ├── daily.astro     # 日常页面
│   │   ├── collection/
│   │   │   └── [collection].astro  # 影集详情页
│   │   └── stories/
│   │       ├── index.astro  # 故事列表页
│   │       └── [slug].astro # 故事详情页
│   ├── styles/              # 样式文件
│   │   ├── base.css        # 基础样式（字体、配色）
│   │   ├── global.css      # 全局样式（Tailwind、动画）
│   │   ├── mobile.css      # 移动端样式
│   │   └── reset.css       # CSS 重置
│   ├── types/              # TypeScript 类型定义
│   │   ├── index.ts        # 主要类型定义
│   │   └── smartypants.d.ts # smartypants 类型声明
│   ├── utils/              # 工具函数
│   │   ├── device.ts       # 设备检测工具
│   │   └── metadata.ts     # 图片元数据提取工具
│   ├── env.d.ts            # 环境变量类型声明
│   └── photoData.js        # 照片数据（备用）
├── astro.config.mjs        # Astro 配置文件
├── biome.jsonc              # Biome 代码规范配置
├── package.json             # 项目依赖配置
├── pnpm-lock.yaml          # pnpm 锁定文件
├── tsconfig.json            # TypeScript 配置
├── stylelint.config.js     # Stylelint 配置
└── vercel.json             # Vercel 部署配置
```

---

## 三、核心功能实现详解

### 3.1 图片资源管理

#### 3.1.1 目录组织规则

```
src/images/
├── 01_咔嚓_KACHA!/
│   ├── DSC07896.jpg        # 照片文件
│   ├── intro.md            # 前言（对外描述）
│   └── outro.md            # 后记（结束语）
├── 02_拥入怀中_Embrace/
│   ├── 01.jpg
│   └── ...
└── *.jpg                   # 根目录照片归入「日常」
```

**命名规范**:
- 文件夹命名格式: `序号_中文名_英文名`（如 `01_咔嚓_KACHA!`）
- 序号用于排序，数字小的排在前面
- 中英文名之间用下划线分隔

#### 3.1.2 前言/后记文件格式

影集的前言（`intro.md`）和后记（`outro.md`）支持特殊的分隔格式：

```markdown
---
对外展示的简短描述，会显示在首页影集列表中
可以包含中文和英文
---

这里是内部展示的内容
仅在影集详情页中显示
支持 Markdown 语法
```

- `---` 之前的内容：对外展示（显示在首页）
- `---` 之后的内容：内部展示（影集详情页）

### 3.2 EXIF 元数据读取

项目使用 `exifr` 库从照片中提取丰富的元数据信息：

```typescript:src/utils/metadata.ts
// 核心读取逻辑
const data = await exifr.parse(buffer, {
  exif: true,
  tiff: true,
  iptc: true,
  xmp: true,
});
```

**支持提取的信息**:
- 拍摄日期 (DateTimeOriginal)
- 相机型号 (Model)
- 镜头型号 (LensModel)
- 光圈值 (FNumber)
- 快门速度 (ExposureTime)
- ISO 感光度 (ISO)
- 地理位置 (City, Country, Sublocation)
- 标题和描述 (title, description)

**编码处理**:
项目内置了复杂的编码修复逻辑，处理中文文件名和 EXIF 文字的乱码问题：

```typescript:src/utils/metadata.ts
function fixEncoding(str: string): string {
  // 处理被错误解读为 Latin1 的 UTF-8 字符串
  if (isAscii) return str;
  try {
    return Buffer.from(str, "binary").toString("utf8");
  } catch (e) {
    return str;
  }
}
```

### 3.3 影集详情页

影集详情页 (`collection/[collection].astro`) 是网站的核心浏览界面，提供两种视图模式：

#### 3.3.1 简要模式 (Brief Mode)
- 图片居中显示
- 底部显示标题和年份
- 适合快速浏览

#### 3.3.2 详情模式 (Detail Mode)
- 左侧图片 + 右侧信息面板
- 显示完整的 EXIF 参数
- 支持关联「故事」文章

#### 3.3.3 键盘快捷键

| 按键 | 功能 |
|------|------|
| `←` / `→` | 上一张 / 下一张 |
| `空格` | 打开/关闭详情面板 |
| `M` | 切换视图模式 |
| `Esc` | 关闭详情面板 |

### 3.4 日常照片页面

日常页面 (`daily.astro`) 提供两种浏览方式：

#### 3.4.1 瀑布流视图 (Masonry View)
- CSS 多列布局实现瀑布流
- 自动根据图片比例排列
- 支持点击打开灯箱

#### 3.4.2 时间线视图 (Timeline View)
- 按年份分组显示
- 交替左右布局
- 适合回顾拍摄历程

### 3.5 故事文章系统

基于 Astro Content Collections 构建的文章系统：

```typescript:src/content/config.ts
const stories = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image(),
      excerpt: z.string().optional(),
      layout: z.enum(["full", "grid", "mixed", "wide"]).default("mixed"),
    }),
});
```

**文章创建流程**:
1. 在 `src/content/stories/` 目录创建 Markdown 文件
2. 添加必要的元数据（title, date, cover）
3. 使用 Markdown 编写正文内容

### 3.6 灯箱组件

自定义灯箱组件 (`Lightbox.astro`) 提供全屏图片浏览体验：

**功能特性**:
- 键盘导航（方向键、Esc）
- 触摸滑动支持
- 图片预加载
- 显示进度指示器
- 展示 EXIF 信息

---

## 四、样式系统

### 4.1 设计语言

项目采用「粗野主义」(Brutalism) 设计风格：

```css:src/styles/base.css
:root {
  /* 核心配色：纸墨风格 */
  --ink-black: #1a1a1a;    /* 墨色 */
  --paper-white: #fdfbf7;  /* 宣纸白 */
  --seal-red: #b93a3a;     /* 印泥红 */
  --grid-line: #e5e5e5;    /* 辅助线 */
}
```

### 4.2 Tailwind CSS v4

使用 Tailwind CSS v4 的最新特性：

```css:src/styles/global.css
@import "tailwindcss";

@layer utilities {
  /* 自定义工具类 */
  .material-symbols-outlined {
    font-family: "Material Symbols Outlined", sans-serif;
  }
  
  .writing-vertical {
    writing-mode: vertical-rl;
  }
}
```

### 4.3 页面转场动画

使用 CSS View Transitions API 实现页面切换动画：

```css:src/styles/global.css
@keyframes fall-exit {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}

::view-transition-old(root) {
  animation: 1s cubic-bezier(0.7, 0, 0.3, 1) both fall-exit;
}
```

---

## 五、开发指南

### 5.1 开发环境搭建

```bash
# 安装 pnpm（项目要求）
npm install -g pnpm

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 5.2 可用脚本

| 脚本 | 功能 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | 运行类型检查和代码规范 |
| `pnpm check:fix` | 自动修复代码规范问题 |
| `pnpm stylelint` | 检查 CSS 样式 |
| `pnpm stylelint:fix` | 自动修复 CSS 问题 |

### 5.3 添加新影集

1. 在 `src/images/` 下创建新文件夹
2. 命名格式: `序号_中文名_英文名`
3. 添加照片文件 (jpg/jpeg/png/webp)
4. （可选）添加 `intro.md` 前言文件

### 5.4 添加新故事

1. 在 `src/content/stories/` 创建 Markdown 文件
2. 添加元数据头部:

```markdown
---
title: "故事标题"
date: 2026-01-01
cover: "../../images/封面图.jpg"
excerpt: "故事简介..."
---

正文内容...
```

---

## 六、部署配置

### 6.1 Vercel 部署

项目已配置 `vercel.json`:

```json
{
  "framework": "astro"
}
```

### 6.2 构建输出

构建后的静态文件位于 `dist/` 目录，可部署到任何静态托管服务。

---

## 七、代码规范

### 7.1 Biome 配置

项目使用 Biome 进行代码规范检查：

```json:biome.jsonc
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### 7.2 Stylelint 配置

样式检查配置使用 Stylelint，确保 CSS 质量。

### 7.3 Git 钩子

项目使用 Husky 配置 Git 钩子：
- `pre-commit`: 自动运行代码检查

---

## 八、性能优化

### 8.1 Astro Assets

使用 Astro 内置的图片优化功能：

```typescript
const thumbnail = await getImage({
  src: imgData,
  format: "webp",
  height: 600,
});
```

### 8.2 预加载策略

影集页面实现了智能图片预加载：

```typescript
// 预加载当前图片前后 3 张
const PRELOAD_RANGE = 3;

function smartPreload(indices, priority) {
  // 高优先级：立即预加载
  // 低优先级：使用 requestIdleCallback
}
```

### 8.3 懒加载

所有图片默认使用懒加载：

```html
<img loading="lazy" ... />
```

---

## 九、扩展开发建议

### 9.1 新功能开发

1. **相册排序**: 可在 `index.astro` 中添加自定义排序逻辑
2. **更多视图模式**: 参照 `daily.astro` 的时间线实现
3. **照片筛选**: 利用现有元数据添加筛选功能

### 9.2 主题定制

修改 `src/styles/base.css` 中的 CSS 变量即可更改配色：

```css
:root {
  --ink-black: #1a1a1a;
  --paper-white: #fdfbf7;
  --seal-red: #b93a3a;
}
```

### 9.3 第三方服务集成

- **评论系统**: 可集成 Giscus 或 utterances
- **分析工具**: 支持 Google Analytics、Vercel Analytics
- **CDN**: 可接入 Cloudflare 加速

---

## 十、常见问题

### Q1: 如何添加照片到日常页面？

将照片直接放入 `src/images/` 根目录即可自动识别。

### Q2: 照片的 EXIF 信息没有正确显示？

确保照片包含 EXIF 数据。某些经过压缩或编辑的照片可能丢失 EXIF 信息。

### Q3: 如何修改网站标题？

修改 `src/layouts/BaseLayout.astro` 中的 `siteName` 变量。

### Q4: 如何禁用暗色模式？

暗黑模式基于系统偏好自动切换。如需强制禁用，可修改 Tailwind 配置。

---

## 附录

### A. TypeScript 类型定义

核心类型定义位于 `src/types/index.ts`：

```typescript
interface ImageMetadata {
  src: string;
  title: string;
  year: string;
  location: string;
  specs: ImageSpecs;
  desc: string;
}

interface ImageSpecs {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
}
```

### B. 组件清单

| 组件 | 文件 | 用途 |
|------|------|------|
| 基础布局 | `BaseLayout.astro` | 所有页面的基础框架 |
| 导航 | `Navigation.astro` | 桌面端导航栏 |
| 移动导航 | `MobileNavigation.astro` | 移动端底部标签栏 |
| 灯箱 | `Lightbox.astro` | 全屏图片查看器 |
| 照片卡片 | `PhotoCard.astro` | 照片展示卡片 |
| 照片组件 | `Photo.astro` | 单一照片展示 |
| React 弹窗 | `PhotoModal.jsx` | React 版照片弹窗 |
| 页脚 | `Footer.astro` | 页面页脚 |

---

**文档版本**: 1.0  
**最后更新**: 2026年3月  
**适用版本**: Embrace (Astro 5.x)
