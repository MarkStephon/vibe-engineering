"use client";

import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/api/types";
import { Youtube, Twitter, Podcast, Trash2 } from "lucide-react";
import { useState } from "react";
import { insightApi } from "@/lib/api/endpoints";
import { toast } from "sonner";

interface InsightItemProps {
  insight: Insight;
  isSelected?: boolean;
  onSelect: (id: number) => void;
  onDelete?: () => void;
}

/**
 * Get source icon based on source type
 */
function getSourceIcon(sourceType: Insight["source_type"]) {
  switch (sourceType) {
    case "youtube":
      return Youtube;
    case "twitter":
      return Twitter;
    case "podcast":
      return Podcast;
    default:
      return Youtube;
  }
}

/**
 * InsightItem Component
 * Displays a single insight item in the Memory Rail with delete functionality
 */
export function InsightItem({
  insight,
  isSelected,
  onSelect,
  onDelete,
}: InsightItemProps) {
  const Icon = getSourceIcon(insight.source_type);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("确定要删除这条记录吗？")) {
      return;
    }

    try {
      setIsDeleting(true);
      await insightApi.deleteInsight(insight.id);
      toast.success("删除成功");
      onDelete?.();
    } catch (error: any) {
      console.error("Failed to delete insight:", error);
      toast.error("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg group",
        "transition-colors duration-200",
        "hover:bg-muted/50",
        isSelected && "bg-muted"
      )}
    >
      {/* 使用 Grid 布局: 图标(16px) | 内容(自适应) | 操作按钮(28px) */}
      <div 
        className="grid items-center px-3 py-2.5"
        style={{ gridTemplateColumns: '16px 1fr 28px' }}
      >
        {/* Source Icon */}
        <Icon className="w-4 h-4 text-muted-foreground" />

        {/* Content - clickable area */}
        <div
          onClick={() => onSelect(insight.id)}
          className="cursor-pointer overflow-hidden px-2"
        >
          <h4 className="text-sm font-medium text-foreground truncate">
            {insight.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {insight.author}
          </p>
        </div>

        {/* Delete button */}
        <div className="flex items-center justify-end gap-1">
          {/* Status indicator */}
          {insight.status === "pending" && (
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          )}
          {insight.status === "processing" && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          {insight.status === "failed" && (
            <div className="w-2 h-2 rounded-full bg-red-500" />
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "p-1 rounded hover:bg-destructive/10",
              "text-muted-foreground hover:text-destructive",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="删除"
            aria-label="删除记录"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
