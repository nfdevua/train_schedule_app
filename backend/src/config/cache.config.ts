import { CacheConfig } from 'src/shared/interfaces/cache-config.interface';

export const CACHE_CONFIG: CacheConfig = {
  routes: {
    single: 30 * 60 * 1000, // 30 minutes
    list: 10 * 60 * 1000, // 10 minutes
  },
  users: {
    profile: 60 * 60 * 1000, // 1 hour
    session: 24 * 60 * 60 * 1000, // 24 hours
  },
  favorites: {
    list: 15 * 60 * 1000, // 15 minutes
  },
};

export const CACHE_KEYS = {
  ROUTES: {
    SINGLE: (id: string) => `route:${id}`,
    LIST: (params: Record<string, any>) => {
      const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}:${params[key]}`)
        .join('|');
      return `routes:list:${sortedParams}`;
    },
    PATTERN: 'route:*',
    LIST_PATTERN: 'routes:list:*',
  },
  USERS: {
    PROFILE: (id: string) => `user:${id}`,
    SESSION: (id: string) => `session:${id}`,
    PATTERN: 'user:*',
    SESSION_PATTERN: 'session:*',
  },
  FAVORITES: {
    LIST: (userId: string) => `favorites:${userId}`,
    PATTERN: 'favorites:*',
  },
};
