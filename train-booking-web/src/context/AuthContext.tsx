// src/context/AuthContext.tsx
"use client"; // This context needs to be client-side

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/lib/types";
// import { verifyToken } from '@/lib/api'; // Optional: if you implement token verification

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial auth check state
  login: (newToken: string, userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser"); // Store user info too

      if (storedToken && storedUser) {
        // Optional but recommended: Verify token with backend here
        // const verifiedUser = await verifyToken(); // Call your verifyToken API function
        // if (verifiedUser) {
        //   setToken(storedToken);
        //   setUser(JSON.parse(storedUser)); // Or use verifiedUser data
        // } else {
        //   // Token is invalid or expired
        //   localStorage.removeItem('authToken');
        //   localStorage.removeItem('authUser');
        //   setToken(null);
        //   setUser(null);
        // }
        // --- Simplified version without backend verification ---
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // ----------------------------------------------------
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(userData)); // Store user info
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    // Optionally redirect to login or home page here using router if needed globally
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
