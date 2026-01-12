"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ListVideo, FileText, Key, ArrowRight, Database } from "lucide-react";

export default function DashboardPage() {
  const dataServices = [
    {
      title: "Video Metadata",
      description: "Extract detailed information from any YouTube video",
      icon: Video,
      href: "/video",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Playlist Explorer",
      description: "Browse and analyze YouTube playlists",
      icon: ListVideo,
      href: "/playlist",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Caption Extractor",
      description: "Get available caption tracks from videos",
      icon: FileText,
      href: "/captions",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "API Authentication",
      description: "Manage Google OAuth credentials",
      icon: Key,
      href: "/auth",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <Database className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter">
                DATA DASHBOARD
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Direct access to YouTube Data API v3
              </p>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href}>
                <Card className="border-0 bg-card hover:bg-muted/50 transition-all duration-200 h-full group cursor-pointer rounded-2xl">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-xl ${service.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-xl"
                    >
                      <span>Open</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 bg-card rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">About This Dashboard</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Data Dashboard provides direct access to YouTube Data API v3 endpoints.
            All data is retrieved in real-time with intelligent caching to optimize performance
            and reduce API quota usage. Authentication via Google OAuth 2.0 is required for
            accessing private playlists and caption data.
          </p>
        </div>
      </div>
    </div>
  );
}
