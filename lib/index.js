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
const ChildProcess = require("child_process");
const Crypto = require("crypto");
const Enumerable = require("node-enumerable");
const FSExtra = require("fs-extra");
const IsBinaryFile = require("isbinaryfile");
const IsStream = require("is-stream");
const MergeDeep = require('merge-deep');
const Minimatch = require("minimatch");
const Moment = require("moment");
const OS = require("os");
const Path = require("path");
const PQueue = require("p-queue");
const vscode = require("vscode");
const vscode_helpers_devtools = require("./devtools");
const vscode_helpers_events = require("./events");
const vscode_helpers_scm_git = require("./scm/git");
// sub modules
__export(require("./cache"));
__export(require("./devtools"));
__export(require("./disposable"));
__export(require("./events"));
__export(require("./fs"));
__export(require("./html"));
__export(require("./http"));
__export(require("./logging"));
var node_enumerable_1 = require("node-enumerable");
exports.from = node_enumerable_1.from;
exports.range = node_enumerable_1.range;
exports.repeat = node_enumerable_1.repeat;
__export(require("./notifications"));
__export(require("./progress"));
__export(require("./timers"));
__export(require("./workflows"));
__export(require("./workspaces"));
let extensionRoot;
/**
 * Is AIX or not.
 */
exports.IS_AIX = process.platform === 'aix';
/**
 * Is Free BSD or not.
 */
exports.IS_FREE_BSD = process.platform === 'freebsd';
/**
 * Is Linux or not.
 */
exports.IS_LINUX = process.platform === 'linux';
/**
 * Is Sun OS or not.
 */
exports.IS_MAC = process.platform === 'darwin';
/**
 * Is Open BSD or not.
 */
exports.IS_OPEN_BSD = process.platform === 'openbsd';
/**
 * Is Sun OS or not.
 */
exports.IS_SUNOS = process.platform === 'sunos';
/**
 * Is Windows or not.
 */
exports.IS_WINDOWS = process.platform === 'win32';
/**
 * Global execution queue, which only allows one execution at the same time.
 */
exports.QUEUE = new PQueue({
    autoStart: true,
    concurrency: 1,
});
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
 * Alias for 'createDevToolsClient'.
 */
function createChromeClient(opts) {
    return createDevToolsClient.apply(null, arguments);
}
exports.createChromeClient = createChromeClient;
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
 * Creates a new instance of a client, which can connect to a DevTools compatible
 * browser like Google Chrome.
 *
 * @param {vscode_helpers_devtools.DevToolsClientOptions} [opts] Custom options.
 *
 * @return {vscode_helpers_devtools.DevToolsClient} The new client instance.
 */
function createDevToolsClient(opts) {
    return new vscode_helpers_devtools.DevToolsClient(opts);
}
exports.createDevToolsClient = createDevToolsClient;
/**
 * Creates a Git client.
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<vscode_helpers_scm_git.GitClient|false>} The promise with the client or (false) if no client found.
 */
function createGitClient(cwd, path) {
    return Promise.resolve(createGitClientSync(cwd, path));
}
exports.createGitClient = createGitClient;
/**
 * Creates a Git client (sync).
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {vscode_helpers_scm_git.GitClient|false} The client or (false) if no client found.
 */
function createGitClientSync(cwd, path) {
    const CLIENT = tryCreateGitClientSync(cwd, path);
    if (false === CLIENT) {
        throw new Error('No git client found!');
    }
    return CLIENT;
}
exports.createGitClientSync = createGitClientSync;
/**
 * Creates a new queue.
 *
 * @param {TOpts} [opts] The custom options.
 *
 * @return {PQueue<PQueue.DefaultAddOptions>} The new queue.
 */
function createQueue(opts) {
    const DEFAULT_OPTS = {
        autoStart: true,
        concurrency: 1,
    };
    return new PQueue(MergeDeep(DEFAULT_OPTS, opts));
}
exports.createQueue = createQueue;
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
 * Executes a file.
 *
 * @param {string} command The thing / command to execute.
 * @param {any[]} [args] One or more argument for the execution.
 * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
 *
 * @return {Promise<ExecFileResult>} The promise with the result.
 */
