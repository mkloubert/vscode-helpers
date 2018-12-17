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
import * as ChildProcess from 'child_process';
import * as Enumerable from 'node-enumerable';
import * as Minimatch from 'minimatch';
import * as Moment from 'moment';
import * as PQueue from 'p-queue';
import * as Stream from 'stream';
import * as vscode from 'vscode';
import * as vscode_helpers_devtools from './devtools';
import * as vscode_helpers_scm_git from './scm/git';
export * from './cache';
export * from './devtools';
export * from './disposable';
export * from './events';
export * from './fs';
export * from './html';
export * from './http';
export * from './logging';
export { from, range, repeat } from 'node-enumerable';
export * from './notifications';
export * from './progress';
export * from './timers';
export * from './workflows';
export * from './workspaces';
/**
 * Result of a file execution.
 */
export interface ExecFileResult {
    /**
     * The output from 'standard error' stream.
     */
    stdErr: Buffer;
    /**
     * The output from 'standard output' stream.
     */
    stdOut: Buffer;
    /**
     * The underlying process.
     */
    process: ChildProcess.ChildProcess;
}
/**
 * Action for 'forEachAsync()' function.
 *
 * @param {T} item The current item.
 * @param {number} index The zero based index.
 * @param {T[]} array The array of all elements.
 *
 * @return {TResult|PromiseLike<TResult>} The result.
 */
export declare type ForEachAsyncAction<T, TResult> = (item: T, index: number, array: T[]) => TResult | PromiseLike<TResult>;
/**
 * Describes the structure of the package file (package.json).
 */
export interface PackageFile {
    /**
     * The display name.
     */
    displayName?: string;
    /**
     * The (internal) name.
     */
    name?: string;
    /**
     * The version string.
     */
    version?: string;
}
/**
 * Options for 'openAndShowTextDocument()' function.
 */
