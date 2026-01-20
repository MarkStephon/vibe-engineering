"use client";

import { ImageUploadResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  image: ImageUploadResponse;
  imageUrl: string;
  className?: string;
}

export default function ImagePreview({ image, imageUrl, className }: ImagePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border-0 bg-muted/30 overflow-hidden">
        <img
          src={imageUrl}
          alt={image.original_name}
          className="w-full h-auto object-contain max-h-96"
        />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">文件名</span>
          <span className="font-medium">{image.original_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">大小</span>
          <span className="font-medium">{formatFileSize(image.file_size)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">分辨率</span>
          <span className="font-medium">
            {image.width} × {image.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">格式</span>
          <span className="font-medium">{image.format}</span>
        </div>
      </div>
    </div>
  );
}
