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
    heading: { levels: [1, 2, 3] },
  }),
  Link.configure({
    openOnClick: false,
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
          "[&_a]:text-blue-500 [&_a]:underline [&_a:hover]:text-blue-600 [&_a]:transition-colors",
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
