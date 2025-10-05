import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    void this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.cacheManager.set('test:connection', 'ok', 1000);
      const result = await this.cacheManager.get('test:connection');
      if (result === 'ok') {
        console.log('✅ Redis connection successful');
        await this.cacheManager.del('test:connection');
      } else {
        console.warn('⚠️ Redis connection test failed');
      }
    } catch (error) {
      console.error('❌ Redis connection error:', error);
    }
  }

  async setUserSession(userId: string, sessionData: any): Promise<void> {
    const key = `session:${userId}`;
    await this.cacheManager.set(key, sessionData);
  }

  async getUserSession(userId: string): Promise<any> {
    const key = `session:${userId}`;
    return await this.cacheManager.get(key);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.cacheManager.del(key);
  }

  async setRoutesCache(key: string, data: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, data, ttl || 60 * 60 * 1000);
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  }

  async getRoutesCache<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get(key);
      return result as T | null;
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  async deleteRoutesCache(pattern: string): Promise<void> {
    const keys = await this.getKeysByPattern(pattern);
    if (keys.length > 0) {
      await this.cacheManager.del(keys.join(','));
    }
  }

  async setUserCache(userId: string, userData: any): Promise<void> {
    const key = `user:${userId}`;
    await this.cacheManager.set(key, userData);
  }

  async getUserCache(userId: string): Promise<any> {
    const key = `user:${userId}`;
    return await this.cacheManager.get(key);
  }

  async deleteUserCache(userId: string): Promise<void> {
    const key = `user:${userId}`;
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  private async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      // Attempt to access the Redis client in a type-safe way
      const store = (
        this.cacheManager as {
          store?: {
            client?: { keys?: (pattern: string) => Promise<string[]> };
          };
        }
      ).store;
      if (store?.client?.keys) {
        const keys = await store.client.keys(pattern);
        if (Array.isArray(keys)) {
          return keys;
        }
      }
      return [];
    } catch (error) {
      console.warn('Could not get keys by pattern:', error);
      return [];
    }
  }

  async clearAllRoutesCache(): Promise<void> {
    try {
      await this.deleteRoutesCache('routes:*');
      await this.deleteRoutesCache('route:*');
      await this.deleteRoutesCache('*stop*');
    } catch (error) {
      this.logger.warn('Error clearing all routes cache:', error);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set: ${key}`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      this.logger.debug(`Cache ${result ? 'hit' : 'miss'}: ${key}`);
      return result || null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.getKeysByPattern(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.del(key)));
        this.logger.debug(
          `Cache invalidated for pattern: ${pattern} (${keys.length} keys)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Cache invalidation error for pattern ${pattern}:`,
        error,
      );
    }
  }

  static generateRouteKey(id: string): string {
    return `route:${id}`;
  }

  static generateRoutesListKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `routes:list:${sortedParams}`;
  }

  static generateUserKey(id: string): string {
    return `user:${id}`;
  }

  static generateUserSessionKey(id: string): string {
    return `session:${id}`;
  }

  static generateFavoritesKey(userId: string): string {
    return `favorites:${userId}`;
  }
}
