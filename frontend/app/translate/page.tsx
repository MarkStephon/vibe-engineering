"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { translationApi } from "@/lib/api/endpoints";
import type { TranslateResponse, DualSubtitle } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Translation Page - YouTube Bilingual Translation
 * Implements issues #268 requirements:
 * 1. Respects user-selected target language
 * 2. Displays bilingual subtitles side-by-side
 */
export default function TranslatePage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("zh");
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!youtubeUrl.trim()) {
      setError("请输入 YouTube 链接");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setResult(null);

    try {
      const response = await translationApi.translate({
        youtube_url: youtubeUrl,
        target_language: targetLanguage,
        enable_dual_subtitles: true,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻译失败，请重试");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReset = () => {
    setYoutubeUrl("");
    setTargetLanguage("zh");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Languages className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              YouTube 中英对照翻译
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            输入 YouTube 链接，选择目标语言，获取双语字幕
          </p>
        </div>

        {/* Translation Form */}
        {!result && (
          <Card className="bg-card border-0 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* YouTube URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube 链接</label>
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="h-12 rounded-xl border-0 bg-muted px-4 focus:bg-background focus:outline-none"
                  disabled={isTranslating}
                />
              </div>

              {/* Target Language Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">目标语言</label>
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                  disabled={isTranslating}
                >
                  <SelectTrigger className="h-12 rounded-xl border-0 bg-muted focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0">
                    <SelectItem value="zh">中文 (Chinese)</SelectItem>
                    <SelectItem value="en">English (英文)</SelectItem>
                    <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                    <SelectItem value="ko">한국어 (Korean)</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isTranslating}
                className="w-full h-12 rounded-xl border-0 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    正在翻译...
                  </>
                ) : (
                  <>
                    <Languages className="h-5 w-5 mr-2" />
                    开始翻译
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Translation Result */}
        {result && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">翻译完成</p>
                <p className="text-sm opacity-80">
                  检测到源语言：
                  {result.source_language === "en"
                    ? "英文 (English)"
                    : result.source_language === "zh"
                    ? "中文 (Chinese)"
                    : result.source_language || "未知"}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="rounded-lg border-0 hover:bg-primary/20"
              >
                重新翻译
              </Button>
            </div>

            {/* Dual Subtitles Viewer */}
            {result.dual_subtitles && result.dual_subtitles.length > 0 && (
              <Card className="bg-card border-0 p-6">
                <h2 className="text-2xl font-bold mb-6">中英对照字幕</h2>
                <div className="space-y-4">
                  {result.dual_subtitles.map((subtitle, index) => (
                    <SubtitleRow key={index} subtitle={subtitle} />
                  ))}
                </div>
              </Card>
            )}

            {/* Simple Translation Result */}
            {result.translated_text && !result.dual_subtitles && (
              <Card className="bg-card border-0 p-6">
                <h2 className="text-2xl font-bold mb-4">翻译结果</h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {result.translated_text}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SubtitleRow - Bilingual subtitle display component
 */
function SubtitleRow({ subtitle }: { subtitle: DualSubtitle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      {/* Timestamp */}
      {subtitle.start_time && (
        <div className="flex items-center">
          <span className="text-sm font-mono text-muted-foreground">
            {subtitle.start_time}
          </span>
        </div>
      )}

      {/* Original Text */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">原文</p>
        <p className="text-sm leading-relaxed">{subtitle.original}</p>
      </div>

      {/* Translated Text */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">译文</p>
        <p className="text-sm leading-relaxed text-primary">
          {subtitle.translated}
        </p>
      </div>
    </div>
  );
}
