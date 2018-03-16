/// <reference types="glob" />
/// <reference types="node" />
import * as Glob from 'glob';
import * as Moment from 'moment';
import * as vscode from 'vscode';
export * from './disposable';
export * from './logging';
export { from } from 'node-enumerable';
export * from './progress';
export * from './workflows';
/**
 * An action for 'invokeAfter()' function.
 *
 * @param {any[]} [args] The arguments for the action.
 *
 * @return {TResult|PromiseLike<TResult>} The result of the action.
 */
export declare type InvokeAfterAction<TResult = any> = (...args: any[]) => TResult | PromiseLike<TResult>;
/**
 * Describes a simple 'completed' action.
 *
 * @param {any} err The occurred error.
 * @param {TResult} [result] The result.
 */
export declare type SimpleCompletedAction<TResult> = (err: any, result?: TResult) => void;
/**
 * Normalizes a string.
 *
 * @param {TStr} str The value to normalize.
 *
 * @return {string} The normalized string.
 */
export declare type StringNormalizer<TStr = string> = (str: TStr) => string;
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
 * Applies a function for a specific object / value.
 *
 * @param {TFunc} func The function.
 * @param {any} [thisArgs] The object to apply to the function.
 *
 * @return {TFunc} The wrapped function.
 */
export declare function applyFuncFor<TFunc extends Function = Function>(func: TFunc, thisArgs: any): TFunc;
/**
 * Returns a value as array.
 *
 * @param {T|T[]} val The value.
 * @param {boolean} [removeEmpty] Remove items that are (null) / (undefined) or not.
 *
 * @return {T[]} The value as array.
 */
export declare function asArray<T>(val: T | T[], removeEmpty?: boolean): T[];
/**
 * Returns a value as local Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
export declare function asLocalTime(val: any): Moment.Moment;
/**
 * Returns a value as UTC Moment instance.
 *
 * @param {any} val The input value.
 *
 * @return {Moment.Moment} The output value.
 */
export declare function asUTC(val: any): Moment.Moment;
/**
 * Clones an object / value deep.
 *
 * @param {T} val The value / object to clone.
 *
 * @return {T} The cloned value / object.
 */
export declare function cloneObject<T>(val: T): T;
/**
 * Compares two values for a sort operation.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 *
 * @return {number} The "sort value".
 */
export declare function compareValues<T>(x: T, y: T): number;
/**
 * Compares values by using a selector.
 *
 * @param {T} x The left value.
 * @param {T} y The right value.
 * @param {Function} selector The selector.
 *
 * @return {number} The "sort value".
 */
export declare function compareValuesBy<T, U>(x: T, y: T, selector: (t: T) => U): number;
/**
 * Creates a simple 'completed' callback for a promise.
 *
 * @param {Function} resolve The 'succeeded' callback.
 * @param {Function} reject The 'error' callback.
 *
 * @return {SimpleCompletedAction<TResult>} The created action.
 */
export declare function createCompletedAction<TResult = any>(resolve: (value?: TResult | PromiseLike<TResult>) => void, reject?: (reason: any) => void): SimpleCompletedAction<TResult>;
/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {any[]} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
export declare function format(formatStr: any, ...args: any[]): string;
/**
 * Formats a string.
 *
 * @param {any} formatStr The value that represents the format string.
 * @param {any[]} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
export declare function formatArray(formatStr: any, args: any[]): string;
/**
 * Promise version of 'Glob()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {Promise<string[]>} The promise with the matches.
 */
export declare function glob(patterns: string | string[], opts?: Glob.IOptions): Promise<string[]>;
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
 * Normalizes a value as string so that is comparable.
 *
 * @param {any} val The value to convert.
 * @param {StringNormalizer} [normalizer] The custom normalizer.
 *
 * @return {string} The normalized value.
 */
export declare function normalizeString(val: any, normalizer?: StringNormalizer): string;
/**
 * Promise version of 'crypto.randomBytes()' function.
 *
 * @param {number} size The size of the result.
 *
 * @return {Promise<Buffer>} The buffer with the random bytes.
 */
export declare function randomBytes(size: number): Promise<Buffer>;
/**
 * Waits a number of milliseconds.
 *
 * @param {number} [ms] The custom time, in milliseconds, to wait.
 */
export declare function sleep(ms?: number): Promise<void>;
/**
 * Returns a value as boolean, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {boolean} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {boolean} 'val' as boolean.
 */
export declare function toBooleanSafe(val: any, defaultVal?: boolean): boolean;
/**
 * Converts an EOL enum value to a string.
 *
 * @param {vscode.EndOfLine} [eol] The (optional) enum value.
 *
 * @return string The EOL string.
 */
export declare function toEOL(eol?: vscode.EndOfLine): string;
/**
 * Returns a value as string, which is not (null) and (undefined).
 *
 * @param {any} val The value to convert.
 * @param {string} [defaultVal] The custom default value if 'val' is (null) or (undefined).
 *
 * @return {string} 'val' as string.
 */
export declare function toStringSafe(val: any, defaultVal?: string): string;
/**
 * Tries to clear an interval.
 *
 * @param {NodeJS.Timer} intervalId The timeout (ID).
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
