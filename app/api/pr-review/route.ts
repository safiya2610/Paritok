import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { optimizeContext } from '@/lib/paritok';

// Primary and secondary Gemini API clients
const primaryGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const secondaryGenAI = process.env.GEMINI_API_KEY_SECONDARY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY_SECONDARY)
  : null;

const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-pro-latest'
];

async function generateWithFallback(prompt: string): Promise<string> {
  const generationConfig = {
    temperature: 0.2,
    maxOutputTokens: 4096,
  };

  const clients = [
    { name: 'Primary API Key', client: primaryGenAI },
    ...(secondaryGenAI ? [{ name: 'Secondary API Key', client: secondaryGenAI }] : [])
  ];

  let lastErrorMsg = '';

  for (const { name: clientName, client } of clients) {
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        });
        return result.response.text();
      } catch (error) {
        lastErrorMsg = error instanceof Error ? error.message : String(error);
      }
    }
  }

  throw new Error(`All generation attempts failed. Last error: ${lastErrorMsg}`);
}

export async function POST(request: Request) {
  try {
    const { prUrl, rawDiff, useParitok } = await request.json();

    if (!prUrl && !rawDiff) {
      return NextResponse.json(
        { success: false, error: "Must provide either a GitHub PR URL or raw diff text." },
        { status: 400 }
      );
    }

    let diffText = rawDiff || "";

    if (prUrl && !rawDiff) {
      // Validate and clean PR URL
      let urlStr = prUrl;
      // Add https:// if missing
      if (!urlStr.startsWith('http')) {
        urlStr = `https://${urlStr}`;
      }
      
      const url = new URL(urlStr);
      if (url.hostname !== 'github.com') {
        return NextResponse.json({ success: false, error: "Must be a github.com URL" }, { status: 400 });
      }

      // Convert to diff URL
      let diffUrl = urlStr;
      if (!diffUrl.endsWith('.diff') && !diffUrl.endsWith('.patch')) {
        diffUrl = `${diffUrl}.diff`;
      }

      const diffResponse = await fetch(diffUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3.diff'
        }
      });

      if (!diffResponse.ok) {
         return NextResponse.json(
            { success: false, error: `Failed to fetch PR diff from GitHub. Status: ${diffResponse.status}` },
            { status: 400 }
          );
      }

      diffText = await diffResponse.text();
    }

    if (!diffText || diffText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "The provided PR or diff is empty." },
        { status: 400 }
      );
    }

    let paritokMetrics = null;
    let finalDiffText = diffText;
    
    if (useParitok) {
      const optimized = await optimizeContext(diffText, true, 3000);
      finalDiffText = optimized.text;
      paritokMetrics = optimized;
    }

    const systemPrompt = `You are an expert Senior Software Engineer conducting a thorough Pull Request Review.
Analyze the following git diff and provide a strictly formatted JSON response. 
Do not wrap the JSON in Markdown backticks (e.g., \`\`\`json). Just return the raw JSON string.

The JSON object MUST follow this schema exactly:
{
  "bugs": ["<string describing bug 1>", "<string describing bug 2>"],
  "security": ["<string describing security issue 1>"],
  "performance": ["<string describing performance suggestion>"],
  "codeSmells": ["<string describing code smell>"],
  "score": <number between 1 and 10>
}

If a category has no issues, return an empty array for that category. Provide specific references to code in your issues where appropriate. Focus on impactful feedback.

Here is the diff to review:
-----
${finalDiffText}
-----
`;

    const aiResponse = await generateWithFallback(systemPrompt);
    
    // Clean up response if the model still returned markdown code blocks
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.substring(7);
    }
    if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
    }

    const parsedJson = JSON.parse(cleanedResponse.trim());

    return NextResponse.json({
      success: true,
      review: parsedJson,
      paritokMetrics
    });

  } catch (error) {
    console.error("PR Review API Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process PR review." },
      { status: 500 }
    );
  }
}
