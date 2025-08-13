ALTER TABLE "mcp_servers" ADD COLUMN IF NOT EXISTS "user_id" text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS "mcp_servers_user_id_idx" ON "mcp_servers" ("user_id"); 