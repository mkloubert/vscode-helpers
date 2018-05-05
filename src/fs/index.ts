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

import * as FS from 'fs';
import * as FSExtra from 'fs-extra';
import * as Glob from 'glob';
const MergeDeep = require('merge-deep');
import * as Path from 'path';
import * as TMP from 'tmp';
import * as vscode_helpers from '../index';
import * as vscode_workflows from '../workflows';

/**
 * Options for a temp file.
 */
export interface TempFileOptions {
    /**
     * The custom directory for the file.
     */
    dir?: string;
    /**
     * Keep temp file or not.
     */
    keep?: boolean;
    /**
     * The optional prefix for the name of the file.
     */
    prefix?: string;
    /**
     * The optional suffix for the name of the file.
     */
    suffix?: string;
}

type TempFilePath = string | false;

/**
 * Creates a directory (if needed).
 *
 * @param {string} dir The path of the directory to create.
 *
 * @return {Promise<boolean>} The promise that indicates if directory has been created or not.
 */
export async function createDirectoryIfNeeded(dir: string) {
    dir = vscode_helpers.toStringSafe(dir);

    if (!(await exists(dir))) {
        await FSExtra.mkdirs(dir);

        return true;
    }

    return false;
}

/**
 * Promise version of 'FS.exists()' function.
 *
 * @param {string|Buffer} path The path.
 *
 * @return {Promise<boolean>} The promise that indicates if path exists or not.
 */
export function exists(path: string | Buffer) {
    return new Promise<boolean>((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

        try {
            FS.exists(path, (doesExist) => {
                COMPLETED(null, doesExist);
            });
        } catch (e) {
            COMPLETED(e);
        }
    });
}

/**
 * Promise version of 'Glob()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {Promise<string[]>} The promise with the matches.
 */
export async function glob(patterns: string | string[], opts?: Glob.IOptions) {
    opts = normalizeGlobOptions(opts, {
        sync: false,
    });

    const WF = vscode_workflows.buildWorkflow();

    WF.next(() => {
        return [];
    });

    vscode_helpers.asArray(patterns).forEach(p => {
        WF.next((allMatches: string[]) => {
            return new Promise<string[]>((res, rej) => {
                const COMPLETED = vscode_helpers.createCompletedAction(res, rej);

                try {
                    Glob(p, opts, (err, matches) => {
                        if (err) {
                            COMPLETED(err);
                        } else {
                            allMatches.push
                                      .apply(allMatches, matches);

                            COMPLETED(null, allMatches);
                        }
                    });
                } catch (e) {
                    COMPLETED(e);
                }
            });
        });
    });

    return vscode_helpers.from( await WF.start<string[]>() )
                         .select(m => Path.resolve(m))
                         .distinct()
                         .toArray();
}

/**
 * Multi pattern version of 'Glob.sync()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {string[]} The matches.
 */
export function globSync(patterns: string | string[], opts?: Glob.IOptions) {
    opts = normalizeGlobOptions(opts, {
        sync: true,
    });

    const ALL_MATCHES: string[] = [];

    vscode_helpers.asArray(patterns).forEach(p => {
        ALL_MATCHES.push
                   .apply(ALL_MATCHES, Glob.sync(p, opts));
    });

    return vscode_helpers.from( ALL_MATCHES )
                         .select(m => Path.resolve(m))
                         .distinct()
                         .toArray();
}

async function invokeForStats<TResult = any>(
    path: string, useLSTAT,
    func: (stats: FS.Stats) => TResult,
    defaultValue?: TResult,
): Promise<TResult> {
    path = vscode_helpers.toStringSafe(path);
    useLSTAT = vscode_helpers.toBooleanSafe(useLSTAT, true);

    if (await exists(path)) {
        const STATS = useLSTAT ? (await FSExtra.lstat(path))
                               : (await FSExtra.stat(path));

        if (STATS) {
            return func(STATS);
        }
    }

    return defaultValue;
}

function invokeForStatsSync<TResult = any>(
    path: string, useLSTAT,
    func: (stats: FS.Stats) => TResult,
    defaultValue?: TResult,
): TResult {
    path = vscode_helpers.toStringSafe(path);
    useLSTAT = vscode_helpers.toBooleanSafe(useLSTAT, true);

    if (FS.existsSync(path)) {
        const STATS = useLSTAT ? FS.lstatSync(path)
                               : FS.statSync(path);

        if (STATS) {
            return func(STATS);
        }
    }

    return defaultValue;
}

