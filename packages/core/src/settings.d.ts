import type { IAgentRuntime, OnboardingConfig, World, WorldSettings } from './types';
/**
 * Updates settings state in world metadata
 */
export declare function updateWorldSettings(
  runtime: IAgentRuntime,
  serverId: string,
  worldSettings: WorldSettings
): Promise<boolean>;
/**
 * Gets settings state from world metadata
 */
export declare function getWorldSettings(
  runtime: IAgentRuntime,
  serverId: string
): Promise<WorldSettings | null>;
/**
 * Initializes settings configuration for a server
 */
export declare function initializeOnboarding(
  runtime: IAgentRuntime,
  world: World,
  config: OnboardingConfig
): Promise<WorldSettings | null>;
//# sourceMappingURL=settings.d.ts.map
