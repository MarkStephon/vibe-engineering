"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Youtube, ListMusic, Subtitles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import QuotaMonitor from "./QuotaMonitor";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'video', label: 'Video Info', icon: Youtube, href: '/video' },
    { id: 'playlist', label: 'Playlist', icon: ListMusic, href: '/playlist' },
    { id: 'captions', label: 'Captions', icon: Subtitles, href: '/captions' },
    { id: 'auth', label: 'Authorization', icon: ShieldCheck, href: '/auth' },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen sticky top-0 bg-background border-r border-border/50 p-6">
      <Link href="/dashboard" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-black text-sm">V</span>
        </div>
        <span className="font-bold text-lg tracking-tight">VIBE DATA</span>
      </Link>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              pathname === item.href
                ? "bg-secondary text-primary"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <QuotaMonitor />
      </div>
    </aside>
  );
}