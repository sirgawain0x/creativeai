// File: /swarm/shared/ownership/core.ts
// Updated to use world metadata instead of cache
import { createUniqueUuid } from './entities';
import { logger } from './logger';
import { Role } from './types';
/**
 * Gets a user's role from world metadata
 */
/**
 * Retrieve the server role of a specified user entity within a given server.
 *
 * @param {IAgentRuntime} runtime - The runtime object containing necessary configurations and services.
 * @param {string} entityId - The unique identifier of the user entity.
 * @param {string} serverId - The unique identifier of the server.
 * @returns {Promise<Role>} The role of the user entity within the server, resolved as a Promise.
 */
export async function getUserServerRole(runtime, entityId, serverId) {
  try {
    const worldId = createUniqueUuid(runtime, serverId);
    const world = await runtime.getWorld(worldId);
    if (!world || !world.metadata?.roles) {
      return Role.NONE;
    }
    if (world.metadata.roles[entityId]) {
      return world.metadata.roles[entityId];
    }
    // Also check original ID format
    if (world.metadata.roles[entityId]) {
      return world.metadata.roles[entityId];
    }
    return Role.NONE;
  } catch (error) {
    logger.error(`Error getting user role: ${error}`);
    return Role.NONE;
  }
}
/**
 * Finds a server where the given user is the owner
 */
export async function findWorldForOwner(runtime, entityId) {
  try {
    if (!entityId) {
      logger.error('User ID is required to find server');
      return null;
    }
    // Get all worlds for this agent
    const worlds = await runtime.getAllWorlds();
    if (!worlds || worlds.length === 0) {
      logger.info('No worlds found for this agent');
      return null;
    }
    // Find world where the user is the owner
    for (const world of worlds) {
      if (world.metadata?.ownership?.ownerId === entityId) {
        return world;
      }
    }
    logger.debug(`No server found for owner ${entityId}`);
    return null;
  } catch (error) {
    logger.error(`Error finding server for owner: ${error}`);
    return null;
  }
}
//# sourceMappingURL=roles.js.map
