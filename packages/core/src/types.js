/**
 * Helper function to safely cast a string to strongly typed UUID
 * @param id The string UUID to validate and cast
 * @returns The same UUID with branded type information
 */
export function asUUID(id) {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  return id;
}
/**
 * Model size/type classification
 */
export const ModelType = {
  SMALL: 'TEXT_SMALL', // kept for backwards compatibility
  MEDIUM: 'TEXT_LARGE', // kept for backwards compatibility
  LARGE: 'TEXT_LARGE', // kept for backwards compatibility
  TEXT_SMALL: 'TEXT_SMALL',
  TEXT_LARGE: 'TEXT_LARGE',
  TEXT_EMBEDDING: 'TEXT_EMBEDDING',
  TEXT_TOKENIZER_ENCODE: 'TEXT_TOKENIZER_ENCODE',
  TEXT_TOKENIZER_DECODE: 'TEXT_TOKENIZER_DECODE',
  TEXT_REASONING_SMALL: 'REASONING_SMALL',
  TEXT_REASONING_LARGE: 'REASONING_LARGE',
  TEXT_COMPLETION: 'TEXT_COMPLETION',
  IMAGE: 'IMAGE',
  IMAGE_DESCRIPTION: 'IMAGE_DESCRIPTION',
  TRANSCRIPTION: 'TRANSCRIPTION',
  TEXT_TO_SPEECH: 'TEXT_TO_SPEECH',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  OBJECT_SMALL: 'OBJECT_SMALL',
  OBJECT_LARGE: 'OBJECT_LARGE',
};
export const ServiceType = {
  TRANSCRIPTION: 'transcription',
  VIDEO: 'video',
  BROWSER: 'browser',
  PDF: 'pdf',
  REMOTE_FILES: 'aws_s3',
  WEB_SEARCH: 'web_search',
  EMAIL: 'email',
  TEE: 'tee',
  TASK: 'task',
};
export var MemoryType;
(function (MemoryType) {
  MemoryType['DOCUMENT'] = 'document';
  MemoryType['FRAGMENT'] = 'fragment';
  MemoryType['MESSAGE'] = 'message';
  MemoryType['DESCRIPTION'] = 'description';
  MemoryType['CUSTOM'] = 'custom';
})(MemoryType || (MemoryType = {}));
export var ChannelType;
(function (ChannelType) {
  ChannelType['SELF'] = 'SELF';
  ChannelType['DM'] = 'dm';
  ChannelType['GROUP'] = 'group';
  ChannelType['VOICE_DM'] = 'VOICE_DM';
  ChannelType['VOICE_GROUP'] = 'VOICE_GROUP';
  ChannelType['FEED'] = 'FEED';
  ChannelType['THREAD'] = 'THREAD';
  ChannelType['WORLD'] = 'WORLD';
  ChannelType['FORUM'] = 'FORUM';
  // Legacy types - kept for backward compatibility but should be replaced
  ChannelType['API'] = 'API';
})(ChannelType || (ChannelType = {}));
/**
 * Client instance
 */
export class Service {
  /** Runtime instance */
  runtime;
  constructor(runtime) {
    if (runtime) {
      this.runtime = runtime;
    }
  }
  /** Service type */
  static serviceType;
  /** Service configuration */
  config;
  /** Start service connection */
  static async start(_runtime) {
    throw new Error('Not implemented');
  }
  /** Stop service connection */
  static async stop(_runtime) {
    throw new Error('Not implemented');
  }
}
export var AgentStatus;
(function (AgentStatus) {
  AgentStatus['ACTIVE'] = 'active';
  AgentStatus['INACTIVE'] = 'inactive';
})(AgentStatus || (AgentStatus = {}));
export var KnowledgeScope;
(function (KnowledgeScope) {
  KnowledgeScope['SHARED'] = 'shared';
  KnowledgeScope['PRIVATE'] = 'private';
})(KnowledgeScope || (KnowledgeScope = {}));
export var CacheKeyPrefix;
(function (CacheKeyPrefix) {
  CacheKeyPrefix['KNOWLEDGE'] = 'knowledge';
})(CacheKeyPrefix || (CacheKeyPrefix = {}));
export var TEEMode;
(function (TEEMode) {
  TEEMode['OFF'] = 'OFF';
  TEEMode['LOCAL'] = 'LOCAL';
  TEEMode['DOCKER'] = 'DOCKER';
  TEEMode['PRODUCTION'] = 'PRODUCTION';
})(TEEMode || (TEEMode = {}));
export var TeeType;
(function (TeeType) {
  TeeType['TDX_DSTACK'] = 'tdx_dstack';
})(TeeType || (TeeType = {}));
export var Role;
(function (Role) {
  Role['OWNER'] = 'OWNER';
  Role['ADMIN'] = 'ADMIN';
  Role['NONE'] = 'NONE';
})(Role || (Role = {}));
/**
 * Standard event types across all platforms
 */
