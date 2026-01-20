"use client";

import { useState } from "react";
import { ImageSquare } from "lucide-react";
import ImageUploader from "@/components/image-processor/ImageUploader";
import ImagePreview from "@/components/image-processor/ImagePreview";
import ProcessingOptions from "@/components/image-processor/ProcessingOptions";
import ProcessingProgress from "@/components/image-processor/ProcessingProgress";
import ResultDisplay from "@/components/image-processor/ResultDisplay";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useImageProcessing } from "@/hooks/use-image-processing";
import { cn } from "@/lib/utils";

export default function CompressPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const {
    uploading,
    progress: uploadProgress,
    error: uploadError,
    uploadedImage,
    uploadImage,
    reset: resetUpload,
  } = useImageUpload();

  const {
    processing,
    progress: processProgress,
    error: processError,
    result: processedImage,
    processImage,
    reset: resetProcess,
  } = useImageProcessing(uploadedImage?.id || null);

  const handleFileUpload = async (file: File) => {
    // Create data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await uploadImage(file);
  };

  const handleReset = () => {
    resetUpload();
    resetProcess();
    setImageDataUrl(null);
  };

  // Show error if any
  const error = uploadError || processError;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-0 bg-primary/10 mb-4">
            <ImageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">在线图片压缩与调整工具</h1>
          <p className="text-lg text-muted-foreground">
            上传图片进行压缩和尺寸调整，快速优化您的图片
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border-0 bg-red-50 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!uploadedImage ? (
          // Upload Stage
          <div className="max-w-2xl mx-auto">
            <ImageUploader
              onUpload={handleFileUpload}
              uploading={uploading}
              progress={uploadProgress}
            />
          </div>
        ) : processedImage ? (
          // Result Stage
          <div className="max-w-6xl mx-auto">
            <ResultDisplay
              originalImage={uploadedImage}
              originalImageUrl={imageDataUrl || ""}
              processedImage={processedImage}
              onReset={handleReset}
            />
          </div>
        ) : processing ? (
          // Processing Stage
          <div className="max-w-2xl mx-auto">
            <ProcessingProgress progress={processProgress} />
          </div>
        ) : (
          // Options Stage
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Original Image Preview */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">原图预览</h2>
              {imageDataUrl && (
                <ImagePreview
                  image={uploadedImage}
                  imageUrl={imageDataUrl}
                />
              )}
            </div>

            {/* Right: Processing Options */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">处理选项</h2>
              <ProcessingOptions
                originalWidth={uploadedImage.width}
                originalHeight={uploadedImage.height}
                onProcess={processImage}
                processing={processing}
              />
            </div>
          </div>
        )}

        {/* Bottom Action */}
        {uploadedImage && !processedImage && !processing && (
          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              重新上传图片
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
