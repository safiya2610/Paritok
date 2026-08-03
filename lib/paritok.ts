import { logger } from './logger';

export interface ParitokResponse {
  compressed: string;
  gpu_available: boolean;
  tokensSaved?: number;
  costSaved?: number;
  originalTokens?: number;
  compressedTokens?: number;
}

export async function optimizeContext(content: string, query: string): Promise<ParitokResponse> {
  try {
    const apiKey = process.env.PARITOK_API_KEY;
    if (!apiKey) {
      throw new Error("PARITOK_API_KEY is not set in environment variables");
    }

    const startTime = Date.now();
    logger.info(`Sending context to Paritok for optimization. Content length: ${content.length}`, { prefix: 'Paritok' });

    const response = await fetch('https://www.paritok.com/api/compress', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        query,
        kind: 'file_read'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Paritok API error: ${response.status} - ${errorText}`, { prefix: 'Paritok' });
      // Fallback to returning the original content if Paritok fails
      return { compressed: content, gpu_available: false, originalTokens: 0, compressedTokens: 0, tokensSaved: 0, costSaved: 0 };
    }

    const data = await response.json();
    const endTime = Date.now();
    
    // Estimate tokens (1 token ≈ 4 characters for simple estimation)
    const originalTokens = Math.ceil(content.length / 4);
    const compressedTokens = Math.ceil(data.compressed.length / 4);
    const tokensSaved = Math.max(0, originalTokens - compressedTokens);
    
    // Estimate cost saved based on standard Gemini 1.5 Flash input token pricing ($0.075 per 1M tokens)
    const costSaved = (tokensSaved / 1_000_000) * 0.075;

    logger.info(`Paritok optimization complete in ${endTime - startTime}ms. Saved ~${tokensSaved} tokens.`, { prefix: 'Paritok' });

    return {
      compressed: data.compressed,
      gpu_available: data.gpu_available,
      originalTokens,
      compressedTokens,
      tokensSaved,
      costSaved
    };
  } catch (error) {
    logger.error(`Error connecting to Paritok API: ${error}`, { prefix: 'Paritok' });
    // Graceful fallback to original content
    return { compressed: content, gpu_available: false, originalTokens: 0, compressedTokens: 0, tokensSaved: 0, costSaved: 0 };
  }
}