export var EventType;
(function (EventType) {
  // World events
  EventType['WORLD_JOINED'] = 'WORLD_JOINED';
  EventType['WORLD_CONNECTED'] = 'WORLD_CONNECTED';
  EventType['WORLD_LEFT'] = 'WORLD_LEFT';
  // Entity events
  EventType['ENTITY_JOINED'] = 'ENTITY_JOINED';
  EventType['ENTITY_LEFT'] = 'ENTITY_LEFT';
  EventType['ENTITY_UPDATED'] = 'ENTITY_UPDATED';
  // Room events
  EventType['ROOM_JOINED'] = 'ROOM_JOINED';
  EventType['ROOM_LEFT'] = 'ROOM_LEFT';
  // Message events
  EventType['MESSAGE_RECEIVED'] = 'MESSAGE_RECEIVED';
  EventType['MESSAGE_SENT'] = 'MESSAGE_SENT';
  // Voice events
  EventType['VOICE_MESSAGE_RECEIVED'] = 'VOICE_MESSAGE_RECEIVED';
  EventType['VOICE_MESSAGE_SENT'] = 'VOICE_MESSAGE_SENT';
  // Interaction events
  EventType['REACTION_RECEIVED'] = 'REACTION_RECEIVED';
  EventType['POST_GENERATED'] = 'POST_GENERATED';
  EventType['INTERACTION_RECEIVED'] = 'INTERACTION_RECEIVED';
  // Run events
  EventType['RUN_STARTED'] = 'RUN_STARTED';
  EventType['RUN_ENDED'] = 'RUN_ENDED';
  EventType['RUN_TIMEOUT'] = 'RUN_TIMEOUT';
  // Action events
  EventType['ACTION_STARTED'] = 'ACTION_STARTED';
  EventType['ACTION_COMPLETED'] = 'ACTION_COMPLETED';
  // Evaluator events
  EventType['EVALUATOR_STARTED'] = 'EVALUATOR_STARTED';
  EventType['EVALUATOR_COMPLETED'] = 'EVALUATOR_COMPLETED';
})(EventType || (EventType = {}));
/**
 * Platform-specific event type prefix
 */
export var PlatformPrefix;
(function (PlatformPrefix) {
  PlatformPrefix['DISCORD'] = 'DISCORD';
  PlatformPrefix['TELEGRAM'] = 'TELEGRAM';
  PlatformPrefix['TWITTER'] = 'TWITTER';
})(PlatformPrefix || (PlatformPrefix = {}));
/**
 * Update the Plugin interface with typed events
 */
export var SOCKET_MESSAGE_TYPE;
(function (SOCKET_MESSAGE_TYPE) {
  SOCKET_MESSAGE_TYPE[(SOCKET_MESSAGE_TYPE['ROOM_JOINING'] = 1)] = 'ROOM_JOINING';
  SOCKET_MESSAGE_TYPE[(SOCKET_MESSAGE_TYPE['SEND_MESSAGE'] = 2)] = 'SEND_MESSAGE';
  SOCKET_MESSAGE_TYPE[(SOCKET_MESSAGE_TYPE['MESSAGE'] = 3)] = 'MESSAGE';
  SOCKET_MESSAGE_TYPE[(SOCKET_MESSAGE_TYPE['ACK'] = 4)] = 'ACK';
  SOCKET_MESSAGE_TYPE[(SOCKET_MESSAGE_TYPE['THINKING'] = 5)] = 'THINKING';
})(SOCKET_MESSAGE_TYPE || (SOCKET_MESSAGE_TYPE = {}));
/**
 * Factory function to create a new message memory with proper defaults
 */
