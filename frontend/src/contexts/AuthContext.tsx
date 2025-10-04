import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { cookieUtils } from "../utils/cookies";
import { jwtUtils } from "../utils/jwt";

interface AuthContextType {
  userRole: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string | null>(() => {
    // Инициализируем состояние из JWT токена
    const storedToken = cookieUtils.getToken();
    if (storedToken && jwtUtils.isValidToken(storedToken)) {
      return jwtUtils.getRoleFromToken(storedToken);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем токен при монтировании компонента
    const storedToken = cookieUtils.getToken();

    if (storedToken && jwtUtils.isValidToken(storedToken)) {
      const role = jwtUtils.getRoleFromToken(storedToken);
      setUserRole(role);
    } else {
      setUserRole(null);
      // Очищаем невалидный токен
      if (storedToken) {
        cookieUtils.clearAuth();
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    if (jwtUtils.isValidToken(token)) {
      const role = jwtUtils.getRoleFromToken(token);
      setUserRole(role);
      cookieUtils.setToken(token);
    }
  };

  const logout = () => {
    setUserRole(null);
    cookieUtils.clearAuth();
  };

  const isAdmin = userRole === "admin";

  const value = {
    userRole,
    login,
    logout,
    isAuthenticated: !!userRole,
    isAdmin,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
