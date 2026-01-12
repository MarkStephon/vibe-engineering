"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { youtubeApi } from "@/lib/api/endpoints";
import { toast } from "@/lib/utils/toast";

export default function AuthPanel() {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:start',message:'handleAuth called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,D,E'})}).catch(()=>{});
    // #endregion
    try {
      const { url } = await youtubeApi.getAuthUrl();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:success',message:'getAuthUrl succeeded',data:{url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
      // #endregion
      window.location.href = url;
    } catch (e) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a127609d-0110-4a4e-83ea-2be1242c90c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthPanel.tsx:handleAuth:error',message:'getAuthUrl failed',data:{error:e instanceof Error ? e.message : String(e), errorName: e instanceof Error ? e.name : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C,D'})}).catch(()=>{});
      // #endregion
      toast.error("Failed to initialize authorization");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
      <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-8">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Google API Authorization</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
        To access private playlists and higher-resolution data, please authorize VIBE to access your YouTube account via Google OAuth 2.0.
      </p>
      <Button
        size="lg"
        onClick={handleAuth}
        disabled={loading}
        className="rounded-xl h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 border-0 active:scale-[0.98] transition-all"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Authorize with Google
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <p className="mt-6 text-xs text-muted-foreground">
        We only request read-only access to your YouTube data.
      </p>
    </div>
  );
}