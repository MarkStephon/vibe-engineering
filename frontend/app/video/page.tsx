"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/Sidebar";
import SearchInputGroup from "@/components/SearchInputGroup";
import MetadataCard from "@/components/MetadataCard";
import { youtubeApi } from "@/lib/api/endpoints";
import { YoutubeMetadata } from "@/types/video";
import { toast } from "@/lib/utils/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Video } from "lucide-react";

export default function VideoPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<(YoutubeMetadata & { cached: boolean }) | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await youtubeApi.getVideo(query);
      setVideoData(data);
    } catch (e: any) {
      const msg = e.status === 401 ? "Authorization required. Please authenticate with Google." :
                  e.status === 404 ? "Resource not found" :
                  e.status === 429 ? "API Quota exhausted" :
                  "Failed to fetch data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 lg:p-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
              Video Intelligence
            </h1>
            <p className="text-muted-foreground text-lg">
              Extract structured data directly from YouTube Data API v3.
            </p>
          </div>

          {/* Search Section */}
          <div className="space-y-10">
            <SearchInputGroup
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
              error={!!error}
              placeholder="Enter YouTube video URL or ID"
            />

            {error && (
              <Alert variant="destructive" className="rounded-xl border-0 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <MetadataCard data={videoData} loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
