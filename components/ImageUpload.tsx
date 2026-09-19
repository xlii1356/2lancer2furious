"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function prepareFile(file: File, minDimension?: number): Promise<{ file: File; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const smallest = Math.min(width, height);
    if (!minDimension || smallest >= minDimension || smallest === 0) return { file, width, height };
    const scale = minDimension / smallest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, width, height };
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, file.type || "image/png", 0.92));
    if (!blob) return { file, width, height };
    return { file: new File([blob], file.name, { type: file.type || "image/png" }), width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ImageUpload({
  name,
  defaultValue,
  endpoint = "/api/upload",
  minDimension,
}: {
  name: string;
  defaultValue?: string | null;
  endpoint?: string;
  minDimension?: number;
}) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file: toUpload, width, height } = await prepareFile(file, minDimension);
      const blob = await upload(toUpload.name, toUpload, { access: "public", handleUploadUrl: endpoint });
      setUrl(blob.url);
      setDimensions({ width, height });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Upload failed: ${message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {url && (
        <Image src={url} alt="" width={160} height={160} className="h-40 w-40 border border-separator object-cover" unoptimized />
      )}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-text-mid">Uploading...</p>}
      {dimensions && <p className="text-sm text-text-mid">Uploaded at {dimensions.width} × {dimensions.height}px</p>}
      {error && <p className="text-sm text-mission-failure">{error}</p>}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
