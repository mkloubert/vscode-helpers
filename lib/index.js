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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Crypto = require("crypto");
const Moment = require("moment");
const OS = require("os");
const vscode = require("vscode");
__export(require("./logging"));
__export(require("./progress"));
__export(require("./workflows"));
/**
 * Applies a function for a specific object / value.
 *
 * @param {TFunc} func The function.
 * @param {any} [thisArgs] The object to apply to the function.
 *
 * @return {TFunc} The wrapped function.
 */
function applyFuncFor(func, thisArgs) {
    return function () {
        return func.apply(thisArgs, arguments);
    };
}
exports.applyFuncFor = applyFuncFor;
/**
 * Returns a value as array.
 *
 * @param {T|T[]} val The value.
 * @param {boolean} [removeEmpty] Remove items that are (null) / (undefined) or not.
 *
 * @return {T[]} The value as array.
 */
function asArray(val, removeEmpty = true) {
    removeEmpty = toBooleanSafe(removeEmpty, true);
    return (_.isArray(val) ? val : [val]).filter(i => {
        if (removeEmpty) {
            return !_.isNil(i);
        }
        return true;
    });
}
exports.asArray = asArray;
/**
 * Returns a value as local Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
function asLocalTime(val) {
    let localTime;
    if (!_.isNil(val)) {
        if (Moment.isMoment(val)) {
            localTime = val;
        }
        else if (Moment.isDate(val)) {
            localTime = Moment(val);
        }
        else {
            localTime = Moment(toStringSafe(val));
        }
    }
    if (localTime) {
        if (!localTime.isLocal()) {
            localTime = localTime.local();
        }
    }
    return localTime;
}
exports.asLocalTime = asLocalTime;
/**
 * Returns a value as UTC Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
function asUTC(val) {
    let utcTime;
    if (!_.isNil(val)) {
        if (Moment.isMoment(val)) {
            utcTime = val;
        }
        else if (Moment.isDate(val)) {
            utcTime = Moment(val);
        }
        else {
            utcTime = Moment(toStringSafe(val));
        }
    }
    if (utcTime) {
        if (!utcTime.isUTC()) {
            utcTime = utcTime.utc();
        }
    }
    return utcTime;
}
exports.asUTC = asUTC;
/**
 * Clones an object / value deep.
 *
 * @param {T} val The value / object to clone.
 *
 * @return {T} The cloned value / object.
 */
function cloneObject(val) {
    if (!val) {
        return val;
    }
    return JSON.parse(JSON.stringify(val));
}
exports.cloneObject = cloneObject;
/**
 * Compares two values for a sort operation.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 *
 * @return {number} The "sort value".
 */
function compareValues(x, y) {
    if (x !== y) {
        if (x > y) {
            return 1;
        }
        else if (x < y) {
            return -1;
        }
    }
    return 0;
}
exports.compareValues = compareValues;
/**
 * Compares values by using a selector.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 * @param {Function} selector The selector.
 *
 * @return {number} The "sort value".
 */
function compareValuesBy(x, y, selector) {
    return compareValues(selector(x), selector(y));
}
exports.compareValuesBy = compareValuesBy;
/**
 * Creates a simple 'completed' callback for a promise.
 *
 * @param {Function} resolve The 'succeeded' callback.
 * @param {Function} reject The 'error' callback.
 *
 * @return {SimpleCompletedAction<TResult>} The created action.
 */
function createCompletedAction(resolve, reject) {
    let completedInvoked = false;
    return (err, result) => {
        if (completedInvoked) {
            return;
        }
        completedInvoked = true;
        if (err) {
            if (reject) {
                reject(err);
            }
        }
        else {
            if (resolve) {
                resolve(result);
            }
        }
    };
}
exports.createCompletedAction = createCompletedAction;
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
    ms = parseInt(toStringSafe(ms).trim());
    if (isNaN(ms)) {
        ms = 1000;
    }
    return new Promise((resolve, reject) => {
        const COMPLETED = createCompletedAction(resolve, reject);
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
 * Normalizes a value as string so that is comparable.
 *
 * @param {any} val The value to convert.
 * @param {StringNormalizer} [normalizer] The custom normalizer.
 *
 * @return {string} The normalized value.
 */
function normalizeString(val, normalizer) {
    if (!normalizer) {
        normalizer = (str) => str.toLowerCase().trim();
    }
    return normalizer(toStringSafe(val));
}
exports.normalizeString = normalizeString;
/**
 * Promise version of 'crypto.randomBytes()' function.
 *
 * @param {number} size The size of the result.
 *
 * @return {Promise<Buffer>} The buffer with the random bytes.
 */
function randomBytes(size) {
    size = parseInt(toStringSafe(size).trim());
    return new Promise((resolve, reject) => {
        const COMPLETED = createCompletedAction(resolve, reject);
        Crypto.randomBytes(size, (err, buf) => {
            COMPLETED(err, buf);
        });
    });
}
exports.randomBytes = randomBytes;
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
 * Returns a value as boolean, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {boolean} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {boolean} 'val' as boolean.
 */
function toBooleanSafe(val, defaultVal = false) {
    if (_.isBoolean(val)) {
        return val;
    }
    if (_.isNil(val)) {
        return !!defaultVal;
    }
    return !!val;
}
exports.toBooleanSafe = toBooleanSafe;
/**
 * Converts an EOL enum value to a string.
 *
 * @param {vscode.EndOfLine} [eol] The (optional) enum value.
 *
 * @return string The EOL string.
 */
function toEOL(eol) {
    switch (eol) {
        case vscode.EndOfLine.CRLF:
            return "\r\n";
        case vscode.EndOfLine.LF:
            return "\n";
    }
    return OS.EOL;
}
exports.toEOL = toEOL;
/**
 * Returns a value as string, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {string} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {string} 'val' as string.
 */
function toStringSafe(val, defaultVal = '') {
    if (_.isString(val)) {
        return val;
    }
    if (_.isNil(val)) {
        return '' + defaultVal;
    }
    try {
        if (val instanceof Error) {
            return '' + val.message;
        }
        if (_.isFunction(val['toString'])) {
            return '' + val.toString();
        }
        if (_.isObject(val)) {
            return JSON.stringify(val);
        }
    }
    catch (_a) { }
    return '' + val;
}
exports.toStringSafe = toStringSafe;
/**
 * Tries to clear an interval.
 *
 * @param {NodeJS.Timer} intervalId The timeout (ID).
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
 * Tries to dispose an object.
 *
 * @param {object} obj The object to dispose.
 *
 * @return {boolean} Operation was successful or not.
 */
function tryDispose(obj) {
    try {
        if (obj && obj.dispose) {
            obj.dispose();
        }
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.tryDispose = tryDispose;
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
        const TIME_UNTIL_NEXT_CHECK = parseInt(toStringSafe(opts.timeUntilNextCheck).trim());
        const TIMEOUT = parseInt(toStringSafe(opts.timeout).trim());
        let runUntil = false;
        if (!isNaN(TIMEOUT)) {
            runUntil = Moment.utc()
                .add(TIMEOUT, 'ms');
        }
        let wait;
        do {
            const NOW = Moment.utc();
            if (false !== runUntil) {
                if (runUntil.isAfter(NOW)) {
                    return false;
                }
            }
            wait = toBooleanSafe(yield Promise.resolve(predicate()));
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