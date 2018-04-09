import * as vscode_helpers from '../index';
/**
 * An action for 'invokeAfter()' function.
 *
 * @param {any[]} [args] The arguments for the action.
 *
 * @return {TResult|PromiseLike<TResult>} The result of the action.
 */
export declare type InvokeAfterAction<TResult = any> = (...args: any[]) => TResult | PromiseLike<TResult>;
/**
 * Additional options for 'waitWhile()' function.
 */
export interface WaitWhileOptions {
    /**
     * A timeout, in milliseconds.
     */
    timeout?: number;
    /**
     * The optional time, in milliseconds, to wait until next check.
     */
    timeUntilNextCheck?: number;
}
/**
 * A stopwatch.
 */
export declare class StopWatch {
    private _startTime;
    /**
     * Gets if the stop watch is running or not.
     */
    readonly isRunning: boolean;
    /**
     * (Re-)Starts the stop watch.
     *
     * @return this
     */
    start(): this;
    /**
     * Stops the watch.
     *
     * @return {number} The number of milliseconds.
     */
    stop(): number;
}
/**
 * Invokes an action after a timeout.
 *
 * @param {Function} action The action to invoke.
 * @param {number} [ms] The custom time, in milliseconds, after the action should be invoked.
 * @param {any[]} [args] One or more arguments for the action.
 *
 * @return {Promise<TResult>} The promise with the result.
 */
export declare function invokeAfter<TResult = any>(action: InvokeAfterAction<TResult>, ms?: number, ...args: any[]): Promise<TResult>;
/**
 * Waits a number of milliseconds.
 *
 * @param {number} [ms] The custom time, in milliseconds, to wait.
 */
export declare function sleep(ms?: number): Promise<void>;
/**
 * Creates and starts a new stop watch.
 *
 * @return {StopWatch} The new, started watch.
 */
export declare function startWatch(): vscode_helpers.StopWatch;
/**
 * Waits while a predicate matches.
 *
 * @param {Function} predicate The predicate.
 * @param {WaitWhileOptions} {opts} Additional options.
 *
 * @return {Promise<boolean>} The promise that indicates if timeout reached (false) or not (true).
 */
export declare function waitWhile(predicate: () => boolean | PromiseLike<boolean>, opts?: WaitWhileOptions): Promise<boolean>;
