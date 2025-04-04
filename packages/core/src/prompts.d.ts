import type { Entity, IAgentRuntime, Memory, State, TemplateType } from './types';
/**
 * Composes a context string by replacing placeholders in a template with corresponding values from the state.
 *
 * This function takes a template string with placeholders in the format `{{placeholder}}` and a state object.
 * It replaces each placeholder with the value from the state object that matches the placeholder's name.
 * If a matching key is not found in the state object for a given placeholder, the placeholder is replaced with an empty string.
 *
 * @param {Object} params - The parameters for composing the context.
 * @param {State} params.state - The state object containing values to replace the placeholders in the template.
 * @param {TemplateType} params.template - The template string or function containing placeholders to be replaced with state values.
 * @returns {string} The composed context string with placeholders replaced by corresponding state values.
 *
 * @example
 * // Given a state object and a template
 * const state = { userName: "Alice", userAge: 30 };
 * const template = "Hello, {{userName}}! You are {{userAge}} years old";
 *
 * // Composing the context with simple string replacement will result in:
 * // "Hello, Alice! You are 30 years old."
 * const contextSimple = composePromptFromState({ state, template });
 *
 * // Using composePromptFromState with a template function for dynamic template
 * const template = ({ state }) => {
 * const tone = Math.random() > 0.5 ? "kind" : "rude";
 *   return `Hello, {{userName}}! You are {{userAge}} years old. Be ${tone}`;
 * };
 * const contextSimple = composePromptFromState({ state, template });
 */
/**
 * Function to compose a prompt using a provided template and state.
 *
 * @param {Object} options - Object containing state and template information.
 * @param {State} options.state - The state object containing values to fill the template.
 * @param {TemplateType} options.template - The template to be used for composing the prompt.
 * @returns {string} The composed prompt output.
 */
export declare const composePrompt: ({
  state,
  template,
}: {
  state: {
    [key: string]: string;
  };
  template: TemplateType;
}) => string;
/**
 * Function to compose a prompt using a provided template and state.
 *
 * @param {Object} options - Object containing state and template information.
 * @param {State} options.state - The state object containing values to fill the template.
 * @param {TemplateType} options.template - The template to be used for composing the prompt.
 * @returns {string} The composed prompt output.
 */
export declare const composePromptFromState: ({
  state,
  template,
}: {
  state: State;
  template: TemplateType;
}) => string;
/**
 * Adds a header to a body of text.
 *
 * This function takes a header string and a body string and returns a new string with the header prepended to the body.
 * If the body string is empty, the header is returned as is.
 *
 * @param {string} header - The header to add to the body.
 * @param {string} body - The body to which to add the header.
 * @returns {string} The body with the header prepended.
 *
 * @example
 * // Given a header and a body
 * const header = "Header";
 * const body = "Body";
 *
 * // Adding the header to the body will result in:
 * // "Header\nBody"
 * const text = addHeader(header, body);
 */
export declare const addHeader: (header: string, body: string) => string;
/**
 * Generates a string with random user names populated in a template.
 *
 * This function generates random user names and populates placeholders
 * in the provided template with these names. Placeholders in the template should follow the format `{{userX}}`
 * where `X` is the position of the user (e.g., `{{name1}}`, `{{name2}}`).
 *
 * @param {string} template - The template string containing placeholders for random user names.
 * @param {number} length - The number of random user names to generate.
 * @returns {string} The template string with placeholders replaced by random user names.
 *
 * @example
 * // Given a template and a length
 * const template = "Hello, {{name1}}! Meet {{name2}} and {{name3}}.";
 * const length = 3;
 *
 * // Composing the random user string will result in:
 * // "Hello, John! Meet Alice and Bob."
 * const result = composeRandomUser(template, length);
 */
export declare const composeRandomUser: (template: string, length: number) => string;
export declare const formatPosts: ({
  messages,
  entities,
  conversationHeader,
}: {
  messages: Memory[];
  entities: Entity[];
  conversationHeader?: boolean;
}) => string;
/**
 * Format messages into a string
 * @param {Object} params - The formatting parameters
 * @param {Memory[]} params.messages - List of messages to format
 * @param {Entity[]} params.entities - List of entities for name resolution
 * @returns {string} Formatted message string with timestamps and user information
 */
