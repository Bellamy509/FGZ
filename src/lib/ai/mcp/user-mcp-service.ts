import { mcpRepository } from "lib/db/repository";
import { MCPClientsManager } from "./create-mcp-clients-manager";
import { MCPServerConfig } from "app-types/mcp";

export class UserMCPService {
  constructor(private manager: MCPClientsManager) {}

  async getUserServers(userId: string) {
    return mcpRepository.getUserServers(userId);
  }

  async connectUserServer(
    userId: string,
    serverId: string,
    config: MCPServerConfig,
  ) {
    // Save user-specific configuration
    const existingConfig = await mcpRepository.getUserServerConfig(
      userId,
      serverId,
    );
    if (existingConfig) {
      await mcpRepository.updateUserServer(userId, serverId, config);
    } else {
      await mcpRepository.saveUserServer(userId, serverId, config);
    }

    // Get server details
    const server = await mcpRepository.selectById(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    // Connect client with user-specific configuration
    return this.manager.addClient(serverId, server.name, config, userId);
  }

  async disconnectUserServer(userId: string, serverId: string) {
    // Remove user-specific configuration
    await mcpRepository.deleteUserServer(userId, serverId);

    // Disconnect client
    await this.manager.removeClient(serverId, userId);
  }

  async getUserServerConfig(userId: string, serverId: string) {
    return mcpRepository.getUserServerConfig(userId, serverId);
  }

  async getUserClient(userId: string, serverId: string) {
    return this.manager.getUserClient(userId, serverId);
  }

  async getUserClients(userId: string) {
    return this.manager.getUserClients(userId);
  }
}
