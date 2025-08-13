import { initMCPManager } from "./mcp-manager";
import { UserMCPService } from "./user-mcp-service";

export const userMCPService = new UserMCPService(
  globalThis.__mcpClientsManager__,
);

export { initMCPManager };
