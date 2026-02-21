/**
 * 移动端检测工具
 * 用于在服务端和客户端检测设备类型
 */

// 移动端断点 (与 Tailwind 一致)
export const MOBILE_BREAKPOINT = 768; // md

/**
 * 检测是否为移动设备（基于 User-Agent）
 * 此函数用于服务端渲染或客户端初始化
 */
export function isMobileDevice(userAgent?: string): boolean {
  if (typeof window === "undefined") {
    // 服务端：基于 User-Agent
    const ua = userAgent || "";
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(ua);
  }

  // 客户端：基于屏幕宽度和 User-Agent
  const ua = navigator.userAgent;
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // 移动端判定：屏幕小于断点 或者 是移动设备
  return isSmallScreen || isMobileUA;
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * 获取设备类型
 * 返回: 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * 客户端设备检测 - 可用于动态加载组件
 * 返回是否应该显示移动端界面
 */
export function shouldShowMobile(): boolean {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem("embrace_device_preference");
  if (stored === "desktop") return false;
  if (stored === "mobile") return true;

  return isMobileDevice();
}

/**
 * 设置用户偏好
 */
export function setDevicePreference(preference: "auto" | "mobile" | "desktop") {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("embrace_device_preference", preference);
  }
}

/**
 * 监听设备变化并回调
 */
export function onDeviceChange(callback: (isMobile: boolean) => void) {
  if (typeof window === "undefined") return () => {};

  let lastState = shouldShowMobile();

  const check = () => {
    const currentState = shouldShowMobile();
    if (currentState !== lastState) {
      lastState = currentState;
      callback(currentState);
    }
  };

  // 监听 resize 事件
  window.addEventListener("resize", check);

  // 监听 orientationchange 事件
  window.addEventListener("orientationchange", () => {
    setTimeout(check, 100);
  });

  // 返回清理函数
  return () => {
    window.removeEventListener("resize", check);
    window.removeEventListener("orientationchange", check);
  };
}
