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
const IsBinaryFile = require("isbinaryfile");
const IsStream = require("is-stream");
const Minimatch = require("minimatch");
const Moment = require("moment");
const OS = require("os");
const Path = require("path");
const vscode = require("vscode");
const vscode_helpers_events = require("./events");
// sub modules
__export(require("./cache"));
__export(require("./disposable"));
__export(require("./events"));
__export(require("./fs"));
__export(require("./html"));
__export(require("./logging"));
var node_enumerable_1 = require("node-enumerable");
exports.from = node_enumerable_1.from;
__export(require("./progress"));
__export(require("./timers"));
__export(require("./workflows"));
__export(require("./workspaces"));
/**
 * Stores global data for the current extension session.
 */
exports.SESSION = {};
/**
 * Disposes 'SESSION', by removing its data.
 */
exports.SESSION_DISPOSER = {
    /** @inheritdoc */
    dispose: () => {
        for (const P of Object.keys(exports.SESSION)) {
            delete exports.SESSION[P];
        }
    }
};
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
 * @return {T[]} The value as (new) array.
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
 * Returns a value as buffer.
 *
 * @param {any} val The value to convert / cast.
 * @param {string} enc The custom encoding for the string parsers.
 * @param {number} [maxDepth] The custom value for the max depth of wrapped functions. Default: 63
 *
 * @return {Promise<Buffer>} The promise with the buffer.
 */
function asBuffer(val, enc, maxDepth) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield asBufferInner(val, enc, null, maxDepth);
    });
}
exports.asBuffer = asBuffer;
function asBufferInner(val, enc, funcDepth, maxDepth) {
    return __awaiter(this, void 0, void 0, function* () {
        enc = normalizeString(enc);
        if ('' === enc) {
            enc = undefined;
        }
        if (isNaN(funcDepth)) {
            funcDepth = 0;
        }
        if (isNaN(maxDepth)) {
            maxDepth = 63;
        }
        if (funcDepth > maxDepth) {
            throw new Error(`Maximum depth of ${maxDepth} reached!`);
        }
        if (Buffer.isBuffer(val) || _.isNil(val)) {
            return val;
        }
        if (_.isFunction(val)) {
            // wrapped
            return asBufferInner(yield Promise.resolve(val(enc, funcDepth, maxDepth)), enc, funcDepth + 1, maxDepth);
        }
        if (IsStream.readable(val)) {
            // stream
            return yield readAll(val);
        }
        if (_.isObject(val)) {
            // JSON object
            return new Buffer(JSON.stringify(val), enc);
        }
        // handle as string
        return new Buffer(toStringSafe(val), enc);
    });
}
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
 * Handles a value as string and checks if it does match at least one (minimatch) pattern.
 *
 * @param {any} val The value to check.
 * @param {string|string[]} patterns One or more patterns.
 * @param {Minimatch.IOptions} [options] Additional options.
 *
 * @return {boolean} Does match or not.
 */
function doesMatch(val, patterns, options) {
    val = toStringSafe(val);
    patterns = asArray(patterns).map(p => {
        return toStringSafe(p);
    });
    for (const P of patterns) {
        if (Minimatch(val, P, options)) {
            return true;
        }
    }
    return false;
}
exports.doesMatch = doesMatch;
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
 * @param {Enumerable.Sequence<any>} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
function formatArray(formatStr, args) {
    formatStr = toStringSafe(formatStr);
    if (!_.isArrayLike(args)) {
        args = Enumerable.from(args)
            .toArray();
    }
    // apply arguments in
    // placeholders
    return formatStr.replace(/{(\d+)(\:)?([^}]*)}/g, (match, index, formatSeparator, formatExpr) => {
        index = parseInt(toStringSafe(index));
        let resultValue = args[index];
        if (':' === formatSeparator) {
            // collect "format providers"
            const FORMAT_PROVIDERS = toStringSafe(formatExpr).split(',')
                .map(x => x.toLowerCase().trim())
                .filter(x => x);
            // transform argument by
            // format providers
            FORMAT_PROVIDERS.forEach(fp => {
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
 * Loads a module from a script.
 *
 * @param {string} file The path to the script.
 * @param {boolean} [fromCache] Cache module or not.
 *
 * @return {TModule} The loaded module.
 */
function loadModule(file, fromCache = false) {
    file = toStringSafe(file);
    if (isEmptyString(file)) {
        file = './module.js';
    }
    if (!Path.isAbsolute(file)) {
        file = Path.join(process.cwd(), file);
    }
    file = Path.resolve(file);
    fromCache = toBooleanSafe(fromCache);
    if (!fromCache) {
        delete require.cache[file];
    }
    return require(file);
}
exports.loadModule = loadModule;
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
 * Returns the current time.
 *
 * @param {string} [timezone] The custom timezone to use.
 *
 * @return {Moment.Moment} The current time.
 */
function now(timezone) {
    timezone = toStringSafe(timezone).trim();
    const NOW = Moment();
    return '' === timezone ? NOW
        : NOW.tz(timezone);
}
exports.now = now;
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
 * Reads the content of a stream.
 *
 * @param {Stream.Readable} stream The stream.
 * @param {string} [enc] The custom (string) encoding to use.
 *
 * @returns {Promise<Buffer>} The promise with the content.
 */
function readAll(stream, enc) {
    enc = normalizeString(enc);
    if ('' === enc) {
        enc = undefined;
    }
    return new Promise((resolve, reject) => {
        let buff;
        let dataListener;
        let endListener;
        let errorListener;
        let completedInvoked = false;
        const COMPLETED = (err) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            vscode_helpers_events.tryRemoveListener(stream, 'data', dataListener);
            vscode_helpers_events.tryRemoveListener(stream, 'end', endListener);
            vscode_helpers_events.tryRemoveListener(stream, 'error', errorListener);
            if (err) {
                reject(err);
            }
            else {
                resolve(buff);
            }
        };
        if (_.isNil(stream)) {
            buff = stream;
            COMPLETED(null);
            return;
        }
        errorListener = (err) => {
            if (err) {
                COMPLETED(err);
            }
        };
        dataListener = (chunk) => {
            try {
                if (!chunk || chunk.length < 1) {
                    return;
                }
                if (_.isString(chunk)) {
                    chunk = new Buffer(chunk, enc);
                }
                buff = Buffer.concat([buff, chunk]);
            }
            catch (e) {
                COMPLETED(e);
            }
        };
        endListener = () => {
            COMPLETED(null);
        };
        try {
            stream.on('error', errorListener);
            buff = Buffer.alloc(0);
            stream.once('end', endListener);
            stream.on('data', dataListener);
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.readAll = readAll;
/**
 * Returns a sequence object as new array.
 *
 * @param {Enumerable.Sequence<T>} seq The input object.
 * @param {boolean} [normalize] Returns an empty array, if input object is (null) / (undefined).
 *
 * @return {T[]} The input object as array.
 */
function toArray(seq, normalize = true) {
    if (_.isNil(seq)) {
        if (toBooleanSafe(normalize, true)) {
            return [];
        }
        return seq;
    }
    if (_.isArrayLike(seq)) {
        const NEW_ARRAY = [];
        for (let i = 0; i < seq.length; i++) {
            NEW_ARRAY.push(seq[i]);
        }
        return NEW_ARRAY;
    }
    return Enumerable.from(seq)
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
 * Returns the current UTC time.
 *
 * @return {Moment.Moment} The current UTC time.
 */
function utcNow() {
    return Moment.utc();
}
exports.utcNow = utcNow;
//# sourceMappingURL=index.js.map