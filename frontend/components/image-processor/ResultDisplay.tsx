"use client";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { ImageUploadResponse, ProcessedImageResponse } from "@/lib/api/types";
import { imageApi } from "@/lib/api/endpoints";

interface ResultDisplayProps {
  originalImage: ImageUploadResponse;
  originalImageUrl: string;
  processedImage: ProcessedImageResponse;
  onReset: () => void;
}

export default function ResultDisplay({
  originalImage,
  originalImageUrl,
  processedImage,
  onReset,
}: ResultDisplayProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const downloadUrl = imageApi.getDownloadUrl(processedImage.processed_id);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `compressed_${originalImage.original_name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Before/After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">处理前</h3>
          <div className="rounded-2xl border-0 bg-muted/30 overflow-hidden">
            <img
              src={originalImageUrl}
              alt="Original"
              className="w-full h-auto object-contain max-h-80"
            />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">大小</span>
              <span className="font-medium">{formatFileSize(originalImage.file_size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">分辨率</span>
              <span className="font-medium">
                {originalImage.width} × {originalImage.height}
              </span>
            </div>
          </div>
        </div>

        {/* Processed */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">处理后</h3>
          <div className="rounded-2xl border-0 bg-muted/30 overflow-hidden">
            <img
              src={imageApi.getDownloadUrl(processedImage.processed_id)}
              alt="Processed"
              className="w-full h-auto object-contain max-h-80"
            />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">大小</span>
              <span className="font-medium">{formatFileSize(processedImage.processed_size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">分辨率</span>
              <span className="font-medium">
                {processedImage.processed_width} × {processedImage.processed_height}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">压缩率</span>
              <span className="font-medium text-primary">
                {processedImage.compression_ratio.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="p-6 rounded-2xl border-0 bg-primary/5">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">节省空间</p>
            <p className="text-2xl font-bold text-primary">
              {formatFileSize(originalImage.file_size - processedImage.processed_size)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">压缩率</p>
            <p className="text-2xl font-bold text-primary">
              {processedImage.compression_ratio.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">处理后大小</p>
            <p className="text-2xl font-bold text-primary">
              {formatFileSize(processedImage.processed_size)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleDownload}
          className="flex-1 h-12 rounded-xl border-0 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          <Download className="w-5 h-5 mr-2" />
          下载图片
        </Button>
        <Button
          onClick={onReset}
          variant="secondary"
          className="flex-1 h-12 rounded-xl border-0 bg-secondary hover:bg-secondary/80 font-medium"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          重新处理
        </Button>
      </div>
    </div>
  );
}
