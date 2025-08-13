CREATE TABLE IF NOT EXISTS "mcp_tool_customizations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "server_id" uuid NOT NULL REFERENCES "mcp_servers"("id") ON DELETE CASCADE,
    "tool_id" text NOT NULL,
    "config" jsonb NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "mcp_tool_customizations_server_tool_idx" ON "mcp_tool_customizations" ("server_id", "tool_id"); 