import type { Provider } from '../types';
/**
 * A provider object that fetches possible response actions based on the provided runtime, message, and state.
 * @type {Provider}
 * @property {string} name - The name of the provider ("ACTIONS").
 * @property {string} description - The description of the provider ("Possible response actions").
 * @property {number} position - The position of the provider (-1).
 * @property {Function} get - Asynchronous function that retrieves actions that validate for the given message.
 * @param {IAgentRuntime} runtime - The runtime object.
 * @param {Memory} message - The message memory.
 * @param {State} state - The state object.
 * @returns {Object} An object containing the actions data, values, and combined text sections.
 */
export declare const actionsProvider: Provider;
//# sourceMappingURL=actions.d.ts.map
