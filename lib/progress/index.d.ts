import * as vscode from 'vscode';
/**
 * A progress context.
 */
export interface ProgressContext {
    /**
     * If cancellable, this contains the "cancellation token".
     */
    cancellationToken?: vscode.CancellationToken;
    /**
     * The increment value.
     */
    increment: number;
    /**
     * Increments the progress value only if an item has not been handled yet.
     *
     * @param {any} item The item to check.
     * @param {string} message The new message.
     *
     * @return {boolean} Value has been increased or not.
     */
    incrementIfNeeded: (item: any, message: string) => boolean;
    /**
     * Gets or sets the status message.
     */
    message: string;
}
/**
 * Progress options.
 */
export interface ProgressOptions {
    /**
     * Show cancel button or not.
     */
    cancellable?: boolean;
    /**
     * The location.
     */
    location?: vscode.ProgressLocation;
    /**
     * The title.
     */
    title?: string;
}
/**
 * A progress result.
 */
export declare type ProgressResult<TResult = any> = TResult | PromiseLike<TResult>;
/**
 * A progress task.
 *
 * @param {ProgressContext} context The underlying context.
 *
 * @return {ProgressResult<TResult>} The result.
 */
export declare type ProgressTask<TResult = any> = (context: ProgressContext) => ProgressResult<TResult>;
/**
 * Runs a task with progress information.
 *
 * @param {ProgressTask<TResult>} task The task to execute.
 * @param {ProgressOptions} [options] Additional options.
 *
 * @return {Promise<TResult>} The promise with the result.
 */
export declare function withProgress<TResult = any>(task: ProgressTask<TResult>, options?: ProgressOptions): Promise<TResult>;