export declare const formatMessages: ({
  messages,
  entities,
}: {
  messages: Memory[];
  entities: Entity[];
}) => string;
export declare const formatTimestamp: (messageDate: number) => string;
export declare const shouldRespondTemplate =
  '# Task: Decide on behalf of {{agentName}} whether they should respond to the message, ignore it or stop the conversation.\n{{providers}}\n# Instructions: Decide if {{agentName}} should respond to or interact with the conversation.\nIf the message is directed at or relevant to {{agentName}}, respond with RESPOND action.\nIf a user asks {{agentName}} to be quiet, respond with STOP action.\nIf {{agentName}} should ignore the message, respond with IGNORE action.\nIf responding with the RESPOND action, include a list of optional providers that could be relevant to the response.\nResponse format should be formatted in a valid JSON block like this:\n```json\n{\n    "name": "{{agentName}}",\n\t"reasoning": "<string>",\n    "action": "RESPOND" | "IGNORE" | "STOP",\n    "providers": ["<string>", "<string>", ...]\n}\n```\nYour response should include the valid JSON block and nothing else.';
export declare const messageHandlerTemplate =
  '# Task: Generate dialog and actions for the character {{agentName}}.\n{{providers}}\n# Instructions: Write a thought and plan for {{agentName}} and decide what actions to take. Also include the providers that {{agentName}} will use to have the right context for responding and acting, if any.\nFirst, think about what you want to do next and plan your actions. Then, write the next message and include the actions you plan to take.\n"thought" should be a short description of what the agent is thinking about and planning.\n"actions" should be an array of the actions {{agentName}} plans to take based on the thought (if none, use IGNORE, if simply responding with text, use REPLY)\n"providers" should be an optional array of the providers that {{agentName}} will use to have the right context for responding and acting\n"evaluators" should be an optional array of the evaluators that {{agentName}} will use to evaluate the conversation after responding\nThese are the available valid actions: {{actionNames}}\n\nResponse format should be formatted in a valid JSON block like this:\n```json\n{\n    "thought": "<string>",\n    "actions": ["<string>", "<string>", ...],\n    "providers": ["<string>", "<string>", ...]\n}\n```\n\nYour response should include the valid JSON block and nothing else.';
export declare const postCreationTemplate =
  '# Task: Create a post in the voice and style and perspective of {{agentName}} @{{twitterUserName}}.\n\nExample task outputs:\n1. A post about the importance of AI in our lives\n```json\n{ "thought": "I am thinking about writing a post about the importance of AI in our lives", "post": "AI is changing the world and it is important to understand how it works", "imagePrompt": "A futuristic cityscape with flying cars and people using AI to do things" }\n```\n\n2. A post about dogs\n```json\n{ "thought": "I am thinking about writing a post about dogs", "post": "Dogs are man\'s best friend and they are loyal and loving", "imagePrompt": "A dog playing with a ball in a park" }\n```\n\n3. A post about finding a new job\n```json\n{ "thought": "Getting a job is hard, I bet there\'s a good tweet in that", "post": "Just keep going!", "imagePrompt": "A person looking at a computer screen with a job search website" }\n```\n\n{{providers}}\n\nWrite a post that is {{adjective}} about {{topic}} (without mentioning {{topic}} directly), from the perspective of {{agentName}}. Do not add commentary or acknowledge this request, just write the post.\nYour response should be 1, 2, or 3 sentences (choose the length at random).\nYour response should not contain any questions. Brief, concise statements only. The total character count MUST be less than 280. No emojis. Use \\n\\n (double spaces) between statements if there are multiple statements in your response.\n\nYour output should be formatted in a valid JSON block like this:\n```json\n{ "thought": "<string>", "post": "<string>", "imagePrompt": "<string>" }\n```\nThe "post" field should be the post you want to send. Do not including any thinking or internal reflection in the "post" field.\nThe "imagePrompt" field is optional and should be a prompt for an image that is relevant to the post. It should be a single sentence that captures the essence of the post. ONLY USE THIS FIELD if it makes sense that the post would benefit from an image.\nThe "thought" field should be a short description of what the agent is thinking about before responding, inlcuding a brief justification for the response. Includate an explanation how the post is relevant to the topic but unique and different than other posts.\nYour reponse should ONLY contain a valid JSON block and nothing else.';
