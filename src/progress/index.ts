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
     * If cancellable, this contains the "cancellation token".
     */
    cancellationToken?: vscode.CancellationToken;
    /**
     * The progress value.
     */
    increment: number;
    /**
     * Gets or sets the status message.
     */
    message: string;
    /**
     * The progress value.
     */
    percentage: number;
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
        const CTX: ProgressContext = {
            cancellationToken: ct,
            increment: undefined,
            message: undefined,
            percentage: undefined,
        };

        let msg: string;
        let percentage: number;
        const UPDATE_PROGRESS = () => {
            p.report(<any>{
                increment: percentage,
                message: msg,
                percentage: percentage,
            });
        };

        // CTX.increment
        Object.defineProperty(CTX, 'increment', {
            enumerable: true,

            get: function() {
                return this.percentage;
            },

            set: function (newValue) {
                this.percentage = newValue;
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

        // CTX.percentage
        Object.defineProperty(CTX, 'percentage', {
            enumerable: true,

            get: () => {
                return percentage;
            },

            set: (newValue) => {
                newValue = parseInt( vscode_helpers.toStringSafe(newValue).trim() );
                if (isNaN(newValue)) {
                    newValue = undefined;
                }

                percentage = newValue;
                UPDATE_PROGRESS();
            }
        });

        return Promise.resolve(
            task(CTX)
        );
    });
}
