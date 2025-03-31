import { sha1 } from 'js-sha1';
import { z } from 'zod';
import type { UUID } from './types';

export const uuidSchema = z.string().uuid() as z.ZodType<UUID>;

/**
 * Validates a UUID value.
 *
 * @param {unknown} value - The value to validate.
 * @returns {UUID | null} Returns the validated UUID value or null if validation fails.
 */
export function validateUuid(value: unknown): UUID | null {
  const result = uuidSchema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * Converts a string or number to a UUID.
 *
 * @param {string | number} target - The string or number to convert to a UUID.
 * @returns {UUID} The UUID generated from the input target.
 * @throws {TypeError} Throws an error if the input target is not a string.
 */
export function stringToUuid(target: string | number): UUID {
  if (typeof target === 'number') {
    target = (target as number).toString();
  }

  if (typeof target !== 'string') {
    throw TypeError('Value must be string');
  }

  const escapedStr = encodeURIComponent(target);
  const buffer = new Uint8Array(escapedStr.length);
  for (let i = 0; i < escapedStr.length; i++) {
    buffer[i] = escapedStr[i].charCodeAt(0);
  }

  const hash = sha1(buffer);
  return hash.slice(0, 32) as UUID;
}

/**
 * Generates a random UUID using URL.createObjectURL in browser environments
 * and stringToUuid with random string in Node.js environments
 * @returns A random UUID
 */
export function generateUUID(): UUID {
  if (typeof window !== 'undefined') {
    // Browser environment
    return URL.createObjectURL(new Blob()).split('/').pop() as UUID;
  } else {
    // Node.js environment
    return stringToUuid(Math.random().toString());
  }
}

export default {
  stringToUuid,
  generateUUID,
  validateUuid,
};
