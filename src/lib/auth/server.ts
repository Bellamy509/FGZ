import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "lib/db/pg/db.pg";
import { headers } from "next/headers";
import { toast } from "sonner";
import {
  AccountSchema,
  SessionSchema,
  UserSchema,
  VerificationSchema,
} from "lib/db/pg/schema.pg";
import {
  sendVerificationEmailWithSupabase,
  logEmailVerification,
} from "@/lib/email/supabase-email";

import logger from "logger";
import { redirect } from "next/navigation";

export const auth = betterAuth({
  plugins: [nextCookies()],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: UserSchema,
      session: SessionSchema,
      account: AccountSchema,
      verification: VerificationSchema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.DISABLE_SIGN_UP ? true : false,
    requireEmailVerification: true, // ✅ Activer la vérification
    autoSignIn: false, // Pas de connexion auto avant vérification
    minPasswordLength: 8,
  },

  // ✅ Ajouter cette nouvelle section
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 heure
    sendVerificationEmail: async ({ user, url, token: _token }, _request) => {
      try {
        await sendVerificationEmailWithSupabase({
          email: user.email,
          verificationUrl: url,
          userName: user.name || "Utilisateur",
        });

        await logEmailVerification(user.email, "sent");
        console.log(`✅ Email de vérification envoyé à ${user.email}`);
      } catch (error) {
        await logEmailVerification(user.email, "failed");
        console.error(`❌ Erreur lors de l'envoi à ${user.email}:`, error);
        // Afficher le lien en fallback
        console.log(`🔗 LIEN DE VÉRIFICATION : ${url}`);
      }
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  advanced: {
    useSecureCookies:
      process.env.NO_HTTPS == "1"
        ? false
        : process.env.NODE_ENV === "production",
    database: {
      generateId: false,
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["google", "github"],
    },
  },
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});

export const getSession = async () => {
  "use server";
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch((e) => {
      logger.error(e);
      return null;
    });
  if (!session) {
    logger.error("No session found");
    redirect("/sign-in");
  }
  return session!;
};
