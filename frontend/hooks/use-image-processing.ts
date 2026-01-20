"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { imageApi } from "@/lib/api/endpoints";
import type {
  ImageProcessingOptions,
  ProcessedImageResponse,
  ImageProcessingStatus,
} from "@/lib/api/types";

/**
 * Hook for managing image processing
 * @param imageId - The image ID to process
 * @returns Processing state and process function
 */
export function useImageProcessing(imageId: string | null) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ImageProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResponse | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Poll for processing status
  const pollStatus = useCallback(async (id: string) => {
    try {
      const statusData = await imageApi.getProcessingStatus(id);
      setStatus(statusData.status);
      setProgress(statusData.progress);

      if (statusData.status === "completed") {
        // Stop polling
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
        setProcessing(false);
      } else if (statusData.status === "failed") {
        // Stop polling on failure
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
        setProcessing(false);
        setError(statusData.message || "Processing failed");
      }
    } catch (err) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      setProcessing(false);
      setError(err instanceof Error ? err.message : "Failed to get processing status");
    }
  }, []);

  // Start processing
  const processImage = useCallback(
    async (options: ImageProcessingOptions): Promise<ProcessedImageResponse | null> => {
      if (!imageId) {
        setError("No image selected");
        return null;
      }

      setProcessing(true);
      setProgress(0);
      setError(null);
      setResult(null);
      setStatus("processing");

      try {
        const processedImage = await imageApi.processImage(imageId, options);
        setResult(processedImage);
        setStatus("completed");
        setProgress(100);
        setProcessing(false);
        return processedImage;
      } catch (err) {
        // If the processing is async, start polling
        if (err instanceof Error && err.message.includes("processing")) {
          // Start polling for status
          pollingInterval.current = setInterval(() => {
            pollStatus(imageId);
          }, 1000);
          return null;
        }

        setError(err instanceof Error ? err.message : "Failed to process image");
        setStatus("failed");
        setProcessing(false);
        return null;
      }
    },
    [imageId, pollStatus]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus(null);
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  return {
    processing,
    progress,
    status,
    error,
    result,
    processImage,
    reset,
  };
}
