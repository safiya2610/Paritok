"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Bug, ShieldAlert, Zap, Activity, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"

interface ReviewResult {
  bugs: string[];
  security: string[];
  performance: string[];
  codeSmells: string[];
  score: number;
}

export function PRReviewer() {
  const [inputMode, setInputMode] = useState<"url" | "diff">("url")
  const [prUrl, setPrUrl] = useState("")
  const [rawDiff, setRawDiff] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [useParitok, setUseParitok] = useState(true)
  const [metrics, setMetrics] = useState<{ tokensSaved: number; costSaved: number; latency: number } | null>(null)

  const handleAnalyze = async () => {
    if (inputMode === "url" && !prUrl.trim()) {
      setError("Please enter a GitHub PR URL")
      return
    }
    if (inputMode === "diff" && !rawDiff.trim()) {
      setError("Please paste a git diff")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    setMetrics(null)

    try {
      const response = await fetch("/api/pr-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prUrl: inputMode === "url" ? prUrl : undefined,
          rawDiff: inputMode === "diff" ? rawDiff : undefined,
          useParitok
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze PR")
      }

      setResult(data.review)
      
      if (data.paritokMetrics) {
        setMetrics({
          tokensSaved: data.paritokMetrics.tokensSaved || 0,
          costSaved: data.paritokMetrics.costSaved || 0,
          latency: data.paritokMetrics.latency || 0,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderSection = (title: string, items: string[], icon: React.ReactNode, emptyText: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex items-center gap-2 p-4 text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{emptyText}</span>
        </div>
      )
    }

    return (
      <ul className="space-y-2 mt-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-muted-foreground p-3 bg-muted rounded-md border border-border">
            <div className="mt-0.5 shrink-0 text-foreground">{icon}</div>
            <div className="leading-relaxed">{item}</div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in-up mt-12 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">AI Code Reviewer</h2>
        <p className="text-muted-foreground text-lg">Instantly review Pull Requests for bugs, security issues, and performance.</p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "diff")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
              <TabsTrigger value="url">GitHub PR URL</TabsTrigger>
              <TabsTrigger value="diff">Paste Raw Diff</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/username/repo/pull/1"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  disabled={isAnalyzing}
                  className="bg-background h-12 text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !prUrl.trim()} className="h-12 px-6">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="diff" className="space-y-4">
              <Textarea
                placeholder="Paste your git diff here..."
                value={rawDiff}
                onChange={(e) => setRawDiff(e.target.value)}
                disabled={isAnalyzing}
                className="min-h-[200px] font-mono text-sm bg-background p-4"
              />
              <div className="flex justify-end">
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawDiff.trim()} className="w-full sm:w-auto px-8 h-12">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isAnalyzing ? "Analyzing..." : "Analyze Diff"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mt-6">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useParitok}
                  onChange={(e) => setUseParitok(e.target.checked)}
                  className="rounded border-border"
                />
                <span className={useParitok ? "text-primary font-medium" : "text-muted-foreground"}>Use Paritok Optimization</span>
              </label>
            </div>
            {metrics && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  {metrics.tokensSaved.toLocaleString()} tokens saved
                </span>
                <span className="flex items-center gap-1 text-primary">
                  ${metrics.costSaved.toFixed(4)} saved
                </span>
                <span>{metrics.latency}ms</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && !result && (
         <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground animate-pulse">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="font-medium">Analyzing code changes...</p>
         </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between p-6 bg-card border border-border rounded-xl shadow-sm">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Review Summary</h3>
              <p className="text-muted-foreground">Based on automated AI analysis</p>
            </div>
            <div className="flex flex-col items-center justify-center h-20 w-20 rounded-full border-4 border-primary bg-primary/10">
              <span className="text-2xl font-bold text-primary">{result.score}</span>
              <span className="text-[10px] uppercase font-bold text-primary/70">Score</span>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["bugs", "security", "performance", "smells"]} className="w-full bg-card border border-border rounded-xl shadow-sm px-6">
            <AccordionItem value="bugs" className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Bug className="h-5 w-5 text-red-500" />
                  Bugs & Errors
                  <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{result.bugs?.length || 0}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {renderSection("Bugs", result.bugs, <Bug className="h-4 w-4 text-red-500" />, "No bugs detected in the diff.")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security" className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Security Vulnerabilities
                  <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{result.security?.length || 0}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {renderSection("Security", result.security, <ShieldAlert className="h-4 w-4 text-amber-500" />, "No glaring security issues found.")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="performance" className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Performance Suggestions
                  <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{result.performance?.length || 0}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {renderSection("Performance", result.performance, <Zap className="h-4 w-4 text-blue-500" />, "Code looks well-optimized.")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="smells" className="border-border border-b-0">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Code Smells
                  <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{result.codeSmells?.length || 0}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {renderSection("Code Smells", result.codeSmells, <Activity className="h-4 w-4 text-purple-500" />, "Clean code! No smells detected.")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
