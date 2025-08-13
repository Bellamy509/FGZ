import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";

// Schémas de l'app principale pour l'authentification
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/pg-core";

// Schémas compatibles avec better-auth (copiés de l'app principale)
export const UserSchema = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: text("password"),
  image: text("image"),
  preferences: json("preferences").default({}),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const SessionSchema = pgTable("session", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserSchema.id, { onDelete: "cascade" }),
});

export const AccountSchema = pgTable("account", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserSchema.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const VerificationSchema = pgTable("verification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// Connexion à la base de données principale via MAIN_APP_POSTGRES_URL
// Fallback vers POSTGRES_URL si MAIN_APP_POSTGRES_URL n'est pas définie
const databaseUrl =
  process.env.MAIN_APP_POSTGRES_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("MAIN_APP_POSTGRES_URL or POSTGRES_URL must be set");
}

// Utiliser postgres au lieu de Pool pour éviter les conflits de types
const client = postgres(databaseUrl);

export const sharedDb = drizzle(client, {
  schema: {
    user: UserSchema,
    session: SessionSchema,
    account: AccountSchema,
    verification: VerificationSchema,
  },
});

export type User = typeof UserSchema.$inferSelect;
export type Session = typeof SessionSchema.$inferSelect;
export type Account = typeof AccountSchema.$inferSelect;
export type Verification = typeof VerificationSchema.$inferSelect;
