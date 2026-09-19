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

async function upscaleIfNeeded(file: File, minDimension: number): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const smallest = Math.min(img.naturalWidth, img.naturalHeight);
    if (smallest >= minDimension || smallest === 0) return file;
    const scale = minDimension / smallest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, file.type || "image/png", 0.92));
    if (!blob) return file;
    return new File([blob], file.name, { type: file.type || "image/png" });
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

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const toUpload = minDimension ? await upscaleIfNeeded(file, minDimension) : file;
      const blob = await upload(toUpload.name, toUpload, { access: "public", handleUploadUrl: endpoint });
      setUrl(blob.url);
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
      {error && <p className="text-sm text-mission-failure">{error}</p>}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
