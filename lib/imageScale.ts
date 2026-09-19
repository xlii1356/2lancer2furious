export function scaledImageSrc(url: string, minDimension = 512) {
  return `/api/image-scale?url=${encodeURIComponent(url)}&min=${minDimension}`;
}
