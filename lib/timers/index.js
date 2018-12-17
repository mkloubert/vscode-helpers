"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Moment = require("moment");
const vscode_helpers = require("../index");
/**
 * A stopwatch.
 */
class StopWatch {
    constructor() {
        this._startTime = false;
    }
    /**
     * Gets if the stop watch is running or not.
     */
    get isRunning() {
        return Moment.isMoment(this._startTime);
    }
    /**
     * (Re-)Starts the stop watch.
     *
     * @return this
     */
    start() {
        this._startTime = Moment.utc();
        return this;
    }
    /**
     * Stops the watch.
     *
     * @return {number} The number of milliseconds.
     */
    stop() {
        const NOW = Moment.utc();
        const START_TIME = this._startTime;
        this._startTime = false;
        if (Moment.isMoment(START_TIME)) {
            return NOW.diff(START_TIME, 'ms', true);
        }
    }
}
exports.StopWatch = StopWatch;
/**
 * Creates a disposable interval.
 *
 * @param {Function} callback The callback.
 * @param {number} ms The interval in milliseconds.
 * @param {any[]} [args] The arguments for the callback.
 *
 * @return {vscode.Disposable} The disposable for the interval.
 */
function createInterval(callback, ms, ...args) {
    ms = parseInt(vscode_helpers.toStringSafe(ms).trim());
    if (isNaN(ms)) {
        ms = 1000;
    }
    const TIMER = setInterval.apply(null, [callback, ms].concat(vscode_helpers.asArray(args, false)));
    return {
        dispose: () => {
            clearInterval(TIMER);
        },
    };
}
exports.createInterval = createInterval;
/**
 * Creates a disposable timeout.
 *
 * @param {Function} callback The callback.
 * @param {number} ms The timeout in milliseconds.
 * @param {any[]} [args] The arguments for the callback.
 *
 * @return {vscode.Disposable} The disposable for the timeout.
 */
function createTimeout(callback, ms, ...args) {
    ms = parseInt(vscode_helpers.toStringSafe(ms).trim());
    if (isNaN(ms)) {
        ms = 1000;
    }
    const TIMER = setTimeout.apply(null, [callback, ms].concat(vscode_helpers.asArray(args, false)));
    return {
        dispose: () => {
            clearTimeout(TIMER);
        },
    };
}
exports.createTimeout = createTimeout;
/**
 * Invokes an action after a timeout.
 *
 * @param {Function} action The action to invoke.
 * @param {number} [ms] The custom time, in milliseconds, after the action should be invoked.
 * @param {any[]} [args] One or more arguments for the action.
 *
 * @return {Promise<TResult>} The promise with the result.
 */
function invokeAfter(action, ms, ...args) {
    const ACTION_ARGS = args.filter((x, index) => {
        return index >= 2;
    });
    ms = parseInt(vscode_helpers.toStringSafe(ms).trim());
    if (isNaN(ms)) {
        ms = 1000;
    }
    return new Promise((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);
        try {
            setTimeout(() => {
                try {
                    Promise.resolve(action.apply(null, ACTION_ARGS)).then((result) => {
                        COMPLETED(null, result);
                    }).catch((err) => {
                        COMPLETED(err);
                    });
                }
                catch (e) {
                    COMPLETED(e);
                }
            }, ms);
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.invokeAfter = invokeAfter;
/**
 * Waits a number of milliseconds.
 *
 * @param {number} [ms] The custom time, in milliseconds, to wait.
 */
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield invokeAfter(() => { }, ms);
    });
}
exports.sleep = sleep;
/**
 * Creates and starts a new stop watch.
 *
 * @return {StopWatch} The new, started watch.
 */
function startWatch() {
    return (new StopWatch()).start();
}
exports.startWatch = startWatch;
/**
 * Tries to clear an interval.
 *
 * @param {NodeJS.Timer} intervalId The interval (ID).
 *
 * @return {boolean} Operation was successfull or not.
 */
function tryClearInterval(intervalId) {
    try {
        if (!_.isNil(intervalId)) {
            clearInterval(intervalId);
        }
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.tryClearInterval = tryClearInterval;
/**
 * Tries to clear a timeout.
 *
 * @param {NodeJS.Timer} timeoutId The timeout (ID).
 *
 * @return {boolean} Operation was successfull or not.
 */
function tryClearTimeout(timeoutId) {
    try {
        if (!_.isNil(timeoutId)) {
            clearTimeout(timeoutId);
        }
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.tryClearTimeout = tryClearTimeout;
/**
 * Waits while a predicate matches.
 *
 * @param {Function} predicate The predicate.
 * @param {WaitWhileOptions} {opts} Additional options.
 *
 * @return {Promise<boolean>} The promise that indicates if timeout reached (false) or not (true).
 */
function waitWhile(predicate, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts) {
            opts = {};
        }
        const TIME_UNTIL_NEXT_CHECK = parseInt(vscode_helpers.toStringSafe(opts.timeUntilNextCheck).trim());
        const TIMEOUT = parseInt(vscode_helpers.toStringSafe(opts.timeout).trim());
        let runUntil = false;
        if (!isNaN(TIMEOUT)) {
            runUntil = Moment.utc()
                .add(TIMEOUT, 'ms');
        }
        let wait;
        do {
            const NOW = Moment.utc();
            if (false !== runUntil) {
                if (NOW.isAfter(runUntil)) {
                    return false;
                }
            }
            wait = vscode_helpers.toBooleanSafe(yield Promise.resolve(predicate()));
            if (wait) {
                if (!isNaN(TIME_UNTIL_NEXT_CHECK)) {
                    yield sleep(TIME_UNTIL_NEXT_CHECK); // wait before next check
                }
            }
        } while (wait);
        return true;
    });
}
exports.waitWhile = waitWhile;
//# sourceMappingURL=index.js.map