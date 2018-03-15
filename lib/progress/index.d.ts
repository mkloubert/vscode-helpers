import * as vscode from 'vscode';
/**
 * A progress context.
 */
export interface ProgressContext {
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
     * The location.
     */
    readonly location?: vscode.ProgressLocation;
    /**
     * The title.
     */
    readonly title?: string;
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
