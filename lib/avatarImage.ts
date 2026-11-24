import sharp from "sharp";

const MAX_BYTES = 10 * 1024 * 1024;
const AVATAR_SIZE = 256;

// Only plain https image URLs, and nothing pointing at private or local addresses.
export function isSafeImageUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.includes(":")) return false;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
  return true;
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
  if (!isSafeImageUrl(url)) throw new Error("Unsafe or invalid image URL");
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: "follow" });
  if (!res.ok) throw new Error(`Image request failed (${res.status})`);
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/") || type.includes("svg")) throw new Error("URL is not a supported image");
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) throw new Error("Image is too large");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error("Image is too large");
  return buf;
}

// Square avatar from pilot art. Tall full-body art is cropped toward the top (where the head usually
// is) first, then sharp's "attention" crop picks the most interesting square within that.
export async function makeAvatarBuffer(input: Buffer): Promise<Buffer> {
  const rotated = await sharp(input).rotate().toBuffer();
  const { width = 0, height = 0 } = await sharp(rotated).metadata();
  let pipeline = sharp(rotated);
  if (width && height > width * 1.3) {
    pipeline = pipeline.extract({ left: 0, top: 0, width, height: Math.round(width * 1.3) });
  }
  return pipeline
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 88 })
    .toBuffer();
}