/**
 * Checks if a path exists and is a block device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isBlockDevice(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isBlockDevice(),
        false
    );
}

/**
 * Checks if a path exists and is a block device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isBlockDeviceSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isBlockDevice(),
        false
    );
}

/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isCharacterDevice(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isCharacterDevice(),
        false
    );
}

/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isCharacterDeviceSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isCharacterDevice(),
        false
    );
}

/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isDirectory(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isDirectory(),
        false
    );
}

/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isDirectorySync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isDirectory(),
        false
    );
}

/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isFIFO(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isFIFO(),
        false
    );
}

/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isFIFOSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isFIFO(),
        false
    );
}

/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isFile(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isFile(),
        false
    );
}

/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isFileSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isFile(),
        false
    );
}

/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isSocket(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isSocket(),
        false
    );
}

/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isSocketSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isSocket(),
        false
    );
}

/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export async function isSymbolicLink(path: string, useLSTAT = true) {
    return invokeForStats<boolean>(
        path, useLSTAT,
        (stats) => stats.isSymbolicLink(),
        false
    );
}

/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export function isSymbolicLinkSync(path: string, useLSTAT = true) {
    return invokeForStatsSync<boolean>(
        path, useLSTAT,
        (stats) => stats.isSymbolicLink(),
        false
    );
}

function normalizeGlobOptions(opts: Glob.IOptions, callerDefaultOpts: Glob.IOptions): Glob.IOptions {
    const DEFAULT_OPTS: Glob.IOptions = {
        absolute: true,
        dot: false,
        nocase: true,
        nodir: true,
        nonull: false,
        nosort: false,
    };

    return MergeDeep({},
                     DEFAULT_OPTS, callerDefaultOpts,
                     opts);
}

function normalizeTempFileOptions(opts: TempFileOptions) {
    const DEFAULT_OPTS: TempFileOptions = {
    };

    opts = MergeDeep({},
                     DEFAULT_OPTS, opts);

    opts.dir = vscode_helpers.toStringSafe(opts.dir);
    if (vscode_helpers.isEmptyString(opts.dir)) {
        opts.dir = undefined;
    }

    opts.prefix = vscode_helpers.toStringSafe(opts.prefix);
    if ('' === opts.prefix) {
        opts.prefix = undefined;
    }

    opts.suffix = vscode_helpers.toStringSafe(opts.suffix);
    if ('' === opts.suffix) {
        opts.suffix = undefined;
    }

    return opts;
}

/**
 * Invokes an action for a temp file.
 *
 * @param {Function} action The action to invoke.
 * @param {TempFileOptions} [opts] The custom options.
 *
 * @return {Promise<TResult>} The promise with the result of the action.
 */
export function tempFile<TResult = any>(
    action: (file: string) => TResult | PromiseLike<TResult>,
    opts?: TempFileOptions,
): Promise<TResult> {
    opts = normalizeTempFileOptions(opts);

    return new Promise<TResult>((resolve, reject) => {
        let completedInvoked = false;
        let tempFile: TempFilePath = false;
        const COMPLETED = (err: any, result?: TResult) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;

            try {
                if (err) {
                    reject( err );
                } else {
                    resolve( result );
                }
            } finally {
                tryUnlinkTempFile(tempFile, opts);
            }
        };

        try {
            TMP.tmpName(toTmpSimpleOptions(opts), (err, path) => {
                if (err) {
                    COMPLETED(err);
                } else {
                    tempFile = path;

                    try {
                        Promise.resolve( action(tempFile) ).then((result) => {
                            COMPLETED(null, result);
                        }).catch((e) => {
                            COMPLETED(e);
                        });
                    } catch (e) {
                        COMPLETED(e);
                    }
                }
            });
        } catch (e) {
            COMPLETED(e);
        }
    });
}

function toTmpSimpleOptions(opts: TempFileOptions): TMP.SimpleOptions {
    return {
        dir: opts.dir,
        keep: true,
        prefix: opts.prefix,
        postfix: opts.suffix,
    };
}

/**
 * Invokes an action for a temp file (sync).
 *
 * @param {Function} action The action to invoke.
 * @param {TempFileOptions} [opts] The custom options.
 *
 * @return {TResult} The result of the action.
 */
export function tempFileSync<TResult = any>(
    action: (file: string) => TResult, opts?: TempFileOptions
): TResult {
    opts = normalizeTempFileOptions(opts);

    let tempFile: TempFilePath = false;
    try {
        tempFile = TMP.tmpNameSync(
            toTmpSimpleOptions(opts)
        );

        return action(tempFile);
    } finally {
        tryUnlinkTempFile(tempFile, opts);
    }
}

function tryUnlinkTempFile(file: TempFilePath, opts?: TempFileOptions) {
    try {
        if (false !== file) {
            if (!vscode_helpers.toBooleanSafe(opts.keep)) {
                FSExtra.unlinkSync( file );
            }
        }

        return true;
    } catch {
        return false;
    }
}
