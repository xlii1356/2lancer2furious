"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { upload } from "@vercel/blob/client";
import { Video } from "./tiptapVideo";
import { useEffect, useRef, useState } from "react";

export type IntelLinkTarget = { name: string; slug: string; category: string; hidden?: boolean };

export function RichTextEditor({
  name,
  defaultValue,
  allowVideo = false,
  linkTargets,
}: {
  name: string;
  defaultValue?: object;
  allowVideo?: boolean;
  linkTargets?: IntelLinkTarget[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const editor = useEditor({
    // StarterKit v3 already includes a Link extension by default — registering
    // @tiptap/extension-link separately here caused a genuine duplicate-extension
    // conflict ("[tiptap warn]: Duplicate extension names found: ['link']"),
    // which is what was actually behind the instability (stuck marks, typing
    // issues). Image isn't bundled by StarterKit, so it still needs adding.
    extensions: allowVideo ? [StarterKit, Image, Video] : [StarterKit, Image],
    content: defaultValue || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (!editor) return;
    const form = editor.view.dom.closest("form");
    if (!form) return;
    const sync = () => {
      const hidden = form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
      if (hidden) hidden.value = JSON.stringify(editor.getJSON());
    };
    form.addEventListener("submit", sync);
    return () => form.removeEventListener("submit", sync);
  }, [editor, name]);

  async function handleImageFile(file: File | undefined) {
    if (!file || !editor) return;
    setImageUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      editor.chain().focus().setImage({ src: blob.url }).run();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      window.alert(`Image upload failed: ${message}`);
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleVideoFile(file: File | undefined) {
    if (!file || !editor) return;
    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      window.alert("Videos must be MP4 or WebM.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      window.alert("That video is over the 50 MB limit. Trim or compress it and try again.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    setVideoProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: "video",
        multipart: true,
        onUploadProgress: ({ percentage }) => setVideoProgress(Math.round(percentage)),
      });
      editor.chain().focus().setVideo(blob.url).run();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      window.alert(`Video upload failed: ${message}`);
    } finally {
      setVideoProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  function insertIntelLink(target: IntelLinkTarget) {
    if (!editor) return;
    const href = `/intel/${target.slug}`;
    const { from, to } = editor.state.selection;
    if (from !== to) editor.chain().focus().setLink({ href }).run();
    else editor.chain().focus().insertContent({ type: "text", text: target.name, marks: [{ type: "link", attrs: { href } }] }).run();
    setPickerOpen(false);
    setQuery("");
  }

  const matches = (linkTargets || []).filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(query.trim().toLowerCase()));

  if (!editor) return null;

  const btn = (active: boolean) =>
    `rounded-none border border-separator px-2 py-1 text-xs font-bold uppercase tracking-wide ${
      active ? "bg-primary text-void" : "bg-void text-text-mid hover:text-white"
    }`;

  const mousedown = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div className="border border-separator bg-void">
      <div className="flex flex-wrap gap-1 border-b border-separator p-2">
        <button type="button" className={btn(editor.isActive("bold"))} onMouseDown={mousedown(() => editor.chain().focus().toggleBold().run())}>Bold</button>
        <button type="button" className={btn(editor.isActive("italic"))} onMouseDown={mousedown(() => editor.chain().focus().toggleItalic().run())}>Italic</button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onMouseDown={mousedown(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>H2</button>
        <button type="button" className={btn(editor.isActive("bulletList"))} onMouseDown={mousedown(() => editor.chain().focus().toggleBulletList().run())}>List</button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onMouseDown={mousedown(() => editor.chain().focus().toggleOrderedList().run())}>1. List</button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onMouseDown={mousedown(() => editor.chain().focus().toggleBlockquote().run())}>Quote</button>
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onMouseDown={mousedown(() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          })}
        >
          Link
        </button>
        {linkTargets && (
          <button type="button" className={btn(pickerOpen)} onMouseDown={mousedown(() => setPickerOpen((o) => !o))}>
            Intel link
          </button>
        )}
        <button type="button" className={btn(false)} disabled={imageUploading} onMouseDown={mousedown(() => fileInputRef.current?.click())}>
          {imageUploading ? "Uploading..." : "Image"}
        </button>
        {allowVideo && (
          <>
            <button type="button" className={btn(false)} disabled={videoProgress !== null} onMouseDown={mousedown(() => videoInputRef.current?.click())}>
              {videoProgress !== null ? `Uploading ${videoProgress}%` : "Video"}
            </button>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => handleVideoFile(e.target.files?.[0])} />
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => handleImageFile(e.target.files?.[0])}
        />
      </div>
      {linkTargets && pickerOpen && (
        <div className="border-b border-separator bg-surface p-2">
          <p className="mb-2 text-xs text-text-mid">Select text first to link it, or just pick an entry to insert its name as a link.</p>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (matches[0]) insertIntelLink(matches[0]);
              }
            }}
            placeholder="Search intel..."
          />
          <div className="mt-2 max-h-48 overflow-y-auto">
            {matches.length ? (
              matches.map((t) => (
                <button key={t.slug} type="button" className="flex w-full items-baseline justify-between gap-3 px-2 py-1.5 text-left text-sm text-text-hi hover:bg-white/5" onMouseDown={mousedown(() => insertIntelLink(t))}>
                  <span>{t.name}</span>
                  <span className="shrink-0 text-xs text-text-mid">{t.category}{t.hidden ? " · hidden" : ""}</span>
                </button>
              ))
            ) : (
              <p className="px-2 py-1.5 text-sm text-text-mid">No matching intel entries.</p>
            )}
          </div>
        </div>
      )}
      <EditorContent editor={editor} className="prose-content min-h-[200px] px-3 py-2 text-text-hi [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none" />
      <input type="hidden" name={name} />
    </div>
  );
}
