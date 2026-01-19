import type { Editor } from "@tiptap/react";
import { Link as LinkIcon, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LinkPopoverProps {
  editor: Editor;
}

export function LinkPopover({ editor }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  // Get current link URL when popover opens
  useEffect(() => {
    if (open) {
      const currentUrl = editor.getAttributes("link").href as string | undefined;
      setUrl(currentUrl || "");
    }
  }, [open, editor]);

  const handleSetLink = () => {
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSetLink();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const isActive = editor.isActive("link");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          className={cn(isActive && "bg-gray-200 text-gray-950")}
          title="Link"
        >
          <LinkIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="link-url" className="text-sm font-medium text-gray-950">
              Link URL
            </label>
            <InputWithIcon
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              iconLeft={<LinkIcon />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSetLink} className="flex-1" disabled={!url.trim()}>
              {isActive ? "Update Link" : "Add Link"}
            </Button>
            {isActive && (
              <Button size="sm" variant="outline" onClick={handleRemoveLink} title="Remove link">
                <Unlink className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
