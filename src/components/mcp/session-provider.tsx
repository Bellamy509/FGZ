"use client";

import { createContext, useContext } from "react";
import { GuestSession } from "@/types/mcp-chat/user";

type AuthContextType = {
  isAuthDisabled: boolean;
  isPersistenceDisabled: boolean;
  guestSession?: GuestSession;
};

const AuthContext = createContext<AuthContextType>({
  isAuthDisabled: false,
  isPersistenceDisabled: false,
});

/**
 * SessionProvider provides context for development mode features like disabled auth and persistence.
 *
 * Better-auth doesn't require a session provider like NextAuth, so this is simplified
 * to only provide development mode context.
 */
export function SessionProvider({
  children,
  isAuthDisabled,
  isPersistenceDisabled,
  guestSession,
}: {
  children: React.ReactNode;
  isAuthDisabled: boolean;
  isPersistenceDisabled: boolean;
  guestSession?: GuestSession;
}) {
  return (
    <AuthContext.Provider
      value={{ isAuthDisabled, isPersistenceDisabled, guestSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
