import { type Action } from '../types';
/**
 * Template for determining if an agent should unmute a previously muted room.
 * * @type { string }
 */
export declare const shouldUnmuteTemplate =
  "# Task: Decide if {{agentName}} should unmute this previously muted room and start considering it for responses again.\n\n{{recentMessages}}\n\nShould {{agentName}} unmute this previously muted room and start considering it for responses again?\nRespond with YES if:\n- The user has explicitly asked {{agentName}} to start responding again\n- The user seems to want to re-engage with {{agentName}} in a respectful manner\n- The tone of the conversation has improved and {{agentName}}'s input would be welcome\n\nOtherwise, respond with NO.\nRespond with only a YES or a NO.";
/**
 * Action to unmute a room, allowing the agent to consider responding to messages again.
 *
 * @name UNMUTE_ROOM
 * @similes ["UNMUTE_CHAT", "UNMUTE_CONVERSATION", "UNMUTE_ROOM", "UNMUTE_THREAD"]
 * @description Unmutes a room, allowing the agent to consider responding to messages again.
 *
 * @param {IAgentRuntime} runtime - The agent runtime to access runtime functionalities.
 * @param {Memory} message - The message containing information about the room.
 * @returns {Promise<boolean>} A boolean value indicating if the room was successfully unmuted.
 */
export declare const unmuteRoomAction: Action;
//# sourceMappingURL=unmuteRoom.d.ts.map
