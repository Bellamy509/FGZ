import type {
  MCPServerConfig,
  McpServerInsert,
  McpServerSelect,
  VercelAIMcpTool,
} from "app-types/mcp";
import { createMCPClient, type MCPClient } from "./create-mcp-client";
import { Locker } from "lib/utils";
import { safe } from "ts-safe";
import { McpServerSchema } from "lib/db/pg/schema.pg";
import { createMCPToolId } from "./mcp-tool-id";
/**
 * Interface for storage of MCP server configurations.
 * Implementations should handle persistent storage of server configs.
 *
 * IMPORTANT: When implementing this interface, be aware that:
 * - Storage can be modified externally (e.g., file edited manually)
 * - Concurrent modifications may occur from multiple processes
 * - Implementations should either handle these scenarios or document limitations
 */
export interface MCPConfigStorage {
  init(manager: MCPClientsManager): Promise<void>;
  loadAll(): Promise<McpServerSelect[]>;
  save(server: McpServerInsert): Promise<McpServerSelect>;
  delete(id: string): Promise<void>;
  has(id: string): Promise<boolean>;
  get(id: string): Promise<McpServerSelect | null>;
  getByName?(name: string): Promise<McpServerSelect | null>;
}

export class MCPClientsManager {
  protected clients = new Map<
    string,
    {
      client: MCPClient;
      name: string;
      userId?: string;
    }
  >();
  private initializedLock = new Locker();

  constructor(
    private storage?: MCPConfigStorage,
    private autoDisconnectSeconds: number = 60 * 30, // 30 minutes
  ) {
    process.on("SIGINT", this.cleanup.bind(this));
    process.on("SIGTERM", this.cleanup.bind(this));
  }

  async init() {
    return safe(() => this.initializedLock.lock())
      .ifOk(() => this.cleanup())
      .ifOk(async () => {
        if (this.storage) {
          await this.storage.init(this);
          const configs = await this.storage.loadAll();
          await Promise.all(
            configs.map(({ id, name, config }) =>
              this.addClient(id, name, config),
            ),
          );
        }
      })
      .watch(() => this.initializedLock.unlock())
      .unwrap();
  }

  /**
   * Returns all tools from all clients as a flat object
   */
  tools(): Record<string, VercelAIMcpTool> {
    return Object.fromEntries(
      Array.from(this.clients.entries())
        .filter(([_, { client }]) => client.getInfo().toolInfo.length > 0)
        .flatMap(([id, { client }]) =>
          Object.entries(client.tools).map(([name, tool]) => [
            createMCPToolId(client.getInfo().name, name),
            {
              ...tool,
              _originToolName: name,
              __$ref__: "mcp",
              _mcpServerName: client.getInfo().name,
              _mcpServerId: id,
            },
          ]),
        ),
    );
  }
  /**
   * Creates and adds a new client instance to memory only (no storage persistence)
   */
  async addClient(
    id: string,
    name: string,
    serverConfig: MCPServerConfig,
    userId?: string,
  ) {
    const clientId = userId ? `${userId}:${id}` : id;

    if (this.clients.has(clientId)) {
      const prevClient = this.clients.get(clientId)!;
      void prevClient.client.disconnect();
    }

    const client = createMCPClient(name, serverConfig, {
      autoDisconnectSeconds: this.autoDisconnectSeconds,
    });

    this.clients.set(clientId, { client, name, userId });
    return client.connect();
  }

  /**
   * Persists a new client configuration to storage and adds the client instance to memory
   */
  async persistClient(
    server: typeof McpServerSchema.$inferInsert,
    userId?: string,
  ) {
    let id = server.name;
    if (this.storage) {
      const entity = await this.storage.save(server);
      id = entity.id;
    }
    return this.addClient(id, server.name, server.config, userId);
  }

  /**
   * Removes a client by name or UUID, disposing resources and removing from storage
   */
  async removeClient(idOrName: string, userId?: string) {
    let uuid = idOrName;

    // If not a UUID, try to resolve to UUID
    if (!isValidUUID(idOrName)) {
      // Search in memory
      for (const [id, { client }] of this.clients.entries()) {
        if (client.getInfo().name === idOrName) {
          uuid = id;
          break;
        }
      }
      // If storage active and getByName available, search UUID by name
      if (
        uuid === idOrName &&
        this.storage &&
        typeof this.storage.getByName === "function"
      ) {
        const server = await this.storage.getByName(idOrName);
        if (server && isValidUUID(server.id)) {
          uuid = server.id;
        }
      }
    }

    // If we still don't have a UUID, log and refuse
    if (!isValidUUID(uuid)) {
      console.warn(
        `[MCP] Refusing to delete client with unresolved id or name: "${idOrName}"`,
      );
      return;
    }

    const clientId = userId ? `${userId}:${uuid}` : uuid;

    // Delete from storage if active
    if (this.storage) {
      if (await this.storage.has(uuid)) {
        await this.storage.delete(uuid);
      }
    }

    // Delete from memory
    const client = this.clients.get(clientId);
    this.clients.delete(clientId);
    if (client) {
      void client.client.disconnect();
    }
  }

  /**
   * Refreshes an existing client with a new configuration or its existing config
   */
  async refreshClient(id: string, userId?: string) {
    const clientId = userId ? `${userId}:${id}` : id;
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.storage) {
      const server = await this.storage.get(id);
      if (!server) return;
      return this.addClient(id, server.name, server.config, userId);
    }
  }

  async cleanup() {
    const clients = Array.from(this.clients.values());
    await Promise.all(clients.map((c) => c.client.disconnect()));
    this.clients.clear();
  }

  async getClients() {
    return Array.from(this.clients.entries()).map((entry) => ({
      id: entry[0],
      ...entry[1],
    }));
  }

  async getClient(id: string) {
    return this.clients.get(id);
  }

  async getUserClient(userId: string, serverId: string) {
    const clientId = `${userId}:${serverId}`;
    return this.clients.get(clientId);
  }

  async getUserClients(userId: string) {
    return Array.from(this.clients.entries())
      .filter(([_, client]) => client.userId === userId)
      .map((entry) => ({
        id: entry[0],
        ...entry[1],
      }));
  }
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id,
  );
}

export function createMCPClientsManager(
  storage?: MCPConfigStorage,
  autoDisconnectSeconds: number = 60 * 30, // 30 minutes
): MCPClientsManager {
  return new MCPClientsManager(storage, autoDisconnectSeconds);
}
