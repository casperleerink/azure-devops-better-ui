import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";

interface DescriptionEditorProps {
  initialHtml: string;
  onSave: (html: string) => void;
  isPending: boolean;
  isSuccess: boolean;
}

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-500 underline hover:text-blue-600",
    },
  }),
];

export function DescriptionEditor({
  initialHtml,
  onSave,
  isPending,
  isSuccess,
}: DescriptionEditorProps) {
  const editor = useEditor({
    extensions,
    content: initialHtml,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none",
          "min-h-[200px] p-4",
          "focus:outline-none",
          "text-alpha",
          // Links
          "[&_a]:text-blue-500 [&_a]:underline [&_a:hover]:text-blue-600 [&_a]:transition-colors",
          // Headings
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-950",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-950",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-950",
          // Lists
          "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4",
          "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4",
          "[&_li]:my-1",
        ),
      },
    },
  });

  // Update editor content when initialHtml changes
  useEffect(() => {
    if (editor && initialHtml !== editor.getHTML()) {
      editor.commands.setContent(initialHtml);
    }
  }, [editor, initialHtml]);

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      onSave(html);
    }
  };

  // Check if content has changed
  const hasChanges = editor ? editor.getHTML() !== initialHtml : false;

  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-100 overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end gap-2 p-4 border-t border-alpha/5 bg-gray-50">
        <SaveIndicator isPending={isPending} isSuccess={isSuccess} />
        <Button onClick={handleSave} disabled={!hasChanges || isPending} size="sm">
          Save Description
        </Button>
      </div>
    </div>
  );
}
