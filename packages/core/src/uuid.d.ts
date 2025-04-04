import { z } from 'zod';
import type { UUID } from './types';
export declare const uuidSchema: z.ZodType<UUID>;
/**
 * Validates a UUID value.
 *
 * @param {unknown} value - The value to validate.
 * @returns {UUID | null} Returns the validated UUID value or null if validation fails.
 */
export declare function validateUuid(value: unknown): UUID | null;
/**
 * Converts a string or number to a UUID.
 *
 * @param {string | number} target - The string or number to convert to a UUID.
 * @returns {UUID} The UUID generated from the input target.
 * @throws {TypeError} Throws an error if the input target is not a string.
 */
export declare function stringToUuid(target: string | number): UUID;
/**
 * Generates a random UUID using URL.createObjectURL in browser environments
 * and stringToUuid with random string in Node.js environments
 * @returns A random UUID
 */
export declare function generateUUID(): UUID;
declare const _default: {
  stringToUuid: typeof stringToUuid;
  generateUUID: typeof generateUUID;
  validateUuid: typeof validateUuid;
};
export default _default;
//# sourceMappingURL=uuid.d.ts.map
