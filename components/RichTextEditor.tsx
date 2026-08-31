"use client";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: object;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: defaultValue || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
  });

  const state = useEditorState({
    editor,
    selector: (ctx) =>
      ctx.editor
        ? {
            bold: ctx.editor.isActive("bold"),
            italic: ctx.editor.isActive("italic"),
            heading: ctx.editor.isActive("heading", { level: 2 }),
            bulletList: ctx.editor.isActive("bulletList"),
            orderedList: ctx.editor.isActive("orderedList"),
            blockquote: ctx.editor.isActive("blockquote"),
            link: ctx.editor.isActive("link"),
          }
        : null,
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

  if (!editor || !state) return null;

  const btn = (active: boolean) =>
    `rounded-none border border-separator px-2 py-1 text-xs font-bold uppercase tracking-wide ${
      active ? "bg-primary text-void" : "bg-void text-text-mid hover:text-white"
    }`;

  // Toolbar buttons use onMouseDown (not onClick) to run editor commands, with
  // preventDefault to stop the button from stealing focus away from the editor first.
  // Without this, the editor blurs before the click registers, which desyncs the
  // active/inactive toggle state and makes marks like Bold feel "stuck".
  const mousedown = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
  };

  return (
    <div className="border border-separator bg-void">
      <div className="flex flex-wrap gap-1 border-b border-separator p-2">
        <button type="button" className={btn(state.bold)} onMouseDown={mousedown(() => editor.chain().focus().toggleBold().run())}>Bold</button>
        <button type="button" className={btn(state.italic)} onMouseDown={mousedown(() => editor.chain().focus().toggleItalic().run())}>Italic</button>
        <button type="button" className={btn(state.heading)} onMouseDown={mousedown(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>H2</button>
        <button type="button" className={btn(state.bulletList)} onMouseDown={mousedown(() => editor.chain().focus().toggleBulletList().run())}>List</button>
        <button type="button" className={btn(state.orderedList)} onMouseDown={mousedown(() => editor.chain().focus().toggleOrderedList().run())}>1. List</button>
        <button type="button" className={btn(state.blockquote)} onMouseDown={mousedown(() => editor.chain().focus().toggleBlockquote().run())}>Quote</button>
        <button
          type="button"
          className={btn(state.link)}
          onMouseDown={mousedown(() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          })}
        >
          Link
        </button>
        <button type="button" className={btn(false)} disabled={imageUploading} onMouseDown={mousedown(() => fileInputRef.current?.click())}>
          {imageUploading ? "Uploading..." : "Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => handleImageFile(e.target.files?.[0])}
        />
      </div>
      <EditorContent editor={editor} className="prose-content min-h-[200px] px-3 py-2 text-text-hi [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none" />
      <input type="hidden" name={name} />
    </div>
  );
}
