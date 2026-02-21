import exifr from "exifr";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * 图片元数据类型定义
 */
export interface ImageMetadata {
  src: string;
  title: string;
  year: string;
  location: string;
  specs: {
    camera: string;
    lens: string;
    aperture: string;
    shutter: string;
    iso: string;
  };
  desc: string;
}

/**
 * 客户端需要的数据类型（精简版）
 */
export interface ClientImageData {
  src: string;
  title: string;
  year: string;
  location: string;
  desc: string;
  specs: {
    camera: string;
    lens: string;
    aperture: string;
    shutter: string;
    iso: string;
  };
}

/**
 * 修复编码问题，处理二进制字符串转换为 UTF-8
 * 用于处理被错误解读为 Latin1 的 UTF-8 字符串
 */
function fixEncoding(str: unknown): string {
  if (!str) return "";
  if (typeof str !== "string") return String(str);

  // 如果是纯 ASCII，直接返回
  const isAscii = /^[\x00-\x7F]*$/.test(str);
  if (isAscii) return str;

  // 检查是否已经是有效的 UTF-8 字符串
  // 如果字符串中的字符都是有效的 Unicode 范围，说明它已经是正确的 UTF-8
  // 不需要再做 binary -> utf8 的转换
  const hasValidUnicode = /[\u4e00-\u9fa5]/.test(str) ||  // 中文
                          /[\u3040-\u309f]/.test(str) ||  // 日文 hiragana
                          /[\u30a0-\u30ff]/.test(str) ||  // 日文 katakana
                          /[\uac00-\ud7af]/.test(str);    // 韩文
  if (hasValidUnicode) {
    return str;
  }

  try {
    // 尝试用 binary 编码转换为 UTF-8
    const fixed = Buffer.from(str, "binary").toString("utf8");
    // 检查转换后是否包含有效的非 ASCII 字符
    if (fixed && /[^\x00-\x7F]/.test(fixed)) {
      return fixed;
    }
    return str;
  } catch {
    return str;
  }
}

/**
 * 安全解析 EXIF 字符串，处理各种编码问题
 * @param value 要解析的值
 * @param isFromXmp 是否来自 XMP 字段（XMP 的 value 已经是正确的 UTF-8，不需要 fixEncoding）
 */
