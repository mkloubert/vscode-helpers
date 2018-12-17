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
/// <reference types="node" />
import * as vscode from 'vscode';
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
 * Creates a disposable interval.
 *
 * @param {Function} callback The callback.
 * @param {number} ms The interval in milliseconds.
 * @param {any[]} [args] The arguments for the callback.
 *
 * @return {vscode.Disposable} The disposable for the interval.
 */
export declare function createInterval(callback: Function, ms: number, ...args: any[]): vscode.Disposable;
/**
 * Creates a disposable timeout.
 *
 * @param {Function} callback The callback.
 * @param {number} ms The timeout in milliseconds.
 * @param {any[]} [args] The arguments for the callback.
 *
 * @return {vscode.Disposable} The disposable for the timeout.
 */
export declare function createTimeout(callback: Function, ms: number, ...args: any[]): vscode.Disposable;
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
 * Tries to clear an interval.
 *
 * @param {NodeJS.Timer} intervalId The interval (ID).
 *
 * @return {boolean} Operation was successfull or not.
 */
export declare function tryClearInterval(intervalId: NodeJS.Timer): boolean;
/**
 * Tries to clear a timeout.
 *
 * @param {NodeJS.Timer} timeoutId The timeout (ID).
 *
 * @return {boolean} Operation was successfull or not.
 */
export declare function tryClearTimeout(timeoutId: NodeJS.Timer): boolean;
/**
 * Waits while a predicate matches.
 *
 * @param {Function} predicate The predicate.
 * @param {WaitWhileOptions} {opts} Additional options.
 *
 * @return {Promise<boolean>} The promise that indicates if timeout reached (false) or not (true).
 */
export declare function waitWhile(predicate: () => boolean | PromiseLike<boolean>, opts?: WaitWhileOptions): Promise<boolean>;
