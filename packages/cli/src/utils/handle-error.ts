import { logger } from '@elizaos/core';

/**
 * Handles the error by logging it and exiting the process.
 * If the error is a string, it logs the error message and exits.
 * If the error is an instance of Error, it logs the error message and exits.
 * If the error is not a string or an instance of Error,
 * it logs a default error message and exits.
 * @param {unknown} error - The error to be handled.
 */
export function handleError(error: unknown) {
  logger.error('An error occurred:', error);
  if (error instanceof Error) {
    logger.error('Error details:', error.message);
    logger.error('Stack trace:', error.stack);
  } else {
    logger.error('Unknown error type:', typeof error);
    logger.error('Error value:', error);
  }
  process.exit(1);
}
