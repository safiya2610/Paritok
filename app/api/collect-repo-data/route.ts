import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { RedisCacheManager } from '@/lib/redis-cache-manager';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const { username, repo, force_refresh = false } = await req.json();
        const repoUrl = `https://github.com/${username}/${repo}`;

        // Check cache first unless force refresh is requested
        if (!force_refresh) {
            const cachedData = await RedisCacheManager.getFromCache(username, repo);
            if (cachedData) {
                logger.info(`Retrieved data from cache for ${repoUrl}`, { prefix: 'GitIngest' });
                return NextResponse.json(cachedData);
            }
        }

        logger.info(`Starting data collection for repository: ${repoUrl} using local python script`, { prefix: 'GitIngest' });

        const scriptPath = path.join(process.cwd(), 'lib', 'run_ingest.py');
        
        let stdout, stderr;
        try {
            // maxBuffer set to 50MB to handle large repositories
            const res = await execAsync(`python "${scriptPath}" "${repoUrl}"`, { maxBuffer: 50 * 1024 * 1024 });
            stdout = res.stdout;
            stderr = res.stderr;
        } catch (execError: any) {
            logger.error(`Python execution failed: ${execError.message}`, { prefix: 'GitIngest' });
            if (execError.stdout) {
                 stdout = execError.stdout;
            } else {
                 throw new Error(`Python execution failed: ${execError.message}`);
            }
        }

        let result;
        try {
            result = JSON.parse(stdout);
        } catch (e) {
            logger.error(`Failed to parse JSON from python script. Stderr: ${stderr}`, { prefix: 'GitIngest' });
            throw new Error('Invalid JSON output from python script.');
        }

        if (result.success === false) {
            let errorMessage = result.error || 'Unknown error from GitIngest';
            logger.warn(`GitIngest error: ${errorMessage}`, { prefix: 'GitIngest' });
            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage
                },
                { status: 500 }
            );
        }

        const data = result.data;

        // Extract and log essential metrics
        const metrics = {
            files: data.summary?.match(/Files analyzed: (\d+)/)?.at(1) || 0,
            tokens: data.summary?.match(/Estimated tokens: (\d+)/)?.at(1) || 0,
            chars: data.content?.length || 0
        };

        logger.info(`Repository metrics - Files: ${metrics.files}, Tokens: ${metrics.tokens}, Characters: ${metrics.chars}`, { prefix: 'GitIngest' });

        if (!data.files) {
            data.files = [];
        }

        // Save successful response to cache
        await RedisCacheManager.saveToCache(username, repo, data);

        return NextResponse.json({
            success: true,
            data: {
                ...data,
                success: true
            }
        });
    } catch (error) {
        logger.error('Error collecting repository data: ' + (error instanceof Error ? error.message : 'Unknown error'), { prefix: 'GitIngest' });
        return NextResponse.json(
            {
                success: false,
                error: `Failed to collect repository data: ${error instanceof Error ? error.message : 'Unknown error'}`
            },
            { status: 500 }
        );
    }
}
