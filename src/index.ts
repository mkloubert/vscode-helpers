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
import * as Crypto from 'crypto';
import * as Enumerable from 'node-enumerable';
const IsBinaryFile = require("isbinaryfile");
import * as IsStream from 'is-stream';
import * as Minimatch from 'minimatch';
import * as Moment from 'moment';
import * as OS from 'os';
import * as Path from 'path';
import * as Stream from 'stream';
import * as vscode from 'vscode';
import * as vscode_helpers_events from './events';

// !!!THESE MUST BE INCLUDED AFTER UPPER INCLUDED MODULES!!!
import * as MomentTimeZone from 'moment-timezone';

// sub modules
export * from './cache';
export * from './disposable';
export * from './events';
export * from './fs';
export * from './html';
export * from './logging';
export { from } from 'node-enumerable';
export * from './progress';
export * from './timers';
export * from './workflows';
export * from './workspaces';

/**
 * Action for 'forEachAsync()' function.
 *
 * @param {T} item The current item.
 * @param {number} index The zero based index.
 * @param {T[]} array The array of all elements.
 *
 * @return {TResult|PromiseLike<TResult>} The result.
 */
export type ForEachAsyncAction<T, TResult> = (item: T, index: number, array: T[]) => TResult | PromiseLike<TResult>;

/**
 * Options for 'openAndShowTextDocument()' function.
 */
export type OpenAndShowTextDocumentOptions = string | {
    /**
     * The initial content.
     */
    content?: string;
    /**
     * The language.
     */
    language?: string;
};

/**
 * Describes a simple 'completed' action.
 *
 * @param {any} err The occurred error.
 * @param {TResult} [result] The result.
 */
export type SimpleCompletedAction<TResult> = (err: any, result?: TResult) => void;

/**
 * Normalizes a string.
 *
 * @param {TStr} str The value to normalize.
 *
 * @return {string} The normalized string.
 */
export type StringNormalizer<TStr = string> = (str: TStr) => string;

/**
 * Stores global data for the current extension session.
 */
export const SESSION: { [key: string]: any } = {};

/**
 * Disposes 'SESSION', by removing its data.
 */
