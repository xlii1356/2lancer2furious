"use client";
import { useEffect, useRef } from "react";

export function FoundryContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      const hide = () => {
        img.style.display = "none";
        const parent = img.parentElement;
        if (parent && parent.tagName === "P" && parent.childNodes.length <= 1) {
          parent.style.display = "none";
        }
      };
      img.onerror = hide;
      if (img.complete && img.naturalHeight === 0) hide();
    });
  }, [html]);

  return <div ref={ref} className="scan-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
