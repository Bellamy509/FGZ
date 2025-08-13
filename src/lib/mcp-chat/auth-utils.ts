import "server-only";

import { getEffectiveSession as getBetterAuthSession } from "./auth/server";
import {
  isAuthDisabled,
  isPersistenceDisabled,
} from "@/lib/mcp-chat/constants";
import { createGuestSession } from "@/lib/mcp-chat/utils";

// Shared helper for API routes to get effective session
// Mise à jour pour utiliser better-auth
export async function getEffectiveSession() {
  // Nouveau: Vérifier si on veut forcer l'authentification unifiée
  const forceUnifiedAuth = process.env.FORCE_UNIFIED_AUTH === "true";

  if (isAuthDisabled && !forceUnifiedAuth) {
    // In dev mode with auth disabled, always return a guest session
    console.log("🔧 Mode développement: Utilisation de l'utilisateur test");
    return createGuestSession();
  }

  // Utiliser la nouvelle méthode better-auth
  console.log("🔗 Mode authentification unifiée: Utilisation de better-auth");
  return await getBetterAuthSession();
}

// Helper to check if we should persist data to database
export function shouldPersistData() {
  return !isPersistenceDisabled;
}