export const SESSION_DISPOSER: vscode.Disposable = {
    /** @inheritdoc */
    dispose: () => {
        for (const P of Object.keys(SESSION)) {
            delete SESSION[ P ];
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
export function applyFuncFor<TFunc extends Function = Function>(
    func: TFunc, thisArgs: any
): TFunc {
    return <any>function() {
        return func.apply(thisArgs, arguments);
    };
}

/**
 * Returns a value as array.
 *
 * @param {T|T[]} val The value.
 * @param {boolean} [removeEmpty] Remove items that are (null) / (undefined) or not.
 *
 * @return {T[]} The value as (new) array.
 */
export function asArray<T>(val: T | T[], removeEmpty = true): T[] {
    removeEmpty = toBooleanSafe(removeEmpty, true);

    return (_.isArray(val) ? val : [ val ]).filter(i => {
        if (removeEmpty) {
            return !_.isNil(i);
        }

        return true;
    });
}

/**
 * Returns a value as buffer.
 *
 * @param {any} val The value to convert / cast.
 * @param {string} enc The custom encoding for the string parsers.
 * @param {number} [maxDepth] The custom value for the max depth of wrapped functions. Default: 63
 *
 * @return {Promise<Buffer>} The promise with the buffer.
 */
export async function asBuffer(val: any, enc?: string, maxDepth?: number): Promise<Buffer> {
    return await asBufferInner(val, enc, null, maxDepth);
}

async function asBufferInner(val: any, enc?: string,
                             funcDepth?: number, maxDepth?: number): Promise<Buffer> {
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

        return asBufferInner(
            await Promise.resolve(
                val(enc, funcDepth, maxDepth),
            ),
            enc,
            funcDepth + 1, maxDepth,
        );
    }

    if (IsStream.readable(val)) {
        // stream
        return await readAll(val);
    }

    if (_.isObject(val)) {
        // JSON object
        return new Buffer(JSON.stringify(val),
                          enc);
    }

    // handle as string
    return new Buffer(toStringSafe(val),
                      enc);
}

/**
 * Returns a value as local Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
export function asLocalTime(val: any): Moment.Moment {
    let localTime: Moment.Moment;

    if (!_.isNil(val)) {
        if (Moment.isMoment(val)) {
            localTime = val;
        } else if (Moment.isDate(val)) {
            localTime = Moment( val );
        } else {
            localTime = Moment( toStringSafe(val) );
        }
    }

    if (localTime) {
        if (!localTime.isLocal()) {
            localTime = localTime.local();
        }
    }

    return localTime;
}

/**
 * Returns a value as UTC Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
export function asUTC(val: any): Moment.Moment {
    let utcTime: Moment.Moment;

    if (!_.isNil(val)) {
        if (Moment.isMoment(val)) {
            utcTime = val;
        } else if (Moment.isDate(val)) {
            utcTime = Moment( val );
        } else {
            utcTime = Moment( toStringSafe(val) );
        }
    }

    if (utcTime) {
        if (!utcTime.isUTC()) {
            utcTime = utcTime.utc();
        }
    }

    return utcTime;
}

/**
 * Clones an object / value deep.
 *
 * @param {T} val The value / object to clone.
 *
 * @return {T} The cloned value / object.
 */
export function cloneObject<T>(val: T): T {
    if (!val) {
        return val;
    }

    return JSON.parse(
        JSON.stringify(val)
    );
}

/**
 * Clones an value flat.
 *
 * @param {T} val The object to clone.
 * @param {boolean} [useNewObjectForFunctions] Use new object as 'thisArg' for functions (true) or
 *                                             the original 'val' (false).
 *
 * @return {T} The cloned object.
 */
export function cloneObjectFlat<T>(val: T,
                                   useNewObjectForFunctions = true): T {
    useNewObjectForFunctions = toBooleanSafe(useNewObjectForFunctions, true);

    if (_.isNil(val)) {
        return val;
    }

    const CLONED_OBJ: T = <any>{};
    const THIS_ARG: any = useNewObjectForFunctions ? CLONED_OBJ : val;

    const ADD_PROPERTY = (prop: string, value: any) => {
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
        let valueToSet: any = value;
        if (_.isFunction(valueToSet)) {
            const FUNC = valueToSet;

            valueToSet = function() {
                return FUNC.apply(THIS_ARG, arguments);
            };
        }

        ADD_PROPERTY(prop, valueToSet);
    });

    return CLONED_OBJ;
}

/**
 * Compares two values for a sort operation.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 *
 * @return {number} The "sort value".
 */
export function compareValues<T>(x: T, y: T): number {
    if (x !== y) {
        if (x > y) {
            return 1;
        } else if (x < y) {
            return -1;
        }
    }

    return 0;
}

/**
 * Compares values by using a selector.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 * @param {Function} selector The selector.
 *
 * @return {number} The "sort value".
 */
export function compareValuesBy<T, U>(x: T, y: T,
                                      selector: (t: T) => U): number {
    return compareValues(selector(x),
                         selector(y));
}

/**
 * Creates a simple 'completed' callback for a promise.
 *
 * @param {Function} resolve The 'succeeded' callback.
 * @param {Function} reject The 'error' callback.
 *
 * @return {SimpleCompletedAction<TResult>} The created action.
 */
export function createCompletedAction<TResult = any>(resolve: (value?: TResult | PromiseLike<TResult>) => void,
                                                     reject?: (reason: any) => void): SimpleCompletedAction<TResult> {
    let completedInvoked = false;

    return (err, result?) => {
        if (completedInvoked) {
            return;
        }
        completedInvoked = true;

        if (err) {
            if (reject) {
                reject(err);
            }
        } else {
            if (resolve) {
                resolve(result);
            }
        }
    };
}

/**
 * Handles a value as string and checks if it does match at least one (minimatch) pattern.
 *
 * @param {any} val The value to check.
 * @param {string|string[]} patterns One or more patterns.
 * @param {Minimatch.IOptions} [options] Additional options.
 *
 * @return {boolean} Does match or not.
 */
export function doesMatch(val: any, patterns: string | string[], options?: Minimatch.IOptions): boolean {
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

/**
 * Async 'forEach'.
 *
 * @param {Enumerable.Sequence<T>} items The items to iterate.
 * @param {Function} action The item action.
 * @param {any} [thisArg] The underlying object / value for the item action.
 *
 * @return {TResult} The result of the last action call.
 */
export async function forEachAsync<T, TResult>(items: Enumerable.Sequence<T>,
                                               action: ForEachAsyncAction<T, TResult>,
                                               thisArg?: any) {
    if (!_.isArrayLike(items)) {
        items = Enumerable.from(items)
                          .toArray();
    }

    let lastResult: TResult;

    for (let i = 0; i < (<ArrayLike<T>>items).length; i++) {
        lastResult = await Promise.resolve(
            action.apply(thisArg,
                         [ items[i], i, items ]),
        );
    }

    return lastResult;
}

/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {any[]} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
export function format(formatStr: any, ...args: any[]): string {
    return formatArray(formatStr, args);
}

/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {Enumerable.Sequence<any>} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
export function formatArray(formatStr: any, args: Enumerable.Sequence<any>): string {
    formatStr = toStringSafe(formatStr);

    if (!_.isArrayLike(args)) {
        args = Enumerable.from(args)
                         .toArray();
    }

    // apply arguments in
    // placeholders
    return formatStr.replace(/{(\d+)(\:)?([^}]*)}/g, (match, index, formatSeparator, formatExpr) => {
        index = parseInt(
            toStringSafe(index)
        );

        let resultValue = (<ArrayLike<any>>args)[index];

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

/**
 * Checks if data is binary or text content.
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {Promise<boolean>} The promise that indicates if content is binary or not.
 */
export function isBinaryContent(data: Buffer): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const COMPLETED = createCompletedAction<boolean>(resolve, reject);

        try {
            IsBinaryFile(data, data.length, (err, result) => {
                COMPLETED(err, result);
            });
        } catch (e) {
            COMPLETED(e);
        }
    });
}

/**
 * Checks if data is binary or text content (sync).
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {boolean} Content is binary or not.
 */
export function isBinaryContentSync(data: Buffer): boolean {
    return IsBinaryFile.sync(data, data.length);
}

/**
 * Checks if the string representation of a value is empty
 * or contains whitespaces only.
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is empty or not.
 */
export function isEmptyString(val: any): boolean {
    return '' === toStringSafe(val).trim();
}

/**
 * Loads a module from a script.
 *
 * @param {string} file The path to the script.
 * @param {boolean} [fromCache] Cache module or not.
 *
 * @return {TModule} The loaded module.
 */
export function loadModule<TModule = any>(file: string, fromCache = false): TModule {
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

/**
 * Normalizes a value as string so that is comparable.
 *
 * @param {any} val The value to convert.
 * @param {StringNormalizer} [normalizer] The custom normalizer.
 *
 * @return {string} The normalized value.
 */
export function normalizeString(val: any, normalizer?: StringNormalizer): string {
    if (!normalizer) {
        normalizer = (str) => str.toLowerCase().trim();
    }

    return normalizer( toStringSafe(val) );
}

/**
 * Returns the current time.
 *
 * @param {string} [timezone] The custom timezone to use.
 *
 * @return {Moment.Moment} The current time.
 */
export function now(timezone?: string): Moment.Moment {
    timezone = toStringSafe(timezone).trim();

    const NOW = Moment();
    return '' === timezone ? NOW
                           : NOW.tz(timezone);
}

/**
 * Opens and shows a new text document / editor.
 *
 * @param {OpenAndShowTextDocumentOptions} [filenameOrOpts] The custom options or the path to the file to open.
 *
 * @return {vscode.TextEditor} The promise with the new, opened text editor.
 */
export async function openAndShowTextDocument(filenameOrOpts?: OpenAndShowTextDocumentOptions) {
    if (_.isNil(filenameOrOpts)) {
        filenameOrOpts = {
            content: '',
            language: 'plaintext',
        };
    }

    return await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument( <any>filenameOrOpts )
    );
}

/**
 * Promise version of 'crypto.randomBytes()' function.
 *
 * @param {number} size The size of the result.
 *
 * @return {Promise<Buffer>} The buffer with the random bytes.
 */
export function randomBytes(size: number) {
    size = parseInt(
        toStringSafe(size).trim()
    );

    return new Promise<Buffer>((resolve, reject) => {
        const COMPLETED = createCompletedAction(resolve, reject);

        Crypto.randomBytes(size, (err, buf) => {
            COMPLETED(err, buf);
        });
    });
}

/**
 * Reads the content of a stream.
 *
 * @param {Stream.Readable} stream The stream.
 * @param {string} [enc] The custom (string) encoding to use.
 *
 * @returns {Promise<Buffer>} The promise with the content.
 */
export function readAll(stream: Stream.Readable, enc?: string): Promise<Buffer> {
    enc = normalizeString(enc);
    if ('' === enc) {
        enc = undefined;
    }

    return new Promise<Buffer>((resolve, reject) => {
        let buff: Buffer;

        let dataListener: (chunk: Buffer | string) => void;
        let endListener: () => void;
        let errorListener: (err: any) => void;

        let completedInvoked = false;
        const COMPLETED = (err: any) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;

            vscode_helpers_events.tryRemoveListener(stream, 'data', dataListener);
            vscode_helpers_events.tryRemoveListener(stream, 'end', endListener);
            vscode_helpers_events.tryRemoveListener(stream, 'error', errorListener);

            if (err) {
                reject(err);
            } else {
                resolve(buff);
            }
        };

        if (_.isNil(stream)) {
            buff = <any>stream;

            COMPLETED(null);
            return;
        }

        errorListener = (err: any) => {
            if (err) {
                COMPLETED(err);
            }
        };

        dataListener = (chunk: Buffer | string) => {
            try {
                if (!chunk || chunk.length < 1) {
                    return;
                }

                if (_.isString(chunk)) {
                    chunk = new Buffer(chunk, enc);
                }

                buff = Buffer.concat([ buff, chunk ]);
            } catch (e) {
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
        } catch (e) {
            COMPLETED(e);
        }
    });
}

/**
 * Returns a sequence object as new array.
 *
 * @param {Enumerable.Sequence<T>} seq The input object.
 * @param {boolean} [normalize] Returns an empty array, if input object is (null) / (undefined).
 *
 * @return {T[]} The input object as array.
 */
export function toArray<T>(seq: Enumerable.Sequence<T>, normalize = true): T[] {
    if (_.isNil(seq)) {
        if (toBooleanSafe(normalize, true)) {
            return [];
        }

        return <any>seq;
    }

    if (_.isArrayLike(seq)) {
        const NEW_ARRAY: T[] = [];

        for (let i = 0; i < seq.length; i++) {
            NEW_ARRAY.push( seq[i] );
        }

        return NEW_ARRAY;
    }

    return Enumerable.from( seq )
                     .toArray();
}


/**
 * Returns a value as boolean, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {boolean} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {boolean} 'val' as boolean.
 */
export function toBooleanSafe(val: any, defaultVal = false): boolean {
    if (_.isBoolean(val)) {
        return val;
    }

    if (_.isNil(val)) {
        return !!defaultVal;
    }

    return !!val;
}

/**
 * Converts an EOL enum value to a string.
 *
 * @param {vscode.EndOfLine} [eol] The (optional) enum value.
 *
 * @return string The EOL string.
 */
export function toEOL(eol?: vscode.EndOfLine): string {
    switch (eol) {
        case vscode.EndOfLine.CRLF:
            return "\r\n";

        case vscode.EndOfLine.LF:
            return "\n";
    }

    return OS.EOL;
}

/**
 * Returns a value as string, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {string} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {string} 'val' as string.
 */
export function toStringSafe(val: any, defaultVal = ''): string {
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
    } catch { }

    return '' + val;
}

/**
 * Returns the current UTC time.
 *
 * @return {Moment.Moment} The current UTC time.
 */
export function utcNow(): Moment.Moment {
    return Moment.utc();
}
