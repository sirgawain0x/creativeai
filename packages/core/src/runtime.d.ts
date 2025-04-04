import { ChannelType } from './types';
import type {
  Action,
  Agent,
  Character,
  Component,
  Entity,
  Evaluator,
  HandlerCallback,
  IAgentRuntime,
  IDatabaseAdapter,
  KnowledgeItem,
  Log,
  Memory,
  MemoryMetadata,
  ModelParamsMap,
  ModelResultMap,
  ModelTypeName,
  Participant,
  Plugin,
  Provider,
  Relationship,
  Room,
  Route,
  Service,
  ServiceTypeName,
  State,
  Task,
  TaskWorker,
  UUID,
  World,
} from './types';
/**
 * Interface for settings object with key-value pairs.
 */
interface Settings {
  [key: string]: string | undefined;
}
/**
 * Loads environment variables from the nearest .env file in Node.js
 * or returns configured settings in browser
 * @returns {Settings} Environment variables object
 */
export declare function loadEnvConfig(): Settings;
export declare class Semaphore {
  private permits;
  private waiting;
  constructor(count: number);
  acquire(): Promise<void>;
  release(): void;
}
/**
 * Represents the runtime environment for an agent, handling message processing,
 * action registration, and interaction with external services like OpenAI and Supabase.
 */
/**
 * Represents the runtime environment for an agent.
 * @class
 * @implements { IAgentRuntime }
 * @property { number } #conversationLength - The maximum length of a conversation.
 * @property { UUID } agentId - The unique identifier for the agent.
 * @property { Character } character - The character associated with the agent.
 * @property { IDatabaseAdapter } adapter - The adapter for interacting with the database.
 * @property {Action[]} actions - The list of actions available to the agent.
 * @property {Evaluator[]} evaluators - The list of evaluators for decision making.
 * @property {Provider[]} providers - The list of providers for external services.
 * @property {Plugin[]} plugins - The list of plugins to extend functionality.
 */
