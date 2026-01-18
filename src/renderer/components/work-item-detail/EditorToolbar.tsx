import type { Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const toggleBold = () => {
    (editor.chain().focus() as any).toggleBold().run();
  };

  const toggleItalic = () => {
    (editor.chain().focus() as any).toggleItalic().run();
  };

  const toggleHeading1 = () => {
    (editor.chain().focus() as any).toggleHeading({ level: 1 }).run();
  };

  const toggleHeading2 = () => {
    (editor.chain().focus() as any).toggleHeading({ level: 2 }).run();
  };

  const toggleHeading3 = () => {
    (editor.chain().focus() as any).toggleHeading({ level: 3 }).run();
  };

  const toggleBulletList = () => {
    (editor.chain().focus() as any).toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    (editor.chain().focus() as any).toggleOrderedList().run();
  };

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      (editor.chain().focus().extendMarkRange("link") as any).unsetLink().run();
      return;
    }

    (editor.chain().focus().extendMarkRange("link") as any).setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-alpha/10 bg-gray-50">
      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleBold}
        className={cn(editor.isActive("bold") && "bg-gray-200 text-gray-950")}
        title="Bold"
      >
        <Bold />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleItalic}
        className={cn(editor.isActive("italic") && "bg-gray-200 text-gray-950")}
        title="Italic"
      >
        <Italic />
      </Button>

      <div className="w-px h-6 bg-alpha/10 mx-1" />

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleHeading1}
        className={cn(editor.isActive("heading", { level: 1 }) && "bg-gray-200 text-gray-950")}
        title="Heading 1"
      >
        <Heading1 />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleHeading2}
        className={cn(editor.isActive("heading", { level: 2 }) && "bg-gray-200 text-gray-950")}
        title="Heading 2"
      >
        <Heading2 />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleHeading3}
        className={cn(editor.isActive("heading", { level: 3 }) && "bg-gray-200 text-gray-950")}
        title="Heading 3"
      >
        <Heading3 />
      </Button>

      <div className="w-px h-6 bg-alpha/10 mx-1" />

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleBulletList}
        className={cn(editor.isActive("bulletList") && "bg-gray-200 text-gray-950")}
        title="Bullet List"
      >
        <List />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleOrderedList}
        className={cn(editor.isActive("orderedList") && "bg-gray-200 text-gray-950")}
        title="Numbered List"
      >
        <ListOrdered />
      </Button>

      <div className="w-px h-6 bg-alpha/10 mx-1" />

      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        onClick={toggleLink}
        className={cn(editor.isActive("link") && "bg-gray-200 text-gray-950")}
        title="Link"
      >
        <LinkIcon />
      </Button>
    </div>
  );
}
