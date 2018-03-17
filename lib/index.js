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
const Enumerable = require("node-enumerable");
const Glob = require("glob");
const IsBinaryFile = require("isbinaryfile");
const MergeDeep = require('merge-deep');
const Moment = require("moment");
const OS = require("os");
const Path = require("path");
const vscode = require("vscode");
const vscode_workflows = require("./workflows");
// sub modules
__export(require("./cache"));
__export(require("./disposable"));
__export(require("./html"));
__export(require("./logging"));
var node_enumerable_1 = require("node-enumerable");
exports.from = node_enumerable_1.from;
__export(require("./progress"));
__export(require("./workflows"));
__export(require("./workspaces"));
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
 * Clones an value flat.
 *
 * @param {T} val The object to clone.
 * @param {boolean} [useNewObjectForFunctions] Use new object as 'thisArg' for functions (true) or
 *                                             the original 'val' (false).
 *
 * @return {T} The cloned object.
 */
function cloneObjectFlat(val, useNewObjectForFunctions = true) {
    useNewObjectForFunctions = toBooleanSafe(useNewObjectForFunctions, true);
    if (_.isNil(val)) {
        return val;
    }
    const CLONED_OBJ = {};
    const THIS_ARG = useNewObjectForFunctions ? CLONED_OBJ : val;
    const ADD_PROPERTY = (prop, value) => {
        Object.defineProperty(CLONED_OBJ, prop, {
            configurable: true,
            enumerable: true,
            get: () => {
                return value;
            },
            set: (newValue) => {
                value = newValue;
            },
        });
    };
    _.forIn(val, (value, prop) => {
        let valueToSet = value;
        if (_.isFunction(valueToSet)) {
            const FUNC = valueToSet;
            valueToSet = function () {
                return FUNC.apply(THIS_ARG, arguments);
            };
        }
        ADD_PROPERTY(prop, valueToSet);
    });
    return CLONED_OBJ;
}
exports.cloneObjectFlat = cloneObjectFlat;
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
 * Async 'forEach'.
 *
 * @param {Enumerable.Sequence<T>} items The items to iterate.
 * @param {Function} action The item action.
 * @param {any} [thisArg] The underlying object / value for the item action.
 *
 * @return {TResult} The result of the last action call.
 */
function forEachAsync(items, action, thisArg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_.isArrayLike(items)) {
            items = Enumerable.from(items)
                .toArray();
        }
        let lastResult;
        for (let i = 0; i < items.length; i++) {
            lastResult = yield Promise.resolve(action.apply(thisArg, [items[i], i, items]));
        }
        return lastResult;
    });
}
exports.forEachAsync = forEachAsync;
/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {any[]} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
function format(formatStr, ...args) {
    return formatArray(formatStr, args);
}
exports.format = format;
/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {any[]} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
function formatArray(formatStr, args) {
    formatStr = toStringSafe(formatStr);
    // apply arguments in
    // placeholders
    return formatStr.replace(/{(\d+)(\:)?([^}]*)}/g, (match, index, formatSeparator, formatExpr) => {
        index = parseInt(toStringSafe(index));
        let resultValue = args[index];
        if (':' === formatSeparator) {
            // collect "format providers"
            let formatProviders = toStringSafe(formatExpr).split(',')
                .map(x => x.toLowerCase().trim())
                .filter(x => x);
            // transform argument by
            // format providers
            formatProviders.forEach(fp => {
                switch (fp) {
                    case 'ending_space':
                        resultValue = toStringSafe(resultValue);
                        if ('' !== resultValue) {
                            resultValue = resultValue + ' ';
                        }
                        break;
                    case 'leading_space':
                        resultValue = toStringSafe(resultValue);
                        if ('' !== resultValue) {
                            resultValue = ' ' + resultValue;
                        }
                        break;
                    case 'lower':
                        resultValue = toStringSafe(resultValue).toLowerCase();
                        break;
                    case 'trim':
                        resultValue = toStringSafe(resultValue).trim();
                        break;
                    case 'upper':
                        resultValue = toStringSafe(resultValue).toUpperCase();
                        break;
                    case 'surround':
                        resultValue = toStringSafe(resultValue);
                        if ('' !== resultValue) {
                            resultValue = "'" + toStringSafe(resultValue) + "'";
                        }
                        break;
                }
            });
        }
        if (_.isUndefined(resultValue)) {
            return match;
        }
        return toStringSafe(resultValue);
    });
}
exports.formatArray = formatArray;
/**
 * Promise version of 'Glob()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {Promise<string[]>} The promise with the matches.
 */
function glob(patterns, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const DEFAULT_OPTS = {
            absolute: true,
            dot: false,
            nocase: true,
            nodir: true,
            nonull: false,
            nosort: false,
            sync: false,
        };
        opts = MergeDeep({}, DEFAULT_OPTS, opts);
        const WF = vscode_workflows.buildWorkflow();
        WF.next(() => {
            return [];
        });
        asArray(patterns).forEach(p => {
            WF.next((allMatches) => {
                return new Promise((res, rej) => {
                    const COMPLETED = createCompletedAction(res, rej);
                    try {
                        Glob(p, opts, (err, matches) => {
                            if (err) {
                                COMPLETED(err);
                            }
                            else {
                                allMatches.push
                                    .apply(allMatches, matches);
                                COMPLETED(null, allMatches);
                            }
                        });
                    }
                    catch (e) {
                        COMPLETED(e);
                    }
                });
            });
        });
        return Enumerable.from(yield WF.start())
            .select(m => Path.resolve(m))
            .distinct()
            .toArray();
    });
}
exports.glob = glob;
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
 * Checks if data is binary or text content.
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {Promise<boolean>} The promise that indicates if content is binary or not.
 */
function isBinaryContent(data) {
    return new Promise((resolve, reject) => {
        const COMPLETED = createCompletedAction(resolve, reject);
        try {
            IsBinaryFile(data, data.length, (err, result) => {
                COMPLETED(err, result);
            });
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.isBinaryContent = isBinaryContent;
/**
 * Checks if data is binary or text content (sync).
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {boolean} Content is binary or not.
 */
function isBinaryContentSync(data) {
    return IsBinaryFile.sync(data, data.length);
}
exports.isBinaryContentSync = isBinaryContentSync;
/**
 * Checks if the string representation of a value is empty
 * or contains whitespaces only.
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is empty or not.
 */
function isEmptyString(val) {
    return '' === toStringSafe(val).trim();
}
exports.isEmptyString = isEmptyString;
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
 * Returns a sequence object as new array.
 *
 * @param {Enumerable.Sequence<T>} arr The input object.
 * @param {boolean} [normalize] Returns an empty array, if input object is (null) / (undefined).
 *
 * @return {T[]} The input object as array.
 */
function toArray(arr, normalize = true) {
    if (_.isNil(arr)) {
        if (toBooleanSafe(normalize, true)) {
            return [];
        }
        return arr;
    }
    if (_.isArrayLike(arr)) {
        const NEW_ARRAY = [];
        for (let i = 0; i < arr.length; i++) {
            NEW_ARRAY.push(arr[i]);
        }
        return NEW_ARRAY;
    }
    return Enumerable.from(arr)
        .toArray();
}
exports.toArray = toArray;
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