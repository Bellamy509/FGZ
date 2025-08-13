import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.pg";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = drizzle(pool, { schema });

// Export schemas for type inference
export const insertUserCreditsSchema = createInsertSchema(schema.userCredits);
export const selectUserCreditsSchema = createSelectSchema(schema.userCredits);

export type UserCredits = typeof schema.userCredits.$inferSelect;
export type NewUserCredits = typeof schema.userCredits.$inferInsert;
