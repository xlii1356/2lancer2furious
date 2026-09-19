import { NextResponse } from "next/server";
import sharp from "sharp";

const DEFAULT_MIN = 512;
const MAX_MIN = 2048;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("url");
  const minParam = Number(searchParams.get("min"));
  const minDimension = Number.isFinite(minParam) && minParam > 0 ? Math.min(minParam, MAX_MIN) : DEFAULT_MIN;

  if (!src) return NextResponse.json({ error: "Missing url" }, { status: 400 });
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (parsed.protocol !== "https:") return NextResponse.json({ error: "Only https sources are allowed" }, { status: 400 });

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok) return NextResponse.json({ error: "Could not fetch source image" }, { status: 502 });
  const inputBuffer = Buffer.from(await upstream.arrayBuffer());
  const contentType = upstream.headers.get("content-type") || "image/jpeg";

  try {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    if (!width || !height) throw new Error("Could not read image dimensions");

    const smallest = Math.min(width, height);
    let output: Uint8Array = inputBuffer;
    if (smallest < minDimension) {
      const scale = minDimension / smallest;
      output = await image.resize(Math.round(width * scale), Math.round(height * scale)).toBuffer();
    }

    return new NextResponse(new Blob([output as unknown as ArrayBuffer], { type: contentType }), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // If processing fails for any reason (unsupported format, corrupt data, etc.),
    // fall back to serving the original image unchanged rather than erroring out.
    return new NextResponse(new Blob([inputBuffer as unknown as ArrayBuffer], { type: contentType }), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
}
