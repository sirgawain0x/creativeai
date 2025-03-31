import { type Action } from '../types';
/**
 * Template for deciding if {{agentName}} should start following a room.
 * The decision is based on various criteria, including recent messages and user interactions.
 * Respond with YES if:
 * - The user has directly asked {{agentName}} to follow the conversation
 * - The conversation topic is engaging and {{agentName}}'s input would add value
 * - {{agentName}} has unique insights to contribute and users seem receptive
 * Otherwise, respond with NO.
 */
export declare const shouldFollowTemplate =
  "# Task: Decide if {{agentName}} should start following this room, i.e. eagerly participating without explicit mentions.\n\n{{recentMessages}}\n\nShould {{agentName}} start following this room, eagerly participating without explicit mentions?\nRespond with YES if:\n- The user has directly asked {{agentName}} to follow the conversation or participate more actively\n- The conversation topic is highly engaging and {{agentName}}'s input would add significant value\n- {{agentName}} has unique insights to contribute and the users seem receptive\n\nOtherwise, respond with NO.\nRespond with only a YES or a NO.";
/**
 * Action for following a room with great interest.
 * Similes: FOLLOW_CHAT, FOLLOW_CHANNEL, FOLLOW_CONVERSATION, FOLLOW_THREAD
 * Description: Start following this channel with great interest, chiming in without needing to be explicitly mentioned. Only do this if explicitly asked to.
 * @param {IAgentRuntime} runtime - The current agent runtime.
 * @param {Memory} message - The message memory.
 * @returns {Promise<boolean>} - Promise that resolves to a boolean indicating if the room should be followed.
 */
export declare const followRoomAction: Action;
//# sourceMappingURL=followRoom.d.ts.map
