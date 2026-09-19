"use client";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { upload } from "@vercel/blob/client";
import { setAvatarUrl } from "@/app/actions/avatar";

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, cropArea: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export crop"))), "image/jpeg", 0.92);
  });
}

export function AvatarCropper({ imageSrc, userId, onSaved }: { imageSrc: string; userId: string; onSaved?: () => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => setCroppedArea(areaPixels), []);

  async function save() {
    if (!croppedArea) return;
    setSaving(true);
    setError("");
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const uploaded = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      const formData = new FormData();
      formData.set("userId", userId);
      formData.set("avatarUrl", uploaded.url);
      await setAvatarUrl(formData);
      onSaved?.();
    } catch {
      setError("Couldn't crop that image — it may be hosted somewhere that blocks cross-origin use. Try setting a Pilot art override above first (uploaded here), then crop that instead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="relative h-64 w-full border border-separator bg-void">
        <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
      </div>
      <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-3 w-full" />
      {error && <p className="mt-2 text-sm text-mission-failure">{error}</p>}
      <button type="button" onClick={save} disabled={saving} className="mt-3 w-full">
        {saving ? "Saving..." : "Save as avatar"}
      </button>
    </div>
  );
}