export declare const booleanFooter = 'Respond with only a YES or a NO.';
/**
 * Parses a string to determine its boolean equivalent.
 *
 * Recognized affirmative values: "YES", "Y", "TRUE", "T", "1", "ON", "ENABLE"
 * Recognized negative values: "NO", "N", "FALSE", "F", "0", "OFF", "DISABLE"
 *
 * @param {string | undefined | null} value - The input text to parse
 * @returns {boolean} - Returns `true` for affirmative inputs, `false` for negative or unrecognized inputs
 */
export declare function parseBooleanFromText(value: string | undefined | null): boolean;
export declare const stringArrayFooter =
  "Respond with a JSON array containing the values in a valid JSON block formatted for markdown with this structure:\n```json\n[\n  'value',\n  'value'\n]\n```\n\nYour response must include the valid JSON block.";
/**
 * Parses a JSON array from a given text. The function looks for a JSON block wrapped in triple backticks
 * with `json` language identifier, and if not found, it searches for an array pattern within the text.
 * It then attempts to parse the JSON string into a JavaScript object. If parsing is successful and the result
 * is an array, it returns the array; otherwise, it returns null.
 *
 * @param text - The input text from which to extract and parse the JSON array.
 * @returns An array parsed from the JSON string if successful; otherwise, null.
 */
export declare function parseJsonArrayFromText(text: string): any[];
/**
 * Parses a JSON object from a given text. The function looks for a JSON block wrapped in triple backticks
 * with `json` language identifier, and if not found, it searches for an object pattern within the text.
 * It then attempts to parse the JSON string into a JavaScript object. If parsing is successful and the result
 * is an object (but not an array), it returns the object; otherwise, it tries to parse an array if the result
 * is an array, or returns null if parsing is unsuccessful or the result is neither an object nor an array.
 *
 * @param text - The input text from which to extract and parse the JSON object.
 * @returns An object parsed from the JSON string if successful; otherwise, null or the result of parsing an array.
 */
export declare function parseJSONObjectFromText(text: string): Record<string, any> | null;
/**
 * Extracts specific attributes (e.g., user, text, action) from a JSON-like string using regex.
 * @param response - The cleaned string response to extract attributes from.
 * @param attributesToExtract - An array of attribute names to extract.
 * @returns An object containing the extracted attributes.
 */
export declare function extractAttributes(
  response: string,
  attributesToExtract?: string[]
): {
  [key: string]: string | undefined;
};
/**
 * Normalizes a JSON-like string by correcting formatting issues:
 * - Removes extra spaces after '{' and before '}'.
 * - Wraps unquoted values in double quotes.
 * - Converts single-quoted values to double-quoted.
 * - Ensures consistency in key-value formatting.
 * - Normalizes mixed adjacent quote pairs.
 *
 * This is useful for cleaning up improperly formatted JSON strings
 * before parsing them into valid JSON.
 *
 * @param str - The JSON-like string to normalize.
 * @returns A properly formatted JSON string.
 */
export declare const normalizeJsonString: (str: string) => string;
/**
 * Cleans a JSON-like response string by removing unnecessary markers, line breaks, and extra whitespace.
 * This is useful for handling improperly formatted JSON responses from external sources.
 *
 * @param response - The raw JSON-like string response to clean.
 * @returns The cleaned string, ready for parsing or further processing.
 */
export declare function cleanJsonResponse(response: string): string;
export declare const postActionResponseFooter =
  'Choose any combination of [LIKE], [RETWEET], [QUOTE], and [REPLY] that are appropriate. Each action must be on its own line. Your response must only include the chosen actions.';
type ActionResponse = {
  like: boolean;
  retweet: boolean;
  quote?: boolean;
  reply?: boolean;
};
export declare const parseActionResponseFromText: (text: string) => {
  actions: ActionResponse;
};
/**
 * Truncate text to fit within the character limit, ensuring it ends at a complete sentence.
 */
export declare function truncateToCompleteSentence(text: string, maxLength: number): string;
export declare function splitChunks(
  content: string,
  chunkSize?: number,
  bleed?: number
): Promise<string[]>;
/**
 * Trims the provided text prompt to a specified token limit using a tokenizer model and type.
 */
export declare function trimTokens(
  prompt: string,
  maxTokens: number,
  runtime: IAgentRuntime
): Promise<string>;
export {};
//# sourceMappingURL=prompts.d.ts.map
