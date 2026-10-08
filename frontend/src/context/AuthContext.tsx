import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken, request, ApiError } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing token on mount
  useEffect(() => {
    async function validateSession() {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Probe GET /api/goals to verify stored credentials
        await request('/api/goals');
        setIsAuthenticated(true);
      } catch {
        clearAuthToken();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    validateSession();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    // 1. Temporarily set token in storage
    setAuthToken(username, password);

    try {
      // 2. Validate by probing the backend
      await request('/api/goals');
      setIsAuthenticated(true);
    } catch (err) {
      // 3. Clear invalid credentials on failure and propagate
      clearAuthToken();
      setIsAuthenticated(false);
      if (err instanceof ApiError && err.status === 401) {
        throw new Error('Invalid username or password.');
      }
      throw new Error('Login failed. Please check your credentials or network.');
    }
  };

  const logout = (): void => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}