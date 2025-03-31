import type { Evaluator, Provider } from '../types';
/**
 * Formats the names of evaluators into a comma-separated list, each enclosed in single quotes.
 * @param evaluators - An array of evaluator objects.
 * @returns A string that concatenates the names of all evaluators, each enclosed in single quotes and separated by commas.
 */
/**
 * Formats the names of the evaluators in the provided array.
 *
 * @param {Evaluator[]} evaluators - Array of evaluators.
 * @returns {string} - Formatted string of evaluator names.
 */
export declare function formatEvaluatorNames(evaluators: Evaluator[]): string;
/**
 * Formats evaluator examples into a readable string, replacing placeholders with generated names.
 * @param evaluators - An array of evaluator objects, each containing examples to format.
 * @returns A string that presents each evaluator example in a structured format, including context, messages, and outcomes, with placeholders replaced by generated names.
 */
export declare function formatEvaluatorExamples(evaluators: Evaluator[]): string;
/**
 * Formats evaluator details into a string, including both the name and description of each evaluator.
 * @param evaluators - An array of evaluator objects.
 * @returns A string that concatenates the name and description of each evaluator, separated by a colon and a newline character.
 */
export declare function formatEvaluators(evaluators: Evaluator[]): string;
export declare const evaluatorsProvider: Provider;
//# sourceMappingURL=evaluators.d.ts.map