function execFile(command, args, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        command = toStringSafe(command);
        args = asArray(args, false).map(a => {
            return toStringSafe(a);
        });
        if (!opts) {
            opts = {};
        }
        if (_.isNil(opts.env)) {
            opts.env = process.env;
        }
        return new Promise((resolve, reject) => {
            const RESULT = {
                stdErr: undefined,
                stdOut: undefined,
                process: undefined,
            };
            let completedInvoked = false;
            const COMPLETED = (err) => {
                if (completedInvoked) {
                    return;
                }
                completedInvoked = true;
                if (err) {
                    reject(err);
                }
                else {
                    resolve(RESULT);
                }
            };
            try {
                const P = ChildProcess.execFile(command, args, opts, (err, stdout, stderr) => {
                    if (err) {
                        COMPLETED(err);
                    }
                    else {
                        try {
                            RESULT.process = P;
                            (() => __awaiter(this, void 0, void 0, function* () {
                                RESULT.stdErr = yield asBuffer(stderr, 'utf8');
                                RESULT.stdOut = yield asBuffer(stdout, 'utf8');
                            }))().then(() => {
                                COMPLETED(null);
                            }, (err) => {
                                COMPLETED(err);
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
    });
}
exports.execFile = execFile;
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
 * Gets the root directory of the extension.
 *
 * @return {string} The root directory of the extension.
 */
function getExtensionRoot() {
    return extensionRoot;
}
exports.getExtensionRoot = getExtensionRoot;
/**
 * Loads the package file (package.json) of the extension.
 *
 * @param {string} [packageJson] The custom path to the file.
 *
 * @return {Promise<PackageFile>} The promise with the meta data of the file.
 */
function getPackageFile(packageJson = '../package.json') {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.parse((yield FSExtra.readFile(getPackageFilePath(packageJson))).toString('utf8'));
    });
}
exports.getPackageFile = getPackageFile;
function getPackageFilePath(packageJson) {
    packageJson = toStringSafe(packageJson);
    if ('' === packageJson.trim()) {
        packageJson = '../package.json';
    }
    if (!Path.isAbsolute(packageJson)) {
        packageJson = Path.join(getExtensionRoot(), packageJson);
    }
    return Path.resolve(packageJson);
}
/**
 * Loads the package file (package.json) of the extension sync.
 *
 * @param {string} [packageJson] The custom path to the file.
 *
 * @return {PackageFile} The meta data of the file.
 */
function getPackageFileSync(packageJson = '../package.json') {
    return JSON.parse((FSExtra.readFileSync(getPackageFilePath(packageJson))).toString('utf8'));
}
exports.getPackageFileSync = getPackageFileSync;
/**
 * Alias for 'uuid'.
 */
function guid(ver, ...args) {
    return uuid.apply(this, arguments);
}
exports.guid = guid;
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
 * Opens and shows a new text document / editor.
 *
 * @param {OpenAndShowTextDocumentOptions} [filenameOrOpts] The custom options or the path to the file to open.
 *
 * @return {vscode.TextEditor} The promise with the new, opened text editor.
 */
function openAndShowTextDocument(filenameOrOpts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (_.isNil(filenameOrOpts)) {
            filenameOrOpts = {
                content: '',
                language: 'plaintext',
            };
        }
        return yield vscode.window.showTextDocument(yield vscode.workspace.openTextDocument(filenameOrOpts));
    });
}
exports.openAndShowTextDocument = openAndShowTextDocument;
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
 * Sets the root directory of the extension.
 *
 * @param {string} path The path of the extension.
 *
 * @return {string} The new value.
 */
function setExtensionRoot(path) {
    path = toStringSafe(path);
    if ('' === path.trim()) {
        path = undefined;
    }
    else {
        if (!Path.isAbsolute(path)) {
            path = Path.join(process.cwd(), path);
        }
        path = Path.resolve(path);
    }
    extensionRoot = path;
    return path;
}
exports.setExtensionRoot = setExtensionRoot;
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
 * Tries to create a Git client.
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<vscode_helpers_scm_git.GitClient|false>} The promise with the client or (false) if no client found.
 */
function tryCreateGitClient(cwd, path) {
    return Promise.resolve(tryCreateGitClientSync(cwd, path));
}
exports.tryCreateGitClient = tryCreateGitClient;
/**
 * Tries to create a Git client (sync).
 *
 * @param {string} [cwd] The custom working directory.
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {vscode_helpers_scm_git.GitClient|false} The client or (false) if no client found.
 */
function tryCreateGitClientSync(cwd, path) {
    const GIT_EXEC = vscode_helpers_scm_git.tryFindGitPathSync(path);
    if (false !== GIT_EXEC) {
        return new vscode_helpers_scm_git.GitClient(GIT_EXEC, cwd);
    }
    return false;
}
exports.tryCreateGitClientSync = tryCreateGitClientSync;
/**
 * Returns the current UTC time.
 *
 * @return {Moment.Moment} The current UTC time.
 */
function utcNow() {
    return Moment.utc();
}
exports.utcNow = utcNow;
/**
 * Generates a new unique ID.
 *
 * @param {string} [ver] The custom version to use. Default: '4'.
 * @param {any[]} [args] Additional arguments for the function.
 *
 * @return {string} The generated ID.
 */
function uuid(ver, ...args) {
    const UUID = require('uuid');
    ver = normalizeString(ver);
    let func = false;
    switch (ver) {
        case '':
        case '4':
        case 'v4':
            func = UUID.v4;
            break;
        case '1':
        case 'v1':
            func = UUID.v1;
            break;
        case '5':
        case 'v5':
            func = UUID.v5;
            break;
    }
    if (false === func) {
        throw new Error(`Version '${ver}' is not supported!`);
    }
    return func.apply(null, args);
}
exports.uuid = uuid;
//# sourceMappingURL=index.js.map