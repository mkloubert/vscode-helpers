/**
 * This file is part of the vscode-helpers distribution.
 * Copyright (c) Marcel Joachim Kloubert.
 *
 * vscode-helpers is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * vscode-helpers is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import * as vscode from 'vscode';
/**
 * A progress context.
 */
export interface ProgressContext {
    /**
     * The base context provided by Visual Studio Code.
     */
    baseContext: vscode.Progress<{
        message?: string;
        increment?: number;
    }>;
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
