interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const jwtUtils = {
  decodeToken: (token: string): JwtPayload | null => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];

      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);

      const decodedPayload = atob(paddedPayload);

      return JSON.parse(decodedPayload) as JwtPayload;
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  },

  getRoleFromToken: (token: string): string | null => {
    const payload = jwtUtils.decodeToken(token);
    return payload?.role || null;
  },

  getUserIdFromToken: (token: string): string | null => {
    const payload = jwtUtils.decodeToken(token);
    return payload?.sub || null;
  },

  isTokenExpired: (token: string): boolean => {
    const payload = jwtUtils.decodeToken(token);
    if (!payload?.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  isValidToken: (token: string): boolean => {
    if (!token) return false;

    const payload = jwtUtils.decodeToken(token);
    if (!payload) return false;

    if (jwtUtils.isTokenExpired(token)) return false;

    return !!(payload.sub && payload.role);
  },
};
