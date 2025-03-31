import { type Action } from '../types';
/**
 * Represents an action to update the role of a user within a server.
 * @typedef {Object} Action
 * @property {string} name - The name of the action.
 * @property {string[]} similes - The similar actions that can be performed.
 * @property {string} description - A description of the action and its purpose.
 * @property {Function} validate - A function to validate the action before execution.
 * @property {Function} handler - A function to handle the execution of the action.
 * @property {ActionExample[][]} examples - Examples demonstrating how the action can be used.
 */
declare const updateRoleAction: Action;
export default updateRoleAction;
//# sourceMappingURL=roles.d.ts.map
