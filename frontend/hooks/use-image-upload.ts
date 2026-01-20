"use client";

import { useState, useCallback } from "react";
import { imageApi } from "@/lib/api/endpoints";
import type { ImageUploadResponse } from "@/lib/api/types";

/**
 * Hook for managing image upload
 * @returns Upload state and upload function
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageUploadResponse | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<ImageUploadResponse | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await imageApi.uploadImage(file);

      clearInterval(progressInterval);
      setProgress(100);
      setUploadedImage(result);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedImage(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedImage,
    uploadImage,
    reset,
  };
}
