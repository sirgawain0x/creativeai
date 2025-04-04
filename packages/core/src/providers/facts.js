import { ModelType } from '../types';
/**
 * Formats an array of memories into a single string with each memory content text separated by a new line.
 *
 * @param {Memory[]} facts - An array of Memory objects to be formatted.
 * @returns {string} A single string containing all memory content text with new lines separating each text.
 */
function formatFacts(facts) {
  return facts
    .reverse()
    .map((fact) => fact.content.text)
    .join('\n');
}
/**
 * Function to get key facts that the agent knows.
 * @param {IAgentRuntime} runtime - The runtime environment for the agent.
 * @param {Memory} message - The message object containing relevant information.
 * @param {State} [_state] - Optional state information.
 * @returns {Object} An object containing values, data, and text related to the key facts.
 */
const factsProvider = {
  name: 'FACTS',
  description: 'Key facts that the agent knows',
  dynamic: true,
  get: async (runtime, message, _state) => {
    // Parallelize initial data fetching operations including recentInteractions
    const recentMessages = await runtime.getMemories({
      tableName: 'messages',
      roomId: message.roomId,
      count: 10,
      unique: false,
    });
    // join the text of the last 5 messages
    const last5Messages = recentMessages
      .slice(-5)
      .map((message) => message.content.text)
      .join('\n');
    const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
      text: last5Messages,
    });
    const [relevantFacts, recentFactsData] = await Promise.all([
      runtime.searchMemories({
        tableName: 'facts',
        embedding,
        roomId: message.roomId,
        count: 10,
      }),
      runtime.getMemories({
        tableName: 'facts',
        roomId: message.roomId,
        count: 10,
        start: 0,
        end: Date.now(),
      }),
    ]);
    // join the two and deduplicate
    const allFacts = [...relevantFacts, ...recentFactsData].filter(
      (fact, index, self) => index === self.findIndex((t) => t.id === fact.id)
    );
    if (allFacts.length === 0) {
      return {
        values: {
          facts: '',
        },
        data: {
          facts: allFacts,
        },
        text: '',
      };
    }
    const formattedFacts = formatFacts(allFacts);
    const text = 'Key facts that {{agentName}} knows:\n{{formattedFacts}}'
      .replace('{{agentName}}', runtime.character.name)
      .replace('{{formattedFacts}}', formattedFacts);
    return {
      values: {
        facts: formattedFacts,
      },
      data: {
        facts: allFacts,
      },
      text,
    };
  },
};
export { factsProvider };
//# sourceMappingURL=facts.js.map