export declare type OpenAndShowTextDocumentOptions = string | {
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
 * Is AIX or not.
 */
export declare const IS_AIX: boolean;
/**
 * Is Free BSD or not.
 */
export declare const IS_FREE_BSD: boolean;
/**
 * Is Linux or not.
 */
export declare const IS_LINUX: boolean;
/**
 * Is Sun OS or not.
 */
export declare const IS_MAC: boolean;
/**
 * Is Open BSD or not.
 */
export declare const IS_OPEN_BSD: boolean;
/**
 * Is Sun OS or not.
 */
export declare const IS_SUNOS: boolean;
/**
 * Is Windows or not.
 */
export declare const IS_WINDOWS: boolean;
/**
 * Global execution queue, which only allows one execution at the same time.
 */
export declare const QUEUE: PQueue<PQueue.DefaultAddOptions>;
/**
 * Stores global data for the current extension session.
 */
export declare const SESSION: {
    [key: string]: any;
};
/**
 * Disposes 'SESSION', by removing its data.
 */
export declare const SESSION_DISPOSER: vscode.Disposable;
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
 * @return {T[]} The value as (new) array.
 */
export declare function asArray<T>(val: T | T[], removeEmpty?: boolean): T[];
/**
 * Returns a value as buffer.
 *
 * @param {any} val The value to convert / cast.
 * @param {string} enc The custom encoding for the string parsers.
 * @param {number} [maxDepth] The custom value for the max depth of wrapped functions. Default: 63
 *
 * @return {Promise<Buffer>} The promise with the buffer.
 */
export declare function asBuffer(val: any, enc?: string, maxDepth?: number): Promise<Buffer>;
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
 * Clones an value flat.
 *
 * @param {T} val The object to clone.
 * @param {boolean} [useNewObjectForFunctions] Use new object as 'thisArg' for functions (true) or
 *                                             the original 'val' (false).
 *
 * @return {T} The cloned object.
 */
export declare function cloneObjectFlat<T>(val: T, useNewObjectForFunctions?: boolean): T;
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
 * Alias for 'createDevToolsClient'.
 */
export declare function createChromeClient(opts?: vscode_helpers_devtools.DevToolsClientOptions): vscode_helpers_devtools.DevToolsClient;
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
 * Creates a new instance of a client, which can connect to a DevTools compatible
 * browser like Google Chrome.
 *
 * @param {vscode_helpers_devtools.DevToolsClientOptions} [opts] Custom options.
 *
 * @return {vscode_helpers_devtools.DevToolsClient} The new client instance.
 */
export declare function createDevToolsClient(opts?: vscode_helpers_devtools.DevToolsClientOptions): vscode_helpers_devtools.DevToolsClient;
/**
 * Creates a Git client.
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<vscode_helpers_scm_git.GitClient|false>} The promise with the client or (false) if no client found.
 */
export declare function createGitClient(cwd?: string, path?: string): Promise<vscode_helpers_scm_git.GitClient>;
/**
 * Creates a Git client (sync).
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {vscode_helpers_scm_git.GitClient|false} The client or (false) if no client found.
 */
export declare function createGitClientSync(cwd?: string, path?: string): vscode_helpers_scm_git.GitClient;
/**
 * Creates a new queue.
 *
 * @param {TOpts} [opts] The custom options.
 *
 * @return {PQueue<PQueue.DefaultAddOptions>} The new queue.
 */
export declare function createQueue<TOpts extends PQueue.QueueAddOptions = PQueue.DefaultAddOptions>(opts?: TOpts): PQueue<PQueue.DefaultAddOptions>;
/**
 * Handles a value as string and checks if it does match at least one (minimatch) pattern.
 *
 * @param {any} val The value to check.
 * @param {string|string[]} patterns One or more patterns.
 * @param {Minimatch.IOptions} [options] Additional options.
 *
 * @return {boolean} Does match or not.
 */
export declare function doesMatch(val: any, patterns: string | string[], options?: Minimatch.IOptions): boolean;
/**
 * Executes a file.
 *
 * @param {string} command The thing / command to execute.
 * @param {any[]} [args] One or more argument for the execution.
 * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
 *
 * @return {Promise<ExecFileResult>} The promise with the result.
 */
export declare function execFile(command: string, args?: any[], opts?: ChildProcess.ExecFileOptions): Promise<ExecFileResult>;
/**
 * Async 'forEach'.
 *
 * @param {Enumerable.Sequence<T>} items The items to iterate.
 * @param {Function} action The item action.
 * @param {any} [thisArg] The underlying object / value for the item action.
 *
 * @return {TResult} The result of the last action call.
 */
export declare function forEachAsync<T, TResult>(items: Enumerable.Sequence<T>, action: ForEachAsyncAction<T, TResult>, thisArg?: any): Promise<TResult>;
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
 * @param {Enumerable.Sequence<any>} [args] The arguments for 'formatStr'.
 *
 * @return {string} The formated string.
 */
export declare function formatArray(formatStr: any, args: Enumerable.Sequence<any>): string;
/**
 * Gets the root directory of the extension.
 *
 * @return {string} The root directory of the extension.
 */
export declare function getExtensionRoot(): string;
/**
 * Loads the package file (package.json) of the extension.
 *
 * @param {string} [packageJson] The custom path to the file.
 *
 * @return {Promise<PackageFile>} The promise with the meta data of the file.
 */
export declare function getPackageFile(packageJson?: string): Promise<PackageFile>;
/**
 * Loads the package file (package.json) of the extension sync.
 *
 * @param {string} [packageJson] The custom path to the file.
 *
 * @return {PackageFile} The meta data of the file.
 */
export declare function getPackageFileSync(packageJson?: string): PackageFile;
/**
 * Alias for 'uuid'.
 */
export declare function guid(ver?: string, ...args: any[]): string;
/**
 * Checks if data is binary or text content.
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {Promise<boolean>} The promise that indicates if content is binary or not.
 */
export declare function isBinaryContent(data: Buffer): Promise<boolean>;
/**
 * Checks if data is binary or text content (sync).
 *
 * @param {Buffer} data The data to check.
 *
 * @returns {boolean} Content is binary or not.
 */
export declare function isBinaryContentSync(data: Buffer): boolean;
/**
 * Checks if the string representation of a value is empty
 * or contains whitespaces only.
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is empty or not.
 */
export declare function isEmptyString(val: any): boolean;
/**
 * Loads a module from a script.
 *
 * @param {string} file The path to the script.
 * @param {boolean} [fromCache] Cache module or not.
 *
 * @return {TModule} The loaded module.
 */
export declare function loadModule<TModule = any>(file: string, fromCache?: boolean): TModule;
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
 * Returns the current time.
 *
 * @param {string} [timezone] The custom timezone to use.
 *
 * @return {Moment.Moment} The current time.
 */
export declare function now(timezone?: string): Moment.Moment;
/**
 * Opens and shows a new text document / editor.
 *
 * @param {OpenAndShowTextDocumentOptions} [filenameOrOpts] The custom options or the path to the file to open.
 *
 * @return {vscode.TextEditor} The promise with the new, opened text editor.
 */
export declare function openAndShowTextDocument(filenameOrOpts?: OpenAndShowTextDocumentOptions): Promise<vscode.TextEditor>;
/**
 * Promise version of 'crypto.randomBytes()' function.
 *
 * @param {number} size The size of the result.
 *
 * @return {Promise<Buffer>} The buffer with the random bytes.
 */
export declare function randomBytes(size: number): Promise<Buffer>;
/**
 * Reads the content of a stream.
 *
 * @param {Stream.Readable} stream The stream.
 * @param {string} [enc] The custom (string) encoding to use.
 *
 * @returns {Promise<Buffer>} The promise with the content.
 */
export declare function readAll(stream: Stream.Readable, enc?: string): Promise<Buffer>;
/**
 * Sets the root directory of the extension.
 *
 * @param {string} path The path of the extension.
 *
 * @return {string} The new value.
 */
export declare function setExtensionRoot(path: string): string;
/**
 * Returns a sequence object as new array.
 *
 * @param {Enumerable.Sequence<T>} seq The input object.
 * @param {boolean} [normalize] Returns an empty array, if input object is (null) / (undefined).
 *
 * @return {T[]} The input object as array.
 */
export declare function toArray<T>(seq: Enumerable.Sequence<T>, normalize?: boolean): T[];
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
 * Tries to create a Git client.
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<vscode_helpers_scm_git.GitClient|false>} The promise with the client or (false) if no client found.
 */
export declare function tryCreateGitClient(cwd?: string, path?: string): Promise<vscode_helpers_scm_git.GitClient | false>;
/**
 * Tries to create a Git client (sync).
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {vscode_helpers_scm_git.GitClient|false} The client or (false) if no client found.
 */
export declare function tryCreateGitClientSync(cwd?: string, path?: string): vscode_helpers_scm_git.GitClient | false;
/**
 * Returns the current UTC time.
 *
 * @return {Moment.Moment} The current UTC time.
 */
export declare function utcNow(): Moment.Moment;
/**
 * Generates a new unique ID.
 *
 * @param {string} [ver] The custom version to use. Default: '4'.
 * @param {any[]} [args] Additional arguments for the function.
 *
 * @return {string} The generated ID.
 */
export declare function uuid(ver?: string, ...args: any[]): string;