export function createMessageMemory(params) {
  return {
    ...params,
    createdAt: Date.now(),
    metadata: {
      type: MemoryType.MESSAGE,
      timestamp: Date.now(),
      scope: params.agentId ? 'private' : 'shared',
    },
  };
}
/**
 * Generic factory function to create a typed service instance
 * @param runtime The agent runtime
 * @param serviceType The type of service to get
 * @returns The service instance or null if not available
 */
export function getTypedService(runtime, serviceType) {
  return runtime.getService(serviceType);
}
/**
 * Type guard to check if a memory metadata is a DocumentMetadata
 * @param metadata The metadata to check
 * @returns True if the metadata is a DocumentMetadata
 */
export function isDocumentMetadata(metadata) {
  return metadata.type === MemoryType.DOCUMENT;
}
/**
 * Type guard to check if a memory metadata is a FragmentMetadata
 * @param metadata The metadata to check
 * @returns True if the metadata is a FragmentMetadata
 */
export function isFragmentMetadata(metadata) {
  return metadata.type === MemoryType.FRAGMENT;
}
/**
 * Type guard to check if a memory metadata is a MessageMetadata
 * @param metadata The metadata to check
 * @returns True if the metadata is a MessageMetadata
 */
export function isMessageMetadata(metadata) {
  return metadata.type === MemoryType.MESSAGE;
}
/**
 * Type guard to check if a memory metadata is a DescriptionMetadata
 * @param metadata The metadata to check
 * @returns True if the metadata is a DescriptionMetadata
 */
export function isDescriptionMetadata(metadata) {
  return metadata.type === MemoryType.DESCRIPTION;
}
/**
 * Type guard to check if a memory metadata is a CustomMetadata
 * @param metadata The metadata to check
 * @returns True if the metadata is a CustomMetadata
 */
export function isCustomMetadata(metadata) {
  return (
    metadata.type !== MemoryType.DOCUMENT &&
    metadata.type !== MemoryType.FRAGMENT &&
    metadata.type !== MemoryType.MESSAGE &&
    metadata.type !== MemoryType.DESCRIPTION
  );
}
/**
 * Type-safe helper for accessing the video service
 */
export function getVideoService(runtime) {
  return runtime.getService(ServiceType.VIDEO);
}
/**
 * Type-safe helper for accessing the browser service
 */
export function getBrowserService(runtime) {
  return runtime.getService(ServiceType.BROWSER);
}
/**
 * Type-safe helper for accessing the PDF service
 */
export function getPdfService(runtime) {
  return runtime.getService(ServiceType.PDF);
}
/**
 * Type-safe helper for accessing the file service
 */
export function getFileService(runtime) {
  return runtime.getService(ServiceType.REMOTE_FILES);
}
/**
 * Memory type guard for document memories
 */
export function isDocumentMemory(memory) {
  return memory.metadata?.type === MemoryType.DOCUMENT;
}
/**
 * Memory type guard for fragment memories
 */
export function isFragmentMemory(memory) {
  return memory.metadata?.type === MemoryType.FRAGMENT;
}
/**
 * Safely access the text content of a memory
 * @param memory The memory to extract text from
 * @param defaultValue Optional default value if no text is found
 * @returns The text content or default value
 */
export function getMemoryText(memory, defaultValue = '') {
  return memory.content.text ?? defaultValue;
}
/**
 * Safely create a ServiceError from any caught error
 */
export function createServiceError(error, code = 'UNKNOWN_ERROR') {
  if (error instanceof Error) {
    return {
      code,
      message: error.message,
      cause: error,
    };
  }
  return {
    code,
    message: String(error),
  };
}
//# sourceMappingURL=types.js.map
