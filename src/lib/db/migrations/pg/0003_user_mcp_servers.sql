CREATE TABLE IF NOT EXISTS "user_mcp_servers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL,
    "server_id" uuid NOT NULL REFERENCES "mcp_servers"("id") ON DELETE CASCADE,
    "config" jsonb NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "user_mcp_servers_user_id_idx" ON "user_mcp_servers" ("user_id");
CREATE INDEX IF NOT EXISTS "user_mcp_servers_server_id_idx" ON "user_mcp_servers" ("server_id"); 