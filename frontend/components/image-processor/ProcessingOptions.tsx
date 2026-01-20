"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageProcessingOptions } from "@/lib/api/types";
import { Settings, Image as ImageIcon } from "lucide-react";

interface ProcessingOptionsProps {
  originalWidth: number;
  originalHeight: number;
  onProcess: (options: ImageProcessingOptions) => void;
  processing?: boolean;
}

export default function ProcessingOptions({
  originalWidth,
  originalHeight,
  onProcess,
  processing = false,
}: ProcessingOptionsProps) {
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const aspectRatio = originalWidth / originalHeight;

  // Update dimensions when aspect ratio lock changes
  useEffect(() => {
    if (keepAspectRatio) {
      setHeight(Math.round(width / aspectRatio));
    }
  }, [width, keepAspectRatio, aspectRatio]);

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value) || originalWidth;
    setWidth(newWidth);
    if (keepAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value) || originalHeight;
    setHeight(newHeight);
    if (keepAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleProcess = () => {
    const options: ImageProcessingOptions = {
      compression: {
        quality,
      },
      resize: {
        width,
        height,
        keep_aspect_ratio: keepAspectRatio,
      },
    };
    onProcess(options);
  };

  const resetToOriginal = () => {
    setQuality(80);
    setWidth(originalWidth);
    setHeight(originalHeight);
    setKeepAspectRatio(true);
  };

  return (
    <div className="space-y-6">
      {/* Compression Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">压缩设置</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality" className="text-sm font-medium">
              质量
            </Label>
            <span className="text-sm font-medium text-primary">{quality}%</span>
          </div>
          <Slider
            id="quality"
            min={1}
            max={100}
            step={1}
            value={[quality]}
            onValueChange={(value) => setQuality(value[0])}
            disabled={processing}
            className="py-2"
          />
          <p className="text-xs text-muted-foreground">
            质量越高，文件越大，画质越好
          </p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Resize Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">尺寸调整</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium">
                宽度 (px)
              </Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                disabled={processing}
                className="h-11 rounded-xl border-0 bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">
                高度 (px)
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                disabled={processing || keepAspectRatio}
                className="h-11 rounded-xl border-0 bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border-0 bg-muted/30">
            <Label htmlFor="aspect-ratio" className="text-sm font-medium cursor-pointer">
              保持宽高比
            </Label>
            <Switch
              id="aspect-ratio"
              checked={keepAspectRatio}
              onCheckedChange={setKeepAspectRatio}
              disabled={processing}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleProcess}
          disabled={processing}
          className="w-full h-12 rounded-xl border-0 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          {processing ? "处理中..." : "开始处理"}
        </Button>
        <Button
          onClick={resetToOriginal}
          disabled={processing}
          variant="ghost"
          className="w-full h-12 rounded-xl border-0 hover:bg-muted"
        >
          重置为原始尺寸
        </Button>
      </div>
    </div>
  );
}
