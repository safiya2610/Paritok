"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SendHorizontal,
  Bot,
  User,
  Sparkles,
  FileQuestion,
  Code,
  Lightbulb,
  Package,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { CodeBlock } from "@/components/code-block"
import Image from "next/image"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AIRateLimit } from "@/components/ui/ai-rate-limit"
import { useGithubStars } from "@/hooks/useGithubStars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AiAssistantProps {
  username: string
  repo: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface QuickPromptButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

const QuickPromptButton = ({ icon, label, onClick }: QuickPromptButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    className="flex items-center gap-1.5 bg-background border-border hover:bg-muted hover:text-foreground text-xs text-muted-foreground whitespace-nowrap transition-colors shadow-sm"
    onClick={onClick}
  >
    {icon}
    {label}
  </Button>
)

export default function AiAssistant({ username, repo }: AiAssistantProps) {
  const searchParams = useSearchParams()
  const filePath = searchParams?.get("file") || null
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI assistant for the [${username}](https://github.com/${username})/[${repo}](https://github.com/${username}/${repo}) repository. Ask me anything about this codebase.`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useParitok, setUseParitok] = useState(true)
  const [metrics, setMetrics] = useState<{ tokensSaved: number, costSaved: number, latency: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { stars, loading: starsLoading, error: starsError } = useGithubStars(username, repo)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus()
  }, [isLoading])



  useEffect(() => {
    if (starsError) console.error("Error fetching GitHub stars:", starsError)
  }, [starsError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      sendMessage()
    }
  }

  const sendMessage = async () => {
    const userInput = input
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: Message = { role: "user", content: userInput, timestamp }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const response = await fetch(`${baseUrl}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          repo,
          query: input,
          filePath,
          fetchOnlyCurrentFile:
            input.includes("Explain file contents of") || input.includes("Explain this file"),
          useParitok
        }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error || "Failed to generate response")

      if (data.paritokMetrics) {
        setMetrics({
          tokensSaved: data.paritokMetrics.tokensSaved || 0,
          costSaved: data.paritokMetrics.costSaved || 0,
          latency: data.latency || 0,
        })
      } else {
        setMetrics({ tokensSaved: 0, costSaved: 0, latency: data.latency || 0 })
      }

      // Update rate limit in UI
      if (data.rateLimit) {
        window.dispatchEvent(new CustomEvent('aiRateLimitUpdate', { detail: data.rateLimit }))
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response || "No response received.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => setInput(prompt)

  return (
    <div className="flex flex-col h-full min-h-0 bg-background border-l border-border relative overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">AI Assistant</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online
              </span>
              {!starsLoading && !starsError && stars !== null && (
                <>
                  <span>•</span>
                  <a
                    href={`https://github.com/${username}/${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <span className="text-yellow-400">★</span>
                    {stars}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AIRateLimit />
          <ThemeToggle />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0 bg-transparent">
                {message.role === "assistant" ? (
                  <div className="h-full w-full bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="h-full w-full bg-muted rounded-full flex items-center justify-center border border-border">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </Avatar>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[85%] min-w-0 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {message.role === "assistant" ? "AnswerGit AI" : "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {message.timestamp || (mounted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "")}
                  </span>
                </div>

                <div
                  className={`px-4 py-3 text-[15px] leading-relaxed min-w-0 w-full ${message.role === "user"
                    ? "bg-muted text-foreground rounded-2xl rounded-tr-sm"
                    : "bg-transparent text-foreground"
                    }`}
                >
                  <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none break-words">
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const { inline } = props
                          const match = /language-(\w+)/.exec(className || "")
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, "")}
                            />
                          ) : (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs border border-border" {...props}>
                              {children}
                            </code>
                          )
                        },
                        p({ children }) {
                          return <p className="mb-2 last:mb-0 break-words">{children}</p>
                        },
                        ul({ children }) {
                          return <ul className="my-2 pl-4 list-disc space-y-1">{children}</ul>
                        },
                        ol({ children }) {
                          return <ol className="my-2 pl-4 list-decimal space-y-1">{children}</ol>
                        },
                        li({ children }) {
                          return <li className="pl-1">{children}</li>
                        },
                        a({ href, children }) {
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-medium">
                              {children}
                            </a>
                          )
                        },
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-4 rounded-lg border border-border">
                              <table className="w-full text-left text-sm">{children}</table>
                            </div>
                          )
                        },
                        th({ children }) {
                          return <th className="bg-muted px-4 py-2 font-medium border-b border-border">{children}</th>
                        },
                        td({ children }) {
                          return <td className="px-4 py-2 border-b border-border last:border-0">{children}</td>
                        },
                        blockquote({ children }) {
                          return <blockquote className="border-l-2 border-emerald-500 pl-4 italic text-muted-foreground my-2">{children}</blockquote>
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <Avatar className="h-8 w-8 shrink-0 bg-transparent">
                <div className="h-full w-full bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">AnswerGit AI</span>
                </div>
                <div className="px-4 py-3 text-[15px] leading-relaxed">
                  <div className="flex items-center gap-1.5 h-6">
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
            <QuickPromptButton
              icon={<FileQuestion className="h-3.5 w-3.5" />}
              label={filePath ? "Explain this file" : "Explain structure"}
              onClick={() =>
                handleQuickPrompt(
                  filePath
                    ? `Explain file contents of : ${filePath}`
                    : "Explain the project structure And what it does?"
                )
              }
            />
            <QuickPromptButton
              icon={<Package className="h-3.5 w-3.5" />}
              label="Dependencies"
              onClick={() => handleQuickPrompt("What are the main dependencies of this project?")}
            />
            <QuickPromptButton
              icon={<Lightbulb className="h-3.5 w-3.5" />}
              label="Improvements"
              onClick={() => handleQuickPrompt("How can I improve this codebase?")}
            />
            <QuickPromptButton
              icon={<FileQuestion className="h-3.5 w-3.5" />}
              label="Create README.md"
              onClick={() => handleQuickPrompt("Create a README.md for this repository")}
            />
            <QuickPromptButton
              icon={<Code className="h-3.5 w-3.5" />}
              label="Generate tests"
              onClick={() => handleQuickPrompt("Generate a test for this code")}
            />
          </div>

          {/* Paritok Compare Mode Toggle & Metrics */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-2">
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

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex gap-2 bg-background p-2 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <Textarea
                placeholder="Ask about this repository..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-none focus-visible:ring-0 text-sm text-foreground placeholder:text-muted-foreground py-2.5 px-3"
                rows={1}
                disabled={isLoading}
                ref={inputRef}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className={`h-[44px] w-[44px] rounded-lg transition-all duration-200 ${input.trim()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              AI can make mistakes. Review generated code before use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
