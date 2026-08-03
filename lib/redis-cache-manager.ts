import { Redis } from '@upstash/redis';
import { logger } from './logger';

const CACHE_DURATION = 6 * 60 * 60; // 6 hours in seconds

export class RedisCacheManager {
  private static redis: Redis;

  private static getClient(): Redis {
    if (!this.redis) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      if (!url || !token) {
        throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
      }

      this.redis = new Redis({
        url: url,
        token: token,
      });
      logger.info('Upstash Redis initialized successfully', { prefix: 'Cache' });
    }

    return this.redis;
  }

  private static getCacheKey(username: string, repo: string): string {
    return `repo_data:${username}:${repo}`;
  }

  static async hasCache(username: string, repo: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const key = this.getCacheKey(username, repo);
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Cache check error: ${error}`, { prefix: 'Cache' });
      return false;
    }
  }

  static async saveToCache(username: string, repo: string, data: any): Promise<void> {
    try {
      const client = this.getClient();
      const key = this.getCacheKey(username, repo);
      await client.setex(key, CACHE_DURATION, data);
      logger.info(`Cached data for ${username}/${repo}`, { prefix: 'Cache' });
    } catch (error) {
      logger.error(`Cache save error: ${error}`, { prefix: 'Cache' });
    }
  }

  static async getFromCache(username: string, repo: string): Promise<any> {
    try {
      const client = this.getClient();
      const key = this.getCacheKey(username, repo);
      const data = await client.get(key);
      if (!data) return null;

      // Upstash automatically parses JSON, so we can just return it
      return data;
    } catch (error) {
      logger.error(`Cache retrieval error: ${error}`, { prefix: 'Cache' });
      return null;
    }
  }

  static async clearCache(username: string, repo: string): Promise<void> {
    try {
      const client = this.getClient();
      const key = this.getCacheKey(username, repo);
      await client.del(key);
      logger.info(`Cleared cache for ${username}/${repo}`, { prefix: 'Cache' });
    } catch (error) {
      logger.error(`Cache clear error: ${error}`, { prefix: 'Cache' });
    }
  }
}
