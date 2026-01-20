"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingProgressProps {
  progress: number;
  message?: string;
}

export default function ProcessingProgress({
  progress,
  message = "正在处理图片...",
}: ProcessingProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 rounded-full border-0 bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <div className="w-full max-w-md space-y-3">
        <p className="text-lg font-medium text-center">{message}</p>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">{progress}%</p>
      </div>
    </div>
  );
}
