import pino from 'pino';
function parseBooleanFromText(value) {
  if (!value) return false;
  const affirmative = ['YES', 'Y', 'TRUE', 'T', '1', 'ON', 'ENABLE'];
  const negative = ['NO', 'N', 'FALSE', 'F', '0', 'OFF', 'DISABLE'];
  const normalizedText = value.trim().toUpperCase();
  if (affirmative.includes(normalizedText)) {
    return true;
  }
  if (negative.includes(normalizedText)) {
    return false;
  }
  // For environment variables, we'll treat unrecognized values as false
  return false;
}
// Custom destination that maintains recent logs in memory
/**
 * Class representing an in-memory destination stream for logging.
 * Implements DestinationStream interface.
 */
class InMemoryDestination {
  logs = [];
  maxLogs = 1000; // Keep last 1000 logs
  stream;
  /**
   * Constructor for creating a new instance of the class.
   * @param {DestinationStream|null} stream - The stream to assign to the instance. Can be null.
   */
  constructor(stream) {
    this.stream = stream;
  }
  /**
   * Writes a log entry to the memory buffer and forwards it to the pretty print stream if available.
   *
   * @param {string | LogEntry} data - The data to be written, which can be either a string or a LogEntry object.
   * @returns {void}
   */
  write(data) {
    // Parse the log entry if it's a string
    let logEntry;
    let stringData;
    if (typeof data === 'string') {
      stringData = data;
      try {
        logEntry = JSON.parse(data);
      } catch (e) {
        // If it's not valid JSON, just pass it through
        if (this.stream) {
          this.stream.write(data);
        }
        return;
      }
    } else {
      logEntry = data;
      stringData = JSON.stringify(data);
    }
    // Add timestamp if not present
    if (!logEntry.time) {
      logEntry.time = Date.now();
    }
    // Filter out service registration logs unless in debug mode
    const isDebugMode = (process?.env?.LOG_LEVEL || '').toLowerCase() === 'debug';
    const isLoggingDiagnostic = Boolean(process?.env?.LOG_DIAGNOSTIC);
    if (isLoggingDiagnostic) {
      // When diagnostic mode is on, add a marker to every log to see what's being processed
      logEntry.diagnostic = true;
    }
    if (!isDebugMode) {
      // Check if this is a service or agent log that we want to filter
      if (logEntry.agentName && logEntry.agentId) {
        const msg = logEntry.msg || '';
        // Filter only service/agent registration logs, not all agent logs
        if (
          typeof msg === 'string' &&
          (msg.includes('registered successfully') ||
            msg.includes('Registering') ||
            msg.includes('Success:') ||
            msg.includes('linked to') ||
            msg.includes('Started'))
        ) {
          if (isLoggingDiagnostic) {
            console.error('Filtered log:', stringData);
          }
          // This is a service registration/agent log, skip it
          return;
        }
      }
    }
    // Add to memory buffer
    this.logs.push(logEntry);
    // Maintain buffer size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    // Forward to pretty print stream if available
    if (this.stream) {
      this.stream.write(stringData);
    }
  }
  /**
   * Retrieves the recent logs from the system.
   *
   * @returns {LogEntry[]} An array of LogEntry objects representing the recent logs.
   */
  recentLogs() {
    return this.logs;
  }
  /**
   * Clears all logs from memory.
   *
   * @returns {void}
   */
  clear() {
    this.logs = [];
  }
}
const customLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  log: 29,
  progress: 28,
  success: 27,
  debug: 20,
  trace: 10,
};
const raw = parseBooleanFromText(process?.env?.LOG_JSON_FORMAT) || false;
// Set default log level to info to allow regular logs, but still filter service logs
const isDebugMode = (process?.env?.LOG_LEVEL || '').toLowerCase() === 'debug';
const effectiveLogLevel = isDebugMode ? 'debug' : process?.env?.DEFAULT_LOG_LEVEL || 'info';
// Create a function to generate the pretty configuration
const createPrettyConfig = () => ({
  colorize: true,
  translateTime: 'yyyy-mm-dd HH:MM:ss',
  ignore: 'pid,hostname',
  customPrettifiers: {
    level: (inputData) => {
      let level;
      if (typeof inputData === 'object' && inputData !== null) {
        level = inputData.level || inputData.value;
      } else {
        level = inputData;
      }
      const levelNames = {
        10: 'TRACE',
        20: 'DEBUG',
        27: 'SUCCESS',
        28: 'PROGRESS',
        29: 'LOG',
        30: 'INFO',
        40: 'WARN',
        50: 'ERROR',
        60: 'FATAL',
      };
      if (typeof level === 'number') {
        return levelNames[level] || `LEVEL${level}`;
      }
      if (level === undefined || level === null) {
        return 'UNKNOWN';
      }
      return String(level).toUpperCase();
    },
    // Add a custom prettifier for error messages
    msg: (msg) => {
      // Replace "ERROR (TypeError):" pattern with just "ERROR:"
      return msg.replace(/ERROR \([^)]+\):/g, 'ERROR:');
    },
  },
  messageFormat: '{msg}',
});
const createStream = async () => {
  if (raw) {
    return undefined;
  }
  // dynamically import pretty to avoid importing it in the browser
  const pretty = await import('pino-pretty');
  return pretty.default(createPrettyConfig());
};
// Create options with appropriate level
const options = {
  level:
    process?.env?.LOG_LEVEL?.toLowerCase() === 'debug'
      ? 'debug'
      : process?.env?.DEFAULT_LOG_LEVEL || 'info',
  customLevels: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    log: 29,
    progress: 28,
    success: 27,
    debug: 20,
    trace: 10,
  },
  hooks: {
    logMethod(inputArgs, method) {
      const [arg1, ...rest] = inputArgs;
      const formatError = (err) => ({
        message: `(${err.name}) ${err.message}`,
        stack: err.stack?.split('\n').map((line) => line.trim()),
      });
      if (typeof arg1 === 'object') {
        if (arg1 instanceof Error) {
          method.apply(this, [
            {
              error: formatError(arg1),
            },
          ]);
        } else {
          const messageParts = rest.map((arg) =>
            typeof arg === 'string' ? arg : JSON.stringify(arg)
          );
          const message = messageParts.join(' ');
          method.apply(this, [arg1, message]);
        }
      } else {
        const context = {};
        const messageParts = [arg1, ...rest].map((arg) => {
          if (arg instanceof Error) {
            return formatError(arg);
          }
          return typeof arg === 'string' ? arg : arg;
        });
        const message = messageParts.filter((part) => typeof part === 'string').join(' ');
        const jsonParts = messageParts.filter((part) => typeof part === 'object');
        Object.assign(context, ...jsonParts);
        method.apply(this, [context, message]);
      }
    },
  },
};
// Create the logger instance
const logger = pino(options);
// for backward compatibility
const elizaLogger = logger;
// Export the logger
export { logger, elizaLogger };
//# sourceMappingURL=logger.js.map
