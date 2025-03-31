import { type IAgentRuntime, Service, type ServiceTypeName } from '../types';
/**
 * TaskService class representing a service that schedules and executes tasks.
 * @extends Service
 * @property {NodeJS.Timeout|null} timer - Timer for executing tasks
 * @property {number} TICK_INTERVAL - Interval in milliseconds to check for tasks
 * @property {ServiceTypeName} serviceType - Service type of TASK
 * @property {string} capabilityDescription - Description of the service's capability
 * @static
 * @method start - Static method to start the TaskService
 * @method createTestTasks - Method to create test tasks
 * @method startTimer - Private method to start the timer for checking tasks
 * @method validateTasks - Private method to validate tasks
 * @method checkTasks - Private method to check tasks and execute them
 * @method executeTask - Private method to execute a task
 * @static
 * @method stop - Static method to stop the TaskService
 * @method stop - Method to stop the TaskService
 */
export declare class TaskService extends Service {
  private timer;
  private readonly TICK_INTERVAL;
  static serviceType: ServiceTypeName;
  capabilityDescription: string;
  /**
   * Start the TaskService with the given runtime.
   * @param {IAgentRuntime} runtime - The runtime for the TaskService.
   * @returns {Promise<TaskService>} A promise that resolves with the TaskService instance.
   */
  static start(runtime: IAgentRuntime): Promise<TaskService>;
  /**
   * Asynchronously creates test tasks by registering task workers for repeating and one-time tasks,
   * validates the tasks, executes the tasks, and creates the tasks if they do not already exist.
   */
  createTestTasks(): Promise<void>;
  /**
   * Starts a timer that runs a function to check tasks at a specified interval.
   */
  private startTimer;
  /**
   * Validates an array of Task objects.
   * Skips tasks without IDs or if no worker is found for the task.
   * If a worker has a `validate` function, it will run the validation using the `runtime`, `Memory`, and `State` parameters.
   * If the validation fails, the task will be skipped and the error will be logged.
   * @param {Task[]} tasks - An array of Task objects to validate.
   * @returns {Promise<Task[]>} - A Promise that resolves with an array of validated Task objects.
   */
  private validateTasks;
  /**
   * Asynchronous method that checks tasks with "queue" tag, validates and sorts them, then executes them based on interval and tags.
   *
   * @returns {Promise<void>} Promise that resolves once all tasks are checked and executed
   */
  private checkTasks;
  /**
   * Executes a given task asynchronously.
   *
   * @param {Task} task - The task to be executed.
   */
  private executeTask;
  /**
   * Stops the TASK service in the given agent runtime.
   *
   * @param {IAgentRuntime} runtime - The agent runtime containing the service.
   * @returns {Promise<void>} - A promise that resolves once the service has been stopped.
   */
  static stop(runtime: IAgentRuntime): Promise<void>;
  /**
   * Stops the timer if it is currently running.
   */
  stop(): Promise<void>;
}
//# sourceMappingURL=task.d.ts.map
