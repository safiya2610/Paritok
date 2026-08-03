'use client'

import { useState } from "react"
import { CheckCircle2, XCircle, ArrowRight, Activity, Zap, FileText, Database, Shield, Layout, Filter, Trash2, Cpu, BarChart3, Layers, Settings, ChevronRight } from "lucide-react"

export function Features() {
  const [compareMode, setCompareMode] = useState(true) // true = With Paritok, false = Without

  return (
    <section className="py-24 px-6 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* 1. Token Replay & 4. AI Context Optimizer */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Context Optimizer
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Stop sending raw repositories to LLMs. Paritok intelligently optimizes context by removing duplicates, filtering out noise, and keeping only what's relevant to your query.
            </p>
            
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Token Replay</h3>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-500/20 text-red-400 rounded-lg">
                  <span>Original Prompt</span>
                  <span className="font-semibold">18,245 tokens</span>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="text-slate-400 rotate-90 w-5 h-5" />
                </div>
                
                <div className="flex justify-center items-center p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Paritok Compression</span>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="text-slate-400 rotate-90 w-5 h-5" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <span>Sent to LLM</span>
                  <span className="font-semibold">4,912 tokens</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">73.1%</div>
                  <div className="text-xs text-slate-500 mt-1">Saved Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$0.12</div>
                  <div className="text-xs text-slate-500 mt-1">Cost Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">-38%</div>
                  <div className="text-xs text-slate-500 mt-1">Latency</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="space-y-6">
                {[
                  { icon: Layers, text: "Original Context", color: "text-slate-500" },
                  { icon: Filter, text: "Remove duplicates", color: "text-amber-500" },
                  { icon: Trash2, text: "Remove comments", color: "text-red-500" },
                  { icon: CheckCircle2, text: "Keep relevant files", color: "text-emerald-500" },
                  { icon: Cpu, text: "Paritok AI", color: "text-blue-500", highlight: true },
                  { icon: Database, text: "LLM Provider", color: "text-purple-500" }
                ].map((step, idx, arr) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`flex items-center gap-4 p-4 w-full max-w-sm rounded-xl border ${step.highlight ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-muted/30'}`}>
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                      <span className="font-medium text-foreground">{step.text}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 my-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Compare Mode & 5. Repository Cost Analyzer */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="relative bg-card border border-border rounded-3xl p-8 shadow-sm">
                
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground">Run Query</h3>
                  <div className="flex bg-muted border border-border rounded-lg p-1">
                    <button 
                      onClick={() => setCompareMode(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!compareMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Without Paritok
                    </button>
                    <button 
                      onClick={() => setCompareMode(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${compareMode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      With Paritok
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Tokens Sent</div>
                      <div className={`text-3xl font-bold font-mono transition-colors ${compareMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {compareMode ? '4,912' : '18,245'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Cost per Query</div>
                      <div className={`text-3xl font-bold font-mono transition-colors ${compareMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {compareMode ? '$0.03' : '$0.15'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground font-medium">Response Time</span>
                        <span className={`font-mono font-bold ${compareMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {compareMode ? '1.2s' : '3.8s'}
                        </span>
                     </div>
                     <div className="w-full bg-muted rounded-full h-2.5 mb-6">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${compareMode ? 'bg-emerald-500 w-[25%]' : 'bg-amber-500 w-[85%]'}`}></div>
                     </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">Answer Quality</div>
                    <p className="text-sm text-muted-foreground">
                      {compareMode 
                        ? "✨ Highly focused and accurate. LLM wasn't distracted by irrelevant docs or test files." 
                        : "⚠️ Verbose and generic. The LLM pulled in noise from unrelated modules and dependencies."}
                    </p>
                  </div>
                </div>

             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Stop Overpaying for Context
            </h2>
            <p className="text-lg text-muted-foreground">
              See the immediate impact on your API bills. Paritok slashes token usage without compromising the quality of your AI's responses.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="text-sm text-red-600 font-semibold mb-2 uppercase tracking-wider">Without Paritok</div>
                <div className="text-4xl font-bold text-red-600 mb-1">$42</div>
                <div className="text-sm text-muted-foreground">per 1000 questions</div>
              </div>
              
              <div className="bg-card border border-primary/20 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute -right-4 -top-4 bg-primary text-primary-foreground text-xs font-bold px-6 py-1 rotate-45">74% SAVINGS</div>
                <div className="text-sm text-emerald-600 font-semibold mb-2 uppercase tracking-wider">With Paritok</div>
                <div className="text-4xl font-bold text-emerald-600 mb-1">$11</div>
                <div className="text-sm text-muted-foreground">per 1000 questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Token Heatmap & 6. Smart Context Selection */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Smart Context Selection
            </h2>
            <p className="text-lg text-muted-foreground">
              Instead of blindly dumping your entire repository into the prompt, our engine builds a token heatmap to identify exactly what the LLM needs to know.
            </p>
            
            <div className="flex items-center gap-4 text-muted-foreground font-medium">
              <div className="flex flex-col items-center p-4 bg-card border border-border shadow-sm rounded-xl">
                <span className="text-3xl font-bold text-foreground mb-1">400</span>
                <span className="text-xs uppercase tracking-wider">Total Files</span>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <div className="flex flex-col items-center p-4 bg-primary/5 border border-primary/20 shadow-sm rounded-xl">
                <span className="text-3xl font-bold text-emerald-600 mb-1">8</span>
                <span className="text-xs uppercase tracking-wider text-emerald-600">Relevant</span>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <div className="flex flex-col items-center p-4 bg-primary/5 border border-primary/20 shadow-sm rounded-xl">
                <Zap className="w-8 h-8 text-blue-600 mb-1" />
                <span className="text-xs uppercase tracking-wider text-blue-600">LLM Ready</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
             <div className="relative bg-card border border-border rounded-3xl p-6 shadow-sm font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border text-muted-foreground">
                  <Layout className="w-4 h-4" />
                  <span>Token Heatmap Analysis</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">📁</span>
                      <span className="text-foreground font-medium">frontend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-[90%] h-full bg-emerald-500" />
                      </div>
                      <span className="text-emerald-500 text-xs font-semibold w-24 text-right">90% relevant</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">📁</span>
                      <span className="text-foreground font-medium">auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-500" />
                      </div>
                      <span className="text-emerald-500 text-xs font-semibold w-24 text-right">100% relevant</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">📁</span>
                      <span className="text-muted-foreground line-through">tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-[10%] h-full bg-red-500" />
                      </div>
                      <span className="text-red-500 text-xs w-24 text-right">🔴 ignored</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">📁</span>
                      <span className="text-muted-foreground line-through">docs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-[5%] h-full bg-red-500" />
                      </div>
                      <span className="text-red-500 text-xs w-24 text-right">🔴 ignored</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors opacity-40">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">📁</span>
                      <span className="text-muted-foreground line-through">node_modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs w-24 text-right">❌ removed</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  )
}