export declare class AgentRuntime implements IAgentRuntime {
  #private;
  readonly agentId: UUID;
  readonly character: Character;
  adapter: IDatabaseAdapter;
  readonly actions: Action[];
  readonly evaluators: Evaluator[];
  readonly providers: Provider[];
  readonly plugins: Plugin[];
  events: Map<string, ((params: any) => Promise<void>)[]>;
  stateCache: Map<
    `${string}-${string}-${string}-${string}-${string}`,
    {
      values: {
        [key: string]: any;
      };
      data: {
        [key: string]: any;
      };
      text: string;
    }
  >;
  readonly fetch: typeof fetch;
  services: Map<ServiceTypeName, Service>;
  models: Map<string, ((runtime: IAgentRuntime, params: any) => Promise<any>)[]>;
  routes: Route[];
  private taskWorkers;
  private eventHandlers;
  private runtimeLogger;
  private knowledgeProcessingSemaphore;
  private settings;
  constructor(opts: {
    conversationLength?: number;
    agentId?: UUID;
    character?: Character;
    plugins?: Plugin[];
    fetch?: typeof fetch;
    adapter?: IDatabaseAdapter;
    events?: {
      [key: string]: ((params: any) => void)[];
    };
    ignoreBootstrap?: boolean;
  });
  /**
   * Registers a plugin with the runtime and initializes its components
   * @param plugin The plugin to register
   */
  registerPlugin(plugin: Plugin): Promise<void>;
  getAllServices(): Map<ServiceTypeName, Service>;
  stop(): Promise<void>;
  initialize(): Promise<void>;
  private handleProcessingError;
  private checkExistingKnowledge;
  getKnowledge(message: Memory): Promise<KnowledgeItem[]>;
  addKnowledge(
    item: KnowledgeItem,
    options?: {
      targetTokens: number;
      overlap: number;
      modelContextSize: number;
    }
  ): Promise<void>;
  processCharacterKnowledge(items: string[]): Promise<void>;
  setSetting(key: string, value: string | boolean | null | any, secret?: boolean): void;
  getSetting(key: string): string | boolean | null | any;
  /**
   * Get the number of messages that are kept in the conversation buffer.
   * @returns The number of recent messages to be kept in memory.
   */
  getConversationLength(): number;
  registerDatabaseAdapter(adapter: IDatabaseAdapter): void;
  /**
   * Register a provider for the agent to use.
   * @param provider The provider to register.
   */
  registerProvider(provider: Provider): void;
  /**
   * Register an action for the agent to perform.
   * @param action The action to register.
   */
  registerAction(action: Action): void;
  /**
   * Register an evaluator to assess and guide the agent's responses.
   * @param evaluator The evaluator to register.
   */
  registerEvaluator(evaluator: Evaluator): void;
  /**
   * Register a context provider to provide context for message generation.
   * @param provider The context provider to register.
   */
  registerContextProvider(provider: Provider): void;
  /**
   * Process the actions of a message.
   * @param message The message to process.
   * @param responses The array of response memories to process actions from.
   * @param state Optional state object for the action processing.
   * @param callback Optional callback handler for action results.
   */
  processActions(
    message: Memory,
    responses: Memory[],
    state?: State,
    callback?: HandlerCallback
  ): Promise<void>;
  /**
   * Evaluate the message and state using the registered evaluators.
   * @param message The message to evaluate.
   * @param state The state of the agent.
   * @param didRespond Whether the agent responded to the message.~
   * @param callback The handler callback
   * @returns The results of the evaluation.
   */
  evaluate(
    message: Memory,
    state: State,
    didRespond?: boolean,
    callback?: HandlerCallback,
    responses?: Memory[]
  ): Promise<Evaluator[]>;
  ensureConnection({
    entityId,
    roomId,
    userName,
    name,
    source,
    type,
    channelId,
    serverId,
    worldId,
  }: {
    entityId: UUID;
    roomId: UUID;
    userName?: string;
    name?: string;
    source?: string;
    type?: ChannelType;
    channelId?: string;
    serverId?: string;
    worldId?: UUID;
  }): Promise<void>;
  /**
   * Ensures a participant is added to a room, checking that the entity exists first
   */
  ensureParticipantInRoom(entityId: UUID, roomId: UUID): Promise<void>;
  removeParticipant(entityId: UUID, roomId: UUID): Promise<boolean>;
  getParticipantsForEntity(entityId: UUID): Promise<Participant[]>;
  getParticipantsForRoom(roomId: UUID): Promise<UUID[]>;
  addParticipant(entityId: UUID, roomId: UUID): Promise<boolean>;
  /**
   * Ensure the existence of a world.
   */
  ensureWorldExists({ id, name, serverId, metadata }: World): Promise<void>;
  /**
   * Ensure the existence of a room between the agent and a user. If no room exists, a new room is created and the user
   * and agent are added as participants. The room ID is returned.
   * @param entityId - The user ID to create a room with.
   * @returns The room ID of the room between the agent and the user.
   * @throws An error if the room cannot be created.
   */
  ensureRoomExists({
    id,
    name,
    source,
    type,
    channelId,
    serverId,
    worldId,
    metadata,
  }: Room): Promise<void>;
  /**
   * Composes the agent's state by gathering data from enabled providers.
   * @param message - The message to use as context for state composition
   * @param filterList - Optional list of provider names to include, filtering out all others
   * @param includeList - Optional list of private provider names to include that would otherwise be filtered out
   * @returns A State object containing provider data, values, and text
   */
  composeState(
    message: Memory,
    filterList?: string[] | null, // only get providers that are in the filterList
    includeList?: string[] | null
  ): Promise<State>;
  getService<T extends Service>(service: ServiceTypeName): T | null;
  registerService(service: typeof Service): Promise<void>;
  registerModel(modelType: ModelTypeName, handler: (params: any) => Promise<any>): void;
  getModel(
    modelType: ModelTypeName
  ): ((runtime: IAgentRuntime, params: any) => Promise<any>) | undefined;
  /**
   * Use a model with strongly typed parameters and return values based on model type
   * @template T - The model type to use
   * @template R - The expected return type, defaults to the type defined in ModelResultMap[T]
   * @param {T} modelType - The type of model to use
   * @param {ModelParamsMap[T] | any} params - The parameters for the model, typed based on model type
   * @returns {Promise<R>} - The model result, typed based on the provided generic type parameter
   */
  useModel<T extends ModelTypeName, R = ModelResultMap[T]>(
    modelType: T,
    params: Omit<ModelParamsMap[T], 'runtime'> | any
  ): Promise<R>;
  registerEvent(event: string, handler: (params: any) => Promise<void>): void;
  getEvent(event: string): ((params: any) => Promise<void>)[] | undefined;
  emitEvent(event: string | string[], params: any): Promise<void>;
  ensureEmbeddingDimension(): Promise<void>;
  registerTaskWorker(taskHandler: TaskWorker): void;
  /**
   * Get a task worker by name
   */
  getTaskWorker(name: string): TaskWorker | undefined;
  get db(): any;
  init(): Promise<void>;
  close(): Promise<void>;
  getAgent(agentId: UUID): Promise<Agent | null>;
  getAgents(): Promise<Agent[]>;
  createAgent(agent: Partial<Agent>): Promise<boolean>;
  updateAgent(agentId: UUID, agent: Partial<Agent>): Promise<boolean>;
  deleteAgent(agentId: UUID): Promise<boolean>;
  ensureAgentExists(agent: Partial<Agent>): Promise<void>;
  getEntityById(entityId: UUID): Promise<Entity | null>;
  getEntitiesForRoom(roomId: UUID, includeComponents?: boolean): Promise<Entity[]>;
  createEntity(entity: Entity): Promise<boolean>;
  updateEntity(entity: Entity): Promise<void>;
  getComponent(
    entityId: UUID,
    type: string,
    worldId?: UUID,
    sourceEntityId?: UUID
  ): Promise<Component | null>;
  getComponents(entityId: UUID, worldId?: UUID, sourceEntityId?: UUID): Promise<Component[]>;
  createComponent(component: Component): Promise<boolean>;
  updateComponent(component: Component): Promise<void>;
  deleteComponent(componentId: UUID): Promise<void>;
  addEmbeddingToMemory(memory: Memory): Promise<Memory>;
  getMemories(params: {
    entityId?: UUID;
    agentId?: UUID;
    roomId?: UUID;
    count?: number;
    unique?: boolean;
    tableName: string;
    start?: number;
    end?: number;
  }): Promise<Memory[]>;
  getMemoryById(id: UUID): Promise<Memory | null>;
  getMemoriesByIds(ids: UUID[], tableName?: string): Promise<Memory[]>;
  getMemoriesByRoomIds(params: {
    tableName: string;
    roomIds: UUID[];
    limit?: number;
  }): Promise<Memory[]>;
  getCachedEmbeddings(params: {
    query_table_name: string;
    query_threshold: number;
    query_input: string;
    query_field_name: string;
    query_field_sub_name: string;
    query_match_count: number;
  }): Promise<
    {
      embedding: number[];
      levenshtein_score: number;
    }[]
  >;
  log(params: {
    body: {
      [key: string]: unknown;
    };
    entityId: UUID;
    roomId: UUID;
    type: string;
  }): Promise<void>;
  searchMemories(params: {
    embedding: number[];
    match_threshold?: number;
    count?: number;
    roomId?: UUID;
    unique?: boolean;
    tableName: string;
  }): Promise<Memory[]>;
  createMemory(memory: Memory, tableName: string, unique?: boolean): Promise<UUID>;
  updateMemory(
    memory: Partial<Memory> & {
      id: UUID;
      metadata?: MemoryMetadata;
    }
  ): Promise<boolean>;
  deleteMemory(memoryId: UUID): Promise<void>;
  deleteAllMemories(roomId: UUID, tableName: string): Promise<void>;
  countMemories(roomId: UUID, unique?: boolean, tableName?: string): Promise<number>;
  getLogs(params: {
    entityId: UUID;
    roomId?: UUID;
    type?: string;
    count?: number;
    offset?: number;
  }): Promise<Log[]>;
  deleteLog(logId: UUID): Promise<void>;
  createWorld(world: World): Promise<UUID>;
  getWorld(id: UUID): Promise<World | null>;
  getAllWorlds(): Promise<World[]>;
  updateWorld(world: World): Promise<void>;
  getRoom(roomId: UUID): Promise<Room | null>;
  createRoom({ id, name, source, type, channelId, serverId, worldId }: Room): Promise<UUID>;
  deleteRoom(roomId: UUID): Promise<void>;
  updateRoom(room: Room): Promise<void>;
  getRoomsForParticipant(entityId: UUID): Promise<UUID[]>;
  getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]>;
  getRooms(worldId: UUID): Promise<Room[]>;
  getParticipantUserState(roomId: UUID, entityId: UUID): Promise<'FOLLOWED' | 'MUTED' | null>;
  setParticipantUserState(
    roomId: UUID,
    entityId: UUID,
    state: 'FOLLOWED' | 'MUTED' | null
  ): Promise<void>;
  createRelationship(params: {
    sourceEntityId: UUID;
    targetEntityId: UUID;
    tags?: string[];
    metadata?: {
      [key: string]: any;
    };
  }): Promise<boolean>;
  updateRelationship(relationship: Relationship): Promise<void>;
  getRelationship(params: {
    sourceEntityId: UUID;
    targetEntityId: UUID;
  }): Promise<Relationship | null>;
  getRelationships(params: { entityId: UUID; tags?: string[] }): Promise<Relationship[]>;
  getCache<T>(key: string): Promise<T | undefined>;
  setCache<T>(key: string, value: T): Promise<boolean>;
  deleteCache(key: string): Promise<boolean>;
  createTask(task: Task): Promise<UUID>;
  getTasks(params: { roomId?: UUID; tags?: string[] }): Promise<Task[]>;
  getTask(id: UUID): Promise<Task | null>;
  getTasksByName(name: string): Promise<Task[]>;
  updateTask(id: UUID, task: Partial<Task>): Promise<void>;
  deleteTask(id: UUID): Promise<void>;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
}
export {};
//# sourceMappingURL=runtime.d.ts.map
