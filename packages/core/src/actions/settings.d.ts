import { type Action, type IAgentRuntime, type WorldSettings } from '../types';
/**
 * Gets settings state from world metadata
 */
/**
 * Retrieves the settings for a specific world from the database.
 * @param {IAgentRuntime} runtime - The Agent Runtime instance.
 * @param {string} serverId - The ID of the server.
 * @returns {Promise<WorldSettings | null>} The settings of the world, or null if not found.
 */
export declare function getWorldSettings(
  runtime: IAgentRuntime,
  serverId: string
): Promise<WorldSettings | null>;
/**
 * Updates settings state in world metadata
 */
export declare function updateWorldSettings(
  runtime: IAgentRuntime,
  serverId: string,
  worldSettings: WorldSettings
): Promise<boolean>;
/**
 * Enhanced settings action with improved state management and logging
 * Updated to use world metadata instead of cache
 */
declare const updateSettingsAction: Action;
export default updateSettingsAction;
//# sourceMappingURL=settings.d.ts.map
