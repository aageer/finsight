"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, User, Palette, Bot, Database, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_AGENTS = [
  "AnalysisAgent",
  "ResearchAgent",
  "SwarmAgent",
  "NewsAgent",
  "RiskAgent",
  "AlertAgent",
] as const;

export default function SettingsPage() {
  const [darkTheme, setDarkTheme] = useState(true);
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AI_AGENTS.map((a) => [a, true])) as Record<string, boolean>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-[var(--color-accent-orange)]" />
        <h1 className="font-mono-terminal text-lg font-semibold tracking-tight">Settings</h1>
        <Badge variant="outline" className="font-mono-terminal text-[10px] text-muted-foreground">
          Demo
        </Badge>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-4">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 bg-muted/30 p-1">
              <TabsTrigger value="profile" className="gap-1.5 font-mono-terminal text-xs data-active:text-[var(--color-accent-orange)]">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5 font-mono-terminal text-xs data-active:text-[var(--color-accent-orange)]">
                <Palette className="h-3.5 w-3.5" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5 font-mono-terminal text-xs data-active:text-[var(--color-accent-orange)]">
                <Bot className="h-3.5 w-3.5" />
                AI &amp; Agents
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-1.5 font-mono-terminal text-xs data-active:text-[var(--color-accent-orange)]">
                <Database className="h-3.5 w-3.5" />
                Data &amp; Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 space-y-4">
              <Card className="border-border bg-muted/10">
                <CardHeader className="pb-2">
                  <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Account
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-name" className="font-mono-terminal text-[10px] uppercase text-muted-foreground">
                      Name
                    </Label>
                    <Input id="settings-name" defaultValue="Demo User" className="font-mono-terminal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-email" className="font-mono-terminal text-[10px] uppercase text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="settings-email"
                      readOnly
                      defaultValue="demo@finsight.ai"
                      className="cursor-not-allowed font-mono-terminal opacity-80"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono-terminal text-[10px] uppercase text-muted-foreground">Role</span>
                    <div>
                      <Badge variant="outline" className="border-[var(--color-accent-orange)]/40 font-mono-terminal text-xs text-[var(--color-accent-orange)]">
                        Student
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 space-y-4">
              <Card className="border-border bg-muted/10">
                <CardHeader className="pb-2">
                  <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Display &amp; charts
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-3 py-3">
                    <div>
                      <p className="font-mono-terminal text-xs font-medium">Theme</p>
                      <p className="text-[10px] text-muted-foreground">Terminal-optimized dark palette</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono-terminal text-[10px]", !darkTheme && "text-muted-foreground")}>
                        Light
                      </span>
                      <Switch checked={darkTheme} onCheckedChange={setDarkTheme} />
                      <span className={cn("font-mono-terminal text-[10px] text-[var(--color-accent-orange)]", !darkTheme && "text-muted-foreground")}>
                        Dark
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono-terminal text-[10px] uppercase text-muted-foreground">Currency</Label>
                    <Select defaultValue="usd" items={{ usd: "USD", eur: "EUR", gbp: "GBP" }}>
                      <SelectTrigger className="w-full max-w-xs font-mono-terminal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono-terminal text-[10px] uppercase text-muted-foreground">Default chart type</Label>
                    <Select
                      defaultValue="candlestick"
                      items={{
                        candlestick: "Candlestick",
                        line: "Line",
                        ohlc: "OHLC",
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs font-mono-terminal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="ohlc">OHLC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-4">
              <Card className="border-border bg-muted/10">
                <CardHeader className="pb-2">
                  <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Agent toggles
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {AI_AGENTS.map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-3 py-2"
                    >
                      <span className="font-mono-terminal text-xs">{name}</span>
                      <Switch
                        checked={agentEnabled[name] ?? true}
                        onCheckedChange={(on) =>
                          setAgentEnabled((prev) => ({ ...prev, [name]: on }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-muted/10">
                <CardHeader className="pb-2">
                  <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    LLM Provider
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[var(--color-accent-orange)] font-mono-terminal text-black hover:bg-[var(--color-accent-orange)]">
                      Groq (Free)
                    </Badge>
                    <Badge variant="outline" className="font-mono-terminal text-[10px] text-muted-foreground">
                      OpenAI
                    </Badge>
                    <Badge variant="outline" className="font-mono-terminal text-[10px] text-muted-foreground">
                      Anthropic
                    </Badge>
                  </div>
                  <p className="font-mono-terminal text-xs text-muted-foreground">
                    Monthly Token Budget:{" "}
                    <span className="text-[var(--color-accent-orange)]">Unlimited (Free Tier)</span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-4">
              <Card className="border-border bg-muted/10">
                <CardHeader className="pb-2">
                  <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Export
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button variant="outline" className="justify-start gap-2 border-border font-mono-terminal text-xs">
                    <Download className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
                    Export Portfolio CSV
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 border-border font-mono-terminal text-xs">
                    <Download className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
                    Export Transactions
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 border-border font-mono-terminal text-xs">
                    <Download className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
                    Export All Data JSON
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
