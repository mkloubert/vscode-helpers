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
const FastGlob = require("fast-glob");
const FS = require("fs");
const FSExtra = require("fs-extra");
const Glob = require("glob");
const MergeDeep = require('merge-deep');
const Path = require("path");
const TMP = require("tmp");
const vscode_helpers = require("../index");
const vscode_workflows = require("../workflows");
/**
 * Creates a directory (if needed).
 *
 * @param {string} dir The path of the directory to create.
 *
 * @return {Promise<boolean>} The promise that indicates if directory has been created or not.
 */
function createDirectoryIfNeeded(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        dir = vscode_helpers.toStringSafe(dir);
        if (!(yield exists(dir))) {
            yield FSExtra.mkdirs(dir);
            return true;
        }
        return false;
    });
}
exports.createDirectoryIfNeeded = createDirectoryIfNeeded;
/**
 * Promise version of 'FS.exists()' function.
 *
 * @param {string|Buffer} path The path.
 *
 * @return {Promise<boolean>} The promise that indicates if path exists or not.
 */
function exists(path) {
    return new Promise((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);
        try {
            FS.exists(path, (doesExist) => {
                COMPLETED(null, doesExist);
            });
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.exists = exists;
/**
 * Fast version of 'node-glob'.
 *
 * @param {string|string[]} patterns One or more patterns to search for.
 * @param {FastGlob.Options} [opts] Custom options.
 *
 * @return {Promise<FastGlobEntryItem[]>} Promise with the found files / directories.
 */
function fastGlob(patterns, opts) {
    return FastGlob(patterns, opts);
}
exports.fastGlob = fastGlob;
/**
 * Fast version of 'node-glob' (sync).
 *
 * @param {string|string[]} patterns One or more patterns to search for.
 * @param {FastGlob.Options} [opts] Custom options.
 *
 * @return {FastGlobEntryItem[]} The found files / directories.
 */
function fastGlobSync(patterns, opts) {
    return FastGlob.sync(patterns, opts);
}
exports.fastGlobSync = fastGlobSync;
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
        opts = normalizeGlobOptions(opts, {
            sync: false,
        });
        const WF = vscode_workflows.buildWorkflow();
        WF.next(() => {
            return [];
        });
        vscode_helpers.asArray(patterns).forEach(p => {
            WF.next((allMatches) => {
                return new Promise((res, rej) => {
                    const COMPLETED = vscode_helpers.createCompletedAction(res, rej);
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
        return vscode_helpers.from(yield WF.start())
            .select(m => Path.resolve(m))
            .distinct()
            .toArray();
    });
}
exports.glob = glob;
/**
 * Multi pattern version of 'Glob.sync()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {string[]} The matches.
 */
function globSync(patterns, opts) {
    opts = normalizeGlobOptions(opts, {
        sync: true,
    });
    const ALL_MATCHES = [];
    vscode_helpers.asArray(patterns).forEach(p => {
        ALL_MATCHES.push
            .apply(ALL_MATCHES, Glob.sync(p, opts));
    });
    return vscode_helpers.from(ALL_MATCHES)
        .select(m => Path.resolve(m))
        .distinct()
        .toArray();
}
exports.globSync = globSync;
function invokeForStats(path, useLSTAT, func, defaultValue) {
    return __awaiter(this, void 0, void 0, function* () {
        path = vscode_helpers.toStringSafe(path);
        useLSTAT = vscode_helpers.toBooleanSafe(useLSTAT, true);
        if (yield exists(path)) {
            const STATS = useLSTAT ? (yield FSExtra.lstat(path))
                : (yield FSExtra.stat(path));
            if (STATS) {
                return func(STATS);
            }
        }
        return defaultValue;
    });
}
function invokeForStatsSync(path, useLSTAT, func, defaultValue) {
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
function isBlockDevice(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isBlockDevice(), false);
    });
}
exports.isBlockDevice = isBlockDevice;
/**
 * Checks if a path exists and is a block device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isBlockDeviceSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isBlockDevice(), false);
}
exports.isBlockDeviceSync = isBlockDeviceSync;
/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isCharacterDevice(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isCharacterDevice(), false);
    });
}
exports.isCharacterDevice = isCharacterDevice;
/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isCharacterDeviceSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isCharacterDevice(), false);
}
exports.isCharacterDeviceSync = isCharacterDeviceSync;
/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isDirectory(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isDirectory(), false);
    });
}
exports.isDirectory = isDirectory;
/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isDirectorySync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isDirectory(), false);
}
exports.isDirectorySync = isDirectorySync;
/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isFIFO(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isFIFO(), false);
    });
}
exports.isFIFO = isFIFO;
/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isFIFOSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isFIFO(), false);
}
exports.isFIFOSync = isFIFOSync;
/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isFile(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isFile(), false);
    });
}
exports.isFile = isFile;
/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isFileSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isFile(), false);
}
exports.isFileSync = isFileSync;
/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isSocket(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isSocket(), false);
    });
}
exports.isSocket = isSocket;
/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isSocketSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isSocket(), false);
}
exports.isSocketSync = isSocketSync;
/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
function isSymbolicLink(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return invokeForStats(path, useLSTAT, (stats) => stats.isSymbolicLink(), false);
    });
}
exports.isSymbolicLink = isSymbolicLink;
/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
function isSymbolicLinkSync(path, useLSTAT = true) {
    return invokeForStatsSync(path, useLSTAT, (stats) => stats.isSymbolicLink(), false);
}
exports.isSymbolicLinkSync = isSymbolicLinkSync;
function normalizeGlobOptions(opts, callerDefaultOpts) {
    const DEFAULT_OPTS = {
        absolute: true,
        dot: false,
        nocase: true,
        nodir: true,
        nonull: false,
        nosort: false,
    };
    return MergeDeep({}, DEFAULT_OPTS, callerDefaultOpts, opts);
}
function normalizeTempFileOptions(opts) {
    const DEFAULT_OPTS = {};
    opts = MergeDeep({}, DEFAULT_OPTS, opts);
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
 * Returns the size of a file system element.
 *
 * @param {string|Buffer} path The path to the element.
 * @param {boolean} [useLSTAT] Use 'lstat()' (true) or 'stat()' (false) function.
 *
 * @return {Promise<number>} The promise with the size.
 */
function size(path, useLSTAT = true) {
    return __awaiter(this, void 0, void 0, function* () {
        useLSTAT = vscode_helpers.toBooleanSafe(useLSTAT, true);
        return useLSTAT ? (yield FSExtra.lstat(path)).size
            : (yield FSExtra.stat(path)).size;
    });
}
exports.size = size;
/**
 * Returns the size of a file system element (sync).
 *
 * @param {string|Buffer} path The path to the element.
 * @param {boolean} [useLSTAT] Use 'lstatSync()' (true) or 'statSync()' (false) function.
 *
 * @return {number} The size.
 */
function sizeSync(path, useLSTAT = true) {
    useLSTAT = vscode_helpers.toBooleanSafe(useLSTAT, true);
    return useLSTAT ? FSExtra.lstatSync(path).size
        : FSExtra.statSync(path).size;
}
exports.sizeSync = sizeSync;
/**
 * Invokes an action for a temp file.
 *
 * @param {Function} action The action to invoke.
 * @param {TempFileOptions} [opts] The custom options.
 *
 * @return {Promise<TResult>} The promise with the result of the action.
 */
function tempFile(action, opts) {
    opts = normalizeTempFileOptions(opts);
    return new Promise((resolve, reject) => {
        let completedInvoked = false;
        let tempFile = false;
        const COMPLETED = (err, result) => {
            if (completedInvoked) {
                return;
            }
            completedInvoked = true;
            try {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }
            finally {
                tryUnlinkTempFile(tempFile, opts);
            }
        };
        try {
            TMP.tmpName(toTmpSimpleOptions(opts), (err, path) => {
                if (err) {
                    COMPLETED(err);
                }
                else {
                    tempFile = path;
                    try {
                        Promise.resolve(action(tempFile)).then((result) => {
                            COMPLETED(null, result);
                        }).catch((e) => {
                            COMPLETED(e);
                        });
                    }
                    catch (e) {
                        COMPLETED(e);
                    }
                }
            });
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.tempFile = tempFile;
function toTmpSimpleOptions(opts) {
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
function tempFileSync(action, opts) {
    opts = normalizeTempFileOptions(opts);
    let tempFile = false;
    try {
        tempFile = TMP.tmpNameSync(toTmpSimpleOptions(opts));
        return action(tempFile);
    }
    finally {
        tryUnlinkTempFile(tempFile, opts);
    }
}
exports.tempFileSync = tempFileSync;
function tryUnlinkTempFile(file, opts) {
    try {
        if (false !== file) {
            if (!vscode_helpers.toBooleanSafe(opts.keep)) {
                if (isFileSync(file)) {
                    FSExtra.unlinkSync(file);
                }
            }
        }
        return true;
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=index.js.map