function parseExifString(value: unknown, isFromXmp = false): string {
  if (!value) return "";

  let result = "";

  // 处理 exifr 返回的包含 .value 属性的对象（如 { lang: 'x-default', value: '...' }）
  // XMP 格式对象的 value 通常已经是正确的 UTF-8 字符串，不需要额外处理编码
  if (typeof value === "object" && value !== null) {
    if ("value" in value) {
      const v = (value as { value: unknown }).value;
      // XMP value 已经是正确的 UTF-8，直接返回字符串，但需要处理换行符
      if (typeof v === "string") {
        result = v;
      } else {
        return parseExifString(v, true);
      }
    }
    // XMP 格式 { 'x-default': '...' }
    else if ("x-default" in value) result = parseExifString((value as Record<string, unknown>)["x-default"], true);
    else if ("lang" in value) {
      const obj = value as Record<string, unknown>;
      if (obj["x-default"]) result = parseExifString(obj["x-default"], true);
      else if (obj["en"]) result = parseExifString(obj["en"], true);
    }
    else {
      // 其他对象类型直接返回空字符串，避免 [object Object]
      return "";
    }
  }
  // 如果是来自 XMP 的字符串，已经是 UTF-8，不需要 fixEncoding
  else if (typeof value === "string") {
    result = isFromXmp ? value : fixEncoding(value);
  } else if (Buffer.isBuffer(value)) {
    // 尝试多种编码
    const encodings = ["utf-8", "gbk", "gb2312", "iso-8859-1", "latin1"];
    for (const encoding of encodings) {
      try {
        const decoded = new TextDecoder(encoding).decode(value);
        if (decoded && /[\u4e00-\u9fa5]/.test(decoded)) {
          result = decoded.trim();
          break;
        }
      } catch {
        continue;
      }
    }
    // 回退到 binary
    if (!result) result = fixEncoding(value.toString("binary"));
  } else {
    // 其他类型直接返回空字符串
    return "";
  }

  // 保留换行符，将换行符替换为 <br> 标签以便在 HTML 中正确显示
  // 去除首尾空白，但保留中间的换行符，然后替换为 <br>
  // 注意：Astro 会把 \n 转义为 &#xA;，所以直接替换 &#xA;
  result = result.replace(/&#xA;/g, '<br>').trim();

  return result;
}

/**
 * 读取完整的 EXIF 数据
 * IPTC 数据在 JPEG 文件中的位置不一定在文件开头，需要读取整个文件
 * 现代图片文件通常就几 MB，读取整个文件对性能影响不大
 */
async function readExifChunk(filePath: string): Promise<Buffer | null> {
  try {
    // 读取整个文件以确保能读取到 IPTC 数据
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * 从图片文件中提取 EXIF 元数据
 * @param collection 相册文件夹名称
 * @param fileName 图片文件名
 * @param defaultSrc 默认的图片 src（Vite 处理后的路径）
 */
export async function extractImageMetadata(
  collection: string,
  fileName: string,
  defaultSrc: string
): Promise<ImageMetadata> {
  // 默认值
  const meta: ImageMetadata = {
    src: defaultSrc,
    title: decodeURIComponent(fileName).replace(/\.[^/.]+$/, ""),
    year: new Date().getFullYear().toString(),
    location: "",
    specs: {
      camera: "Unknown",
      lens: "Unknown",
      aperture: "--",
      shutter: "--",
      iso: "--",
    },
    desc: "Capturing the fleeting moments.",
  };

  try {
    const realPath = path.join(process.cwd(), "src/images", collection, fileName);

    // 优化：只读取文件头部来解析 EXIF，极大提升性能
    const buffer = await readExifChunk(realPath);
    if (!buffer) return meta;

    // 解析 EXIF - 禁用 translateValues 以获得原始数据，手动处理编码
    const data = await exifr.parse(buffer, {
      exif: true,
      tiff: true,
      iptc: true,
      xmp: true,
      translateValues: false, // 禁用自动翻译，获得原始值
      reviveValues: false, // 禁用日期等值的自动转换
    });

    if (!data) return meta;

    // 解析日期
    if (data.DateTimeOriginal) {
      const date = new Date(data.DateTimeOriginal);
      if (!isNaN(date.getTime())) {
        meta.year = date.getFullYear().toString();
      }
    }

    // 解析标题
    if (data.title) {
      meta.title = parseExifString(data.title);
    } else if (data.ObjectName) {
      meta.title = parseExifString(data.ObjectName);
    }

    // 解析位置信息
    let city = "";
    let country = "";
    let sublocation = ""; // 地址/街道

    if (data.photoshop) {
      if (data.photoshop.City) city = parseExifString(data.photoshop.City);
      if (data.photoshop.Country) country = parseExifString(data.photoshop.Country);
      if (data.photoshop.Sublocation) sublocation = parseExifString(data.photoshop.Sublocation);
      if (data.photoshop.ProvinceState) {
        const province = parseExifString(data.photoshop.ProvinceState);
        if (province && !city) city = province;
      }
    }
    if (!city && data.City) city = parseExifString(data.City);
    if (!country && data.Country) country = parseExifString(data.Country);
    if (!sublocation && data.Sublocation) sublocation = parseExifString(data.Sublocation);
    if (!sublocation && data.SubLocation) sublocation = parseExifString(data.SubLocation);

    const parts: string[] = [];
    if (sublocation) parts.push(sublocation);
    if (city) parts.push(city);
    if (country && country !== "Unknown") parts.push(country);
    meta.location = parts.slice(0, 3).join(", ");

    // 解析描述
    if (data.description) {
      meta.desc = parseExifString(data.description);
    } else if (data.Caption) {
      meta.desc = parseExifString(data.Caption);
    } else if (data.ImageDescription) {
      meta.desc = parseExifString(data.ImageDescription);
    }

    // 解析相机信息
    if (data.Model) {
      const model = parseExifString(data.Model);
      meta.specs.camera = model
        .replace("ILCE-", "Sony ")
        .replace("NIKON", "Nikon ");
    }

    // 解析镜头信息
    if (data.LensModel) {
      meta.specs.lens = parseExifString(data.LensModel);
    }

    // 解析光圈
    if (data.FNumber) {
      meta.specs.aperture = `f/${data.FNumber}`;
    }

    // 解析 ISO
    if (data.ISO) {
      meta.specs.iso = `ISO ${data.ISO}`;
    }

    // 解析快门速度
    if (data.ExposureTime) {
      meta.specs.shutter =
        data.ExposureTime >= 1
          ? `${data.ExposureTime}s`
          : `1/${Math.round(1 / data.ExposureTime)}s`;
    }
  } catch (error) {
    // 静默处理错误，不影响页面渲染
    console.error(`Error extracting EXIF from ${fileName}:`, error);
  }

  return meta;
}

/**
 * 将完整的 ImageMetadata 转换为客户端精简数据
 */
export function toClientData(images: ImageMetadata[]): ClientImageData[] {
  return images.map((img) => ({
    src: img.src,
    title: img.title,
    year: img.year,
    location: img.location,
    desc: img.desc,
    specs: {
      camera: img.specs.camera,
      lens: img.specs.lens,
      aperture: img.specs.aperture,
      shutter: img.specs.shutter,
      iso: img.specs.iso,
    },
  }));
}
