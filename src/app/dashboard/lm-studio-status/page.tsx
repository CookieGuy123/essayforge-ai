"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkLMStudioStatus, LMStudioStatus } from "@/lib/aiService";
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Cpu, Server, ShieldCheck, Terminal, Clock, Zap } from "lucide-react";

export default function LMStudioStatusPage() {
  const [status, setStatus] = useState<LMStudioStatus>({
    online: false,
    modelName: "Checking...",
    modelsCount: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await checkLMStudioStatus();
      setStatus(res);
    } catch {
      setStatus({ online: false, modelName: "Offline", modelsCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Activity className="h-7 w-7 text-emerald-500" />
            LM Studio Diagnostic Status
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor connection readiness, loaded local LLM models, and server health at <code className="bg-muted px-1.5 py-0.5 rounded text-indigo-400 font-mono text-xs">http://127.0.0.1:1234</code>.
          </p>
        </div>

        <Button onClick={fetchStatus} disabled={loading} variant="outline" className="font-semibold shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Ping Server
        </Button>
      </div>

      {/* Main Status Banner */}
      <Card className={`border-2 ${status.online && status.modelLoaded !== false ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/40 bg-amber-950/10'}`}>
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0 ${
              status.online && status.modelLoaded !== false ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-amber-600 shadow-amber-500/20'
            }`}>
              {status.online && status.modelLoaded !== false ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {status.online 
                    ? (status.modelLoaded === false ? "LM Studio Server Connected (No Model Loaded)" : "LM Studio Local Server Connected") 
                    : "LM Studio Server Offline"}
                </h2>
                <Badge variant={status.online && status.modelLoaded !== false ? "success" : "destructive"}>
                  {status.online && status.modelLoaded !== false ? "Ready for AI Coaching" : "Action Required"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {status.warning || (status.online 
                  ? `Active Model: ${status.modelName} (${status.modelsCount} model(s) available)` 
                  : "Could not reach local endpoint at http://127.0.0.1:1234/v1")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Local Endpoint</p>
              <p className="text-xs font-bold text-indigo-400 font-mono mt-0.5 break-all">127.0.0.1:1234</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Loaded Model</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5" title={status.modelName}>{status.modelName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Response Latency</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{status.latencyMs ? `${status.latencyMs} ms` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-semibold">Last Ping Log</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{status.lastRequestTime || "None"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Guide */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-400" />
            LM Studio Setup Instructions
          </CardTitle>
          <CardDescription>Follow these steps to connect your local LLM engine to EssayForge AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ol className="space-y-3 text-sm list-decimal pl-5 text-foreground/90 leading-relaxed">
            <li>
              <strong>Launch LM Studio</strong> on your computer.
            </li>
            <li>
              <strong>Search and Download a Model</strong> (Recommended: <em>Llama-3</em>, <em>Gemma-2B/7B</em>, <em>Mistral-7B</em>, or <em>Qwen-2.5</em>).
            </li>
            <li>
              Navigate to the <strong>Local Server tab</strong> in LM Studio (the server icon on the left).
            </li>
            <li>
              Click <strong>Start Server</strong> at port <strong>1234</strong> (Host: <code>127.0.0.1</code>).
            </li>
            <li>
              Return to EssayForge AI and click <strong>Ping Server</strong> above.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
