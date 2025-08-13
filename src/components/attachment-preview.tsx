import { FileIcon, XIcon, Loader } from "lucide-react";
import { Button } from "ui/button";
import type { Attachment } from "ai";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: (attachment: Attachment) => void;
  isUploading?: boolean;
}

export function AttachmentPreview({
  attachment,
  onRemove,
  isUploading = false,
}: AttachmentPreviewProps) {
  const isImage = attachment.contentType?.startsWith("image/");
  const fileName = attachment.name || "Unknown file";

  return (
    <div className="relative flex flex-col gap-2 p-2 border rounded-lg bg-muted/50 max-w-[120px]">
      {/* Preview */}
      <div className="relative aspect-square w-full bg-muted rounded overflow-hidden flex items-center justify-center">
        {isUploading ? (
          <Loader className="size-6 animate-spin text-muted-foreground" />
        ) : isImage && attachment.url ? (
          <img
            src={attachment.url}
            alt={fileName}
            className="size-full object-cover"
            onError={(e) => {
              // Fallback to file icon if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : (
          <FileIcon className="size-6 text-muted-foreground" />
        )}
        {isImage && (
          <FileIcon className="size-6 text-muted-foreground hidden" />
        )}
      </div>

      {/* File name */}
      <div className="text-xs text-center truncate text-muted-foreground">
        {fileName}
      </div>

      {/* Remove button */}
      {onRemove && !isUploading && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 size-6 rounded-full p-0"
          onClick={() => onRemove(attachment)}
        >
          <XIcon className="size-3" />
        </Button>
      )}
    </div>
  );
}
