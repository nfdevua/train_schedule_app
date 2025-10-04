import Cookies from "js-cookie";

const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const cookieUtils = {
  // Auth token
  setToken: (token: string) => {
    Cookies.set("access_token", token, COOKIE_OPTIONS);
  },

  getToken: (): string | undefined => {
    return Cookies.get("access_token");
  },

  removeToken: () => {
    Cookies.remove("access_token");
  },

  // Clear all auth data
  clearAuth: () => {
    Cookies.remove("access_token");
  },
};
