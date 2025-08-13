import "server-only";
import { auth as mainAuth } from "@/lib/auth/server";
import { headers } from "next/headers";

// Réexporter l'auth de l'app principale pour compatibilité
export const auth = mainAuth;

// Version compatible avec l'app MCP qui retourne session ou null (sans redirect)
export const getSession = async () => {
  "use server";
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => null);

  return session;
};

// Version compatible avec l'ancien système qui retourne session ou null
export const getEffectiveSession = async () => {
  const session = await getSession();

  // Si l'auth est désactivée, retourner une session guest
  if (process.env.DISABLE_AUTH === "true") {
    return {
      user: {
        id: process.env.EXTERNAL_USER_ID || "test-user-123",
        name: "Guest User",
        email: "guest@example.com",
      },
      session: null,
    };
  }

  return session;
};
