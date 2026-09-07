"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { upload } from "@vercel/blob/client";

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
    // Tiptap's own supported mechanism for keeping toolbar active-states in sync.
    // Avoid rolling a manual onTransaction+forceUpdate pattern here — it can
    // cause render loops if anything during a re-render nudges the editor state.
    shouldRerenderOnTransaction: true,
  });

  // Ensure editor gets proper focus when component mounts
  useEffect(() => {
    if (editor) {
      // Focus the editor on mount to ensure it's ready for input
      editor.commands.focus();
    }
  }, [editor]);

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

  if (!editor) return null;

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
    // Ensure editor is focused before executing the command
    if (editor) {
      // Add a small delay to ensure proper focus handling
      setTimeout(() => {
        editor.commands.focus();
      }, 0);
    }
    fn();
  };

  return (
    <div className="border border-separator bg-void">
      <div className="flex flex-wrap gap-1 border-b border-separator p-2">
        <button 
          type="button" 
          className={btn(editor.isActive("bold"))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleBold().run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          Bold
        </button>
        <button 
          type="button" 
          className={btn(editor.isActive("italic"))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleItalic().run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          Italic
        </button>
        <button 
          type="button" 
          className={btn(editor.isActive("heading", { level: 2 }))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          H2
        </button>
        <button 
          type="button" 
          className={btn(editor.isActive("bulletList"))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleBulletList().run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          List
        </button>
        <button 
          type="button" 
          className={btn(editor.isActive("orderedList"))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleOrderedList().run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          1. List
        </button>
        <button 
          type="button" 
          className={btn(editor.isActive("blockquote"))} 
          onMouseDown={mousedown(() => editor.chain().focus().toggleBlockquote().run())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          Quote
        </button>
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onMouseDown={mousedown(() => {
            const url = window.prompt("URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          })}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
          Link
        </button>
        <button 
          type="button" 
          className={btn(false)} 
          disabled={imageUploading} 
          onMouseDown={mousedown(() => fileInputRef.current?.click())}
          onFocus={(e) => {
            // Prevent the button from stealing focus from the editor
            e.preventDefault();
            if (editor && document.activeElement === e.currentTarget) {
              editor.commands.focus();
            }
          }}
        >
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
      <EditorContent 
        editor={editor} 
        className="prose-content min-h-[200px] px-3 py-2 text-text-hi [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none"
        onClick={() => {
          // Ensure editor gets focus when user clicks on the content area
          if (editor) {
            editor.commands.focus();
          }
        }}
        onMouseDown={(e) => {
          // Ensure editor gets focus when user clicks on the content area
          if (editor && !e.target?.matches('.ProseMirror')) {
            editor.commands.focus();
          }
        }}
      />
      <input type="hidden" name={name} />
    </div>
  );
}