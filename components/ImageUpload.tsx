"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";

export function ImageUpload({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      setUrl(blob.url);
    } catch {
      setError("Upload failed. Try a smaller image or a different file.");
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
