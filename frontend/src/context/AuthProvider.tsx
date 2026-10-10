import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './authContext';
import { getAuthToken, setAuthToken, clearAuthToken, request, ApiError } from '../api/client';

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
        throw new Error('Invalid username or password.', { cause: err });
      }
      throw new Error('Login failed. Please check your credentials or network.', { cause: err });
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
