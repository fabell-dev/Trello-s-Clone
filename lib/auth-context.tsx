"use client";

import { createContext, useContext, ReactNode } from "react";

type User = {
  sub?: string;
  email?: string;
  [key: string]: any;
} | null;

type AuthContextType = {
  user: User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
