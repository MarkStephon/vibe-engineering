"use client";

import React, { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { getNavRoutes, isPathActive } from "@/lib/routes";
import QuotaMonitor from "./QuotaMonitor";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: Dispatch<SetStateAction<string>>;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const pathname = usePathname();
  const useLocalState = activeTab !== undefined && onTabChange !== undefined;

  // 从路由注册表获取导航菜单项
  const menuItems = getNavRoutes();

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen sticky top-0 bg-background border-r border-border/50 p-6">
      <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-sm">V</span>
        </div>
        <span className="font-bold text-lg tracking-tight">VIBE DATA</span>
      </Link>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = useLocalState ? activeTab === item.id : pathname === item.href;
          
          if (useLocalState) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          }
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <QuotaMonitor />
      </div>
    </aside>
  );
}