"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
  progress?: number;
  disabled?: boolean;
}

export default function ImageUploader({
  onUpload,
  uploading = false,
  progress = 0,
  disabled = false,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        validateAndUpload(files[0]);
      }
    },
    [disabled, uploading]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled || uploading) return;

      const files = e.target.files;
      if (files && files[0]) {
        validateAndUpload(files[0]);
      }
    },
    [disabled, uploading]
  );

  const validateAndUpload = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("只支持 JPEG、PNG 和 GIF 格式的图片");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("文件大小不能超过 10MB");
      return;
    }

    onUpload(file);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border-0 bg-muted/50 transition-all duration-200",
        dragActive && "bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <label
        className={cn(
          "flex flex-col items-center justify-center py-16 px-8 cursor-pointer",
          (disabled || uploading) && "cursor-not-allowed"
        )}
      >
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleChange}
          disabled={disabled || uploading}
        />

        {uploading ? (
          <>
            <div className="w-16 h-16 rounded-full border-0 bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium mb-2">上传中...</p>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border-0 bg-primary/10 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">点击上传或拖拽图片到此处</p>
            <p className="text-sm text-muted-foreground">
              支持 JPEG、PNG、GIF 格式，最大 10MB
            </p>
          </>
        )}
      </label>
    </div>
  );
}
