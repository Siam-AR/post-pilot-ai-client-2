"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "./api";
import type { AuthResponse, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (data: Record<string, unknown>) => Promise<AuthResponse>;
  login: (data: Record<string, unknown>) => Promise<AuthResponse>;
  googleLogin: (data: Record<string, unknown>) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          setToken(savedToken);
          const response = await authAPI.getUser();
          const userData =
            (response as { user?: User })?.user || (response as User);
          setUser(userData || null);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const normalizeAuthResponse = (
    response: AuthResponse | { data?: AuthResponse },
  ): AuthResponse => {
    if (response && typeof response === "object" && "data" in response) {
      return response.data || (response as AuthResponse);
    }
    return response as AuthResponse;
  };

  const normalizeUserResponse = (
    response: { user?: User } | User,
  ): User | null => {
    if (!response) {
      return null;
    }
    return (response as { user?: User }).user || (response as User);
  };

  const register = async (
    data: Record<string, unknown>,
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.register(data);
      const authResult = normalizeAuthResponse(response);
      const authToken = authResult.token || "";

      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
        try {
          const userResponse = await authAPI.getUser();
          setUser(normalizeUserResponse(userResponse));
        } catch {
          setUser(authResult.user || null);
        }
      } else {
        setUser(authResult.user || null);
      }

      return authResult;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      throw err;
    }
  };

  const login = async (
    data: Record<string, unknown>,
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.login(data);
      const authResult = normalizeAuthResponse(response);
      const authToken = authResult.token || "";

      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
        try {
          const userResponse = await authAPI.getUser();
          setUser(normalizeUserResponse(userResponse));
        } catch {
          setUser(authResult.user || null);
        }
      } else {
        setUser(authResult.user || null);
      }

      return authResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const googleLogin = async (
    data: Record<string, unknown>,
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await authAPI.googleLogin(data);
      const authResult = normalizeAuthResponse(response);
      const authToken = authResult.token || "";

      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
        try {
          const userResponse = await authAPI.getUser();
          setUser(normalizeUserResponse(userResponse));
        } catch {
          setUser(authResult.user || null);
        }
      } else {
        setUser(authResult.user || null);
      }

      return authResult;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Google login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) {
      throw new Error("Please enter your email address.");
    }

    await Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setError(null);
      await authAPI.updateUser(data);
      setUser((currentUser) =>
        currentUser ? { ...currentUser, ...data } : currentUser,
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Update failed";
      setError(errorMsg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        googleLogin,
        forgotPassword,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
