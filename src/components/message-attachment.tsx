import { FileIcon, ExternalLink } from "lucide-react";
import type { Attachment } from "ai";
import { Button } from "ui/button";

interface MessageAttachmentProps {
  attachment: Attachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const isImage = attachment.contentType?.startsWith("image/");
  const fileName = attachment.name || "Unknown file";
  const isBase64 = attachment.url?.startsWith("data:");

  if (isImage) {
    return (
      <div className="relative max-w-xs bg-muted/50 rounded-lg overflow-hidden">
        <img
          src={attachment.url}
          alt={fileName}
          className="w-full h-auto object-cover"
          style={{ maxHeight: "200px" }}
        />
        <div className="p-2">
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        </div>
      </div>
    );
  }

  // For non-image files (documents)
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border max-w-xs">
      <FileIcon className="size-8 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {attachment.contentType || "Document"}
        </p>
      </div>
      {!isBase64 && (
        <Button size="sm" variant="ghost" asChild>
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <ExternalLink className="size-3" />
          </a>
        </Button>
      )}
    </div>
  );
}
