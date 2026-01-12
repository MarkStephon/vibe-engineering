"use client";

import React from 'react';
import Sidebar from "@/components/Sidebar";
import AuthPanel from "@/components/AuthPanel";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 lg:p-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
              Security Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your API credentials and access levels.
            </p>
          </div>

          {/* Auth Panel */}
          <AuthPanel />
        </div>
      </main>
    </div>
  );
}
