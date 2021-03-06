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

import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';

/**
 * A progress context.
 */
export interface ProgressContext {
    /**
     * The base context provided by Visual Studio Code.
     */
    baseContext: vscode.Progress<{ message?: string; increment?: number }>;
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
export type ProgressResult<TResult = any> = TResult | PromiseLike<TResult>;

/**
 * A progress task.
 *
 * @param {ProgressContext} context The underlying context.
 *
 * @return {ProgressResult<TResult>} The result.
 */
export type ProgressTask<TResult = any> = (context: ProgressContext) => ProgressResult<TResult>;

/**
 * Runs a task with progress information.
 *
 * @param {ProgressTask<TResult>} task The task to execute.
 * @param {ProgressOptions} [options] Additional options.
 *
 * @return {Promise<TResult>} The promise with the result.
 */
export async function withProgress<TResult = any>(task: ProgressTask<TResult>,
                                                  options?: ProgressOptions): Promise<TResult> {
    if (!options) {
        options = {};
    }

    const OPTS: vscode.ProgressOptions = {
        cancellable: vscode_helpers.toBooleanSafe(options.cancellable),
        location: _.isNil(options.location) ? vscode.ProgressLocation.Notification : options.location,
        title: vscode_helpers.toStringSafe( options.title ),
    };

    return vscode.window.withProgress(OPTS, (p, ct) => {
        let handledItems: any[] = [];

        try {
            let msg: string;
            let increment: number;

            const CTX: ProgressContext = {
                baseContext: p,
                cancellationToken: ct,
                increment: undefined,
                incrementIfNeeded: function(item, msg) {
                    if (handledItems.indexOf(item) < 0) {
                        handledItems.push(item);
                        this.message = msg;

                        return true;
                    }

                    return false;
                },
                message: undefined,
            };

            const UPDATE_PROGRESS = () => {
                p.report({
                    increment: increment,
                    message: msg,
                });
            };

            // CTX.increment
            Object.defineProperty(CTX, 'increment', {
                enumerable: true,

                get: () => {
                    return increment;
                },

                set: (newValue) => {
                    if (!_.isNil(newValue)) {
                        newValue = parseFloat( vscode_helpers.toStringSafe(newValue).trim() );
                    }

                    increment = newValue;
                }
            });

            // CTX.message
            Object.defineProperty(CTX, 'message', {
                enumerable: true,

                get: () => {
                    return msg;
                },

                set: (newValue) => {
                    if (_.isNil(newValue)) {
                        newValue = undefined;
                    } else {
                        newValue = vscode_helpers.toStringSafe(newValue);
                    }

                    msg = newValue;
                    UPDATE_PROGRESS();
                }
            });

            return Promise.resolve(
                task(CTX)
            );
        } finally {
            handledItems = null;
        }
    });
}
