import { type IAgentRuntime, Service, type UUID } from '../types';
interface ActionTracker {
  actionId: UUID;
  actionName: string;
  startTime: number;
  completed: boolean;
  error?: Error;
}
interface EvaluatorTracker {
  evaluatorId: UUID;
  evaluatorName: string;
  startTime: number;
  completed: boolean;
  error?: Error;
}
/**
 * Represents a service that allows the agent to interact in a scenario testing environment.
 * The agent can create rooms, send messages, and communicate with other agents in a live interactive testing environment.
 * @extends Service
 */
export declare class ScenarioService extends Service {
  protected runtime: IAgentRuntime;
  static serviceType: string;
  capabilityDescription: string;
  private messageHandlers;
  private worlds;
  private activeActions;
  private activeEvaluators;
  /**
   * Constructor for creating a new instance of the class.
   *
   * @param runtime - The IAgentRuntime instance to be passed to the constructor.
   */
  constructor(runtime: IAgentRuntime);
  private setupEventListeners;
  /**
   * Start the scenario service with the given runtime.
   * @param {IAgentRuntime} runtime - The agent runtime
   * @returns {Promise<ScenarioService>} - The started scenario service
   */
  static start(runtime: IAgentRuntime): Promise<ScenarioService>;
  /**
   * Stops the Scenario service associated with the given runtime.
   *
   * @param {IAgentRuntime} runtime The runtime to stop the service for.
   * @throws {Error} When the Scenario service is not found.
   */
  static stop(runtime: IAgentRuntime): Promise<void>;
  /**
   * Asynchronously stops the current process by clearing all message handlers and worlds.
   */
  stop(): Promise<void>;
  /**
   * Creates a new world with the specified name and owner.
   * @param name The name of the world
   * @param ownerName The name of the world owner
   * @returns The created world's ID
   */
  createWorld(name: string, ownerName: string): Promise<UUID>;
  /**
   * Creates a room in the specified world.
   * @param worldId The ID of the world to create the room in
   * @param name The name of the room
   * @returns The created room's ID
   */
  createRoom(worldId: UUID, name: string): Promise<UUID>;
  /**
   * Adds a participant to a room
   * @param worldId The world ID
   * @param roomId The room ID
   * @param participantId The participant's ID
   */
  addParticipant(worldId: UUID, roomId: UUID, participantId: UUID): Promise<void>;
  /**
   * Sends a message in a specific room
   * @param sender The runtime of the sending agent
   * @param worldId The world ID
   * @param roomId The room ID
   * @param text The message text
   */
  sendMessage(sender: IAgentRuntime, worldId: UUID, roomId: UUID, text: string): Promise<void>;
  /**
   * Waits for all active actions and evaluators to complete
   * @param timeout Maximum time to wait in milliseconds
   * @returns True if all completed successfully, false if timeout occurred
   */
  waitForCompletion(timeout?: number): Promise<boolean>;
  /**
   * Gets the current state of all active actions and evaluators
   */
  getActiveState(): {
    actions: ActionTracker[];
    evaluators: EvaluatorTracker[];
  };
  /**
   * Cleans up the scenario state
   */
  cleanup(): Promise<void>;
}
/**
 * Asynchronously starts the specified scenario for the given list of agent runtimes.
 * @param {IAgentRuntime[]} members - The list of agent runtimes participating in the scenario.
 * @returns {Promise<void>} - A promise that resolves when all scenarios have been executed.
 */
export declare function startScenario(members: IAgentRuntime[]): Promise<void>;
export {};
//# sourceMappingURL=scenario.d.ts.map
