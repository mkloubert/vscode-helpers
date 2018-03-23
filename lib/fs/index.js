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
const FS = require("fs");
const FSExtra = require("fs-extra");
const Glob = require("glob");
const MergeDeep = require('merge-deep');
const Path = require("path");
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
//# sourceMappingURL=index.js.map