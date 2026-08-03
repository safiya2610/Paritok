'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Github, Code, MessageSquare } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { EnhancedLoading } from "@/components/enhanced-loading"
import { AnimatedText } from "@/components/animated-text"
import { Features } from "@/components/features"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PRReviewer } from "@/components/pr-reviewer"

export default function Home() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingText, setLoadingText] = useState("Analyzing Repository...") // New state for loading text
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleAnalyze = async () => { // Make handleAnalyze async
    // Extract username and repo from the URL
    const urlPattern = /(?:github\.com\/)(([-\w.]+)\/([-\w.]+))/
    const match = repoUrl.match(urlPattern)

    let username: string | null = null;
    let repo: string | null = null;

    if (match) {
      [, , username, repo] = match
    } else {
      // If URL doesn't match pattern, check if it contains any text and try to extract username/repo
      const simplifiedPattern = /(([-\w.]+)\/([-\w.]+))/
      const simplifiedMatch = repoUrl.match(simplifiedPattern)
      
      if (simplifiedMatch) {
        [, , username, repo] = simplifiedMatch
      } else if (repoUrl.trim() !== '') {
        // If no pattern matches but there is text, alert the user
        alert('Please enter a valid GitHub repository URL or username/repository format')
        return;
      } else {
        // If empty, alert the user
        alert('Please enter a GitHub repository URL')
        return;
      }
    }

    if (username && repo) {
      setIsAnalyzing(true)
      setLoadingText("Fetching Repository Data...")

      try {
        // First, trigger GitIngest analysis
        setLoadingText("Analyzing repository with GitIngest...");
        const gitIngestResponse = await fetch('/api/collect-repo-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, repo, force: true }), // force: true to ensure fresh fetch
        });

        const gitIngestResult = await gitIngestResponse.json();

        if (!gitIngestResponse.ok) {
          throw new Error(gitIngestResult.error || 'Failed to analyze repository with GitIngest');
        }

        setLoadingText("Repository analyzed successfully!");
        
        // Add a small delay to show success message before navigating
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate to the repository page
        router.push(`/${username}/${repo}`);
      } catch (error) {
        console.error('Failed to analyze repository:', error);
        alert(error instanceof Error ? error.message : 'Failed to analyze repository');
        setIsAnalyzing(false);
        setLoadingText("Analyzing Repository..."); // Reset loading text
      } 
    }    
    // Log for debugging
    console.log('Analyze button clicked', { repoUrl })
  }
  
  // Handle Enter key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent default form submission
      console.log('Enter key pressed')
      handleAnalyze()
    }
  }

  return (
    <div className="flex flex-col bg-background min-h-screen text-foreground">
      {/* Hero Section with Immersive Background */}
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
        {/* Subtle grid background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="max-w-3xl w-full text-center flex flex-col justify-center items-center h-full space-y-12 z-10 relative">
          {isAnalyzing ? (
            <div className="flex items-center justify-center min-h-[200px] backdrop-blur-xl bg-black/40 p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
              {/* Use EnhancedLoading component with dynamic text */}
              <EnhancedLoading loadingText={loadingText} />
            </div>
          ) : (
            <>
              <div className="space-y-6 animate-fade-in pt-16">
                <div className="flex flex-col items-center space-y-2">
                  <AnimatedText 
                    text="Build Smarter" 
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-2" 
                    speed={40}
                    showCursor={true}
                  />
                  <AnimatedText 
                    text="with Token-Efficient AI" 
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-muted-foreground" 
                    speed={40}
                    delay={1500}
                    showCursor={false}
                  />
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up font-medium tracking-wide" style={{ animationDelay: '1s' }}>
                  Instantly analyze, understand, and improve any GitHub project with AI-powered insights.
                </p>
              </div>

              <Tabs defaultValue="repo" className="w-full flex flex-col items-center">
                <TabsList className="mb-8 grid w-full max-w-sm grid-cols-2 bg-muted relative z-20">
                  <TabsTrigger value="repo">Repo Analyzer</TabsTrigger>
                  <TabsTrigger value="pr">PR Reviewer</TabsTrigger>
                </TabsList>
                
                <TabsContent value="repo" className="w-full">
                  <div className="flex flex-col sm:flex-row max-w-2xl w-full mx-auto animate-fade-in-up relative group" style={{ animationDelay: '0.5s' }}>
                    <div className="relative flex w-full items-center shadow-sm rounded-full bg-background border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                      <Input 
                        placeholder="github.com/username/repository" 
                        className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 h-14 pl-6 text-lg rounded-l-full" 
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyDown={handleKeyPress}
                        ref={inputRef}
                        autoFocus
                        onPaste={(e) => {
                          e.stopPropagation()
                        }}
                      />
                      <div className="pr-2">
                        <Button 
                          className="rounded-full px-6 py-5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all" 
                          onClick={handleAnalyze}
                          type="button"
                          aria-label="Analyze Repository"
                        >
                          Analyze <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-sm text-muted-foreground animate-fade-in-up whitespace-nowrap overflow-x-auto px-2 font-mono text-center" style={{ animationDelay: '2s' }}>
                    Example: <span className="text-foreground font-semibold">github.com/safiya2610/Netflix-clone</span>
                  </div>
                </TabsContent>

                <TabsContent value="pr" className="w-full">
                  <PRReviewer />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Features Section */}
      <Features />
    </div>
  )
}

