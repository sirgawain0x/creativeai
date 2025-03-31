import { type Action } from '../types';
/**
 * Template string for deciding if the agent should mute a room and stop responding unless explicitly mentioned.
 *
 * @type {string}
 */
export declare const shouldMuteTemplate =
  "# Task: Decide if {{agentName}} should mute this room and stop responding unless explicitly mentioned.\n\n{{recentMessages}}\n\nShould {{agentName}} mute this room and stop responding unless explicitly mentioned?\n\nRespond with YES if:\n- The user is being aggressive, rude, or inappropriate\n- The user has directly asked {{agentName}} to stop responding or be quiet\n- {{agentName}}'s responses are not well-received or are annoying the user(s)\n\nOtherwise, respond with NO.\nRespond with only a YES or a NO.";
/**
 * Action for muting a room, ignoring all messages unless explicitly mentioned.
 * Only do this if explicitly asked to, or if you're annoying people.
 *
 * @name MUTE_ROOM
 * @type {Action}
 *
 * @property {string} name - The name of the action
 * @property {string[]} similes - Similar actions related to muting a room
 * @property {string} description - Description of the action
 * @property {Function} validate - Validation function to check if the room is not already muted
 * @property {Function} handler - Handler function to handle muting the room
 * @property {ActionExample[][]} examples - Examples of using the action
 */
export declare const muteRoomAction: Action;
//# sourceMappingURL=muteRoom.d.ts.map
