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

import * as Moment from 'moment';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';

/**
 * An action for 'invokeAfter()' function.
 *
 * @param {any[]} [args] The arguments for the action.
 *
 * @return {TResult|PromiseLike<TResult>} The result of the action.
 */
export type InvokeAfterAction<TResult = any> = (...args: any[]) => TResult | PromiseLike<TResult>;

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
export class StopWatch {
    private _startTime: Moment.Moment | false = false;

    /**
     * Gets if the stop watch is running or not.
     */
    public get isRunning(): boolean {
        return Moment.isMoment(this._startTime);
    }

    /**
     * (Re-)Starts the stop watch.
     *
     * @return this
     */
    public start(): this {
        this._startTime = Moment.utc();
        return this;
    }

    /**
     * Stops the watch.
     *
     * @return {number} The number of milliseconds.
     */
    public stop(): number {
        const NOW = Moment.utc();
        const START_TIME = this._startTime;

        this._startTime = false;

        if (Moment.isMoment(START_TIME)) {
            return NOW.diff(START_TIME, 'ms', true);
        }
    }
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
export function createInterval(callback: Function, ms: number, ...args: any[]): vscode.Disposable {
    ms = parseInt( vscode_helpers.toStringSafe(ms).trim() );
    if (isNaN(ms)) {
        ms = 1000;
    }

    const TIMER = setInterval.apply(
        null,
        [ <any>callback, ms ].concat( vscode_helpers.asArray(args, false) )
    );

    return {
        dispose: () => {
            clearInterval(TIMER);
        },
    };
}

/**
 * Creates a disposable timeout.
 *
 * @param {Function} callback The callback.
 * @param {number} ms The timeout in milliseconds.
 * @param {any[]} [args] The arguments for the callback.
 *
 * @return {vscode.Disposable} The disposable for the timeout.
 */
export function createTimeout(callback: Function, ms: number, ...args: any[]): vscode.Disposable {
    ms = parseInt( vscode_helpers.toStringSafe(ms).trim() );
    if (isNaN(ms)) {
        ms = 1000;
    }

    const TIMER = setTimeout.apply(
        null,
        [ <any>callback, ms ].concat( vscode_helpers.asArray(args, false) )
    );

    return {
        dispose: () => {
            clearTimeout(TIMER);
        },
    };
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
export function invokeAfter<TResult = any>(action: InvokeAfterAction<TResult>, ms?: number, ...args: any[]) {
    const ACTION_ARGS = args.filter((x, index) => {
        return index >= 2;
    });

    ms = parseInt(
        vscode_helpers.toStringSafe(ms).trim()
    );
    if (isNaN(ms)) {
        ms = 1000;
    }

    return new Promise<TResult>((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

        try {
            setTimeout(() => {
                try {
                    Promise.resolve(
                        action.apply(null, ACTION_ARGS),
                    ).then((result: TResult) => {
                        COMPLETED(null, result);
                    }).catch((err) => {
                        COMPLETED(err);
                    });
                } catch (e) {
                    COMPLETED(e);
                }
            }, ms);
        } catch (e) {
            COMPLETED(e);
        }
    });
}

/**
 * Waits a number of milliseconds.
 *
 * @param {number} [ms] The custom time, in milliseconds, to wait.
 */
export async function sleep(ms?: number) {
    await invokeAfter(() => {}, ms);
}

/**
 * Creates and starts a new stop watch.
 *
 * @return {StopWatch} The new, started watch.
 */
export function startWatch() {
    return (new StopWatch()).start();
}

/**
 * Waits while a predicate matches.
 *
 * @param {Function} predicate The predicate.
 * @param {WaitWhileOptions} {opts} Additional options.
 *
 * @return {Promise<boolean>} The promise that indicates if timeout reached (false) or not (true).
 */
export async function waitWhile(predicate: () => boolean | PromiseLike<boolean>,
                                opts?: WaitWhileOptions) {
    if (!opts) {
        opts = <any>{};
    }

    const TIME_UNTIL_NEXT_CHECK = parseInt(
        vscode_helpers.toStringSafe(opts.timeUntilNextCheck).trim()
    );

    const TIMEOUT = parseInt(
        vscode_helpers.toStringSafe(opts.timeout).trim()
    );

    let runUntil: Moment.Moment | false = false;
    if (!isNaN(TIMEOUT)) {
        runUntil = Moment.utc()
                         .add(TIMEOUT, 'ms');
    }

    let wait: boolean;
    do {
        const NOW = Moment.utc();

        if (false !== runUntil) {
            if (runUntil.isAfter(NOW)) {
                return false;
            }
        }

        wait = vscode_helpers.toBooleanSafe(
            await Promise.resolve(
                predicate()
            )
        );

        if (wait) {
            if (!isNaN(TIME_UNTIL_NEXT_CHECK)) {
                await sleep(TIME_UNTIL_NEXT_CHECK);  // wait before next check
            }
        }
    }
    while (wait);

    return true;
}
