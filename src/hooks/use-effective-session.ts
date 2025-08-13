"use client";

import { useAuthContext } from "@/components/mcp/session-provider";
import { SESSION_DURATION_MS } from "@/lib/mcp-chat/constants";
import { authClient } from "@/lib/mcp-chat/auth/client";

/**
 * Hook that provides an "effective" session - either the real better-auth session
 * or a guest session when auth is disabled.
 *
 * This abstraction allows components to use the same session interface regardless
 * of whether auth is enabled or disabled, making development easier while keeping
 * the same code paths for production.
 *
 * @returns Session data compatible with better-auth's session format
 */
export function useEffectiveSession() {
  const { data: session, isPending } = authClient.useSession();
  const { isAuthDisabled, guestSession } = useAuthContext();

  // If auth is disabled, always return the guest session
  if (isAuthDisabled && guestSession) {
    return {
      data: {
        ...guestSession,
        expires: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      },
      status: "authenticated" as const,
      update: () => Promise.resolve(null),
    };
  }

  // Convert better-auth status to NextAuth compatible status
  const status = isPending
    ? "loading"
    : session
      ? "authenticated"
      : "unauthenticated";

  // Otherwise return the real session
  return {
    data: session,
    status: status as "loading" | "authenticated" | "unauthenticated",
    update: () => Promise.resolve(null),
  };
}
