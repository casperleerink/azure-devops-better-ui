import { Edit3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BareTextarea } from "@/components/ui/textarea";

interface DescriptionSectionProps {
  description: string;
  isEditing: boolean;
  onDescriptionChange: (description: string) => void;
  onToggleEdit: () => void;
}

export function DescriptionSection({
  description,
  isEditing,
  onDescriptionChange,
  onToggleEdit,
}: DescriptionSectionProps) {
  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-base font-medium">Description</Label>
        <Button variant="ghost" size="sm" onClick={onToggleEdit} className="h-8 px-2">
          {isEditing ? (
            <>
              <Eye className="size-4 mr-1" />
              Preview
            </>
          ) : (
            <>
              <Edit3 className="size-4 mr-1" />
              Edit HTML
            </>
          )}
        </Button>
      </div>
      {isEditing ? (
        <BareTextarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a description (HTML)..."
          className="text-sm min-h-[200px] font-mono text-alpha"
        />
      ) : (
        <div
          className="text-sm text-alpha leading-relaxed [&_a]:text-blue-500 [&_a]:underline [&_a:hover]:text-blue-600 [&_a]:transition-colors [&>div]:mb-2 [&>div:last-child]:mb-0 empty:text-gray-600 empty:before:content-['No_description']"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Rendering trusted Azure DevOps HTML content
          dangerouslySetInnerHTML={{ __html: description || "" }}
        />
      )}
    </div>
  );
}
