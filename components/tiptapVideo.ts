import { Node as TiptapNode, mergeAttributes } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: { setVideo: (src: string) => ReturnType };
  }
}

// A block that holds one uploaded video (mp4/webm), shown with the browser's own player controls.
export const Video = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "true", playsinline: "true", preload: "metadata", style: "width:100%;max-width:100%" })];
  },
  addCommands() {
    return {
      setVideo: (src: string) => ({ commands }) => commands.insertContent({ type: "video", attrs: { src } }),
    };
  },
});
