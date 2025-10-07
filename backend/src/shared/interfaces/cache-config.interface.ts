export interface CacheConfig {
  routes: {
    single: number;
    list: number;
  };
  users: {
    profile: number;
    session: number;
  };
  favorites: {
    list: number;
  };
}
