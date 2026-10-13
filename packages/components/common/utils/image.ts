/**
 * 微信小程序 image 组件支持的常见图片文件后缀
 */
export const WX_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "webp", "gif"];

/**
 * 判断资源路径是否包含微信小程序支持的常见图片文件后缀
 */
export const hasWxImageExtension = (path: string): boolean => {
  const pathname = path.split(/[?#]/)[0];
  const extension = pathname.split(".").pop()?.toLowerCase();

  return !!extension && WX_IMAGE_EXTENSIONS.includes(extension);
};
