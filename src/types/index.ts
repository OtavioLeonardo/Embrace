/**
 * 图片元数据类型定义
 */
export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  format?: string;
  title: string;
  year: string;
  location: string;
  desc: string;
  specs: ImageSpecs;
}

/**
 * 相机参数规格
 */
export interface ImageSpecs {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
}

/**
 * 客户端需要的精简图片数据
 */
export interface ClientImageData {
  src: string;
  title: string;
  year: string;
  location: string;
  desc: string;
  specs: ImageSpecs;
  thumbnail?: { src: string; width?: number; height?: number; format?: string };
}

/**
 * 相册合集信息
 */
export interface CollectionGroup {
  count: number;
  cover: string;
  images: string[];
  external: string;
  internal: string;
}

/**
 * 文件夹元数据
 */
export interface FolderMeta {
  external: string;
  internal: string;
}

/**
 * 导航链接配置
 */
export interface NavLink {
  href: string;
  label: string;
  isActive?: boolean;
}

/**
 * 页面信息
 */
export interface PageInfo {
  title: string;
  description: string;
  image?: {
    src: string;
    alt: string;
  };
}

/**
 * 灯箱配置选项
 */
export interface LightboxOptions {
  showInfoTrigger?: boolean;
  showProgress?: boolean;
  enableKeyboard?: boolean;
  enableSwipe?: boolean;
  animationDuration?: number;
}

/**
 * 构建选项
 */
export interface BuildOptions {
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * 响应式图片配置
 */
export interface ResponsiveImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  class?: string;
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  fill?: 'forwards' | 'backwards' | 'both';
}

/**
 * API 响应类型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 排序选项
 */
export type SortField = 'year' | 'title' | 'camera' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}
