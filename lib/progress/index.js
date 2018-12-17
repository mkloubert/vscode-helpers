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
const _ = require("lodash");
const vscode = require("vscode");
const vscode_helpers = require("../index");
/**
 * Runs a task with progress information.
 *
 * @param {ProgressTask<TResult>} task The task to execute.
 * @param {ProgressOptions} [options] Additional options.
 *
 * @return {Promise<TResult>} The promise with the result.
 */
function withProgress(task, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options) {
            options = {};
        }
        const OPTS = {
            cancellable: vscode_helpers.toBooleanSafe(options.cancellable),
            location: _.isNil(options.location) ? vscode.ProgressLocation.Notification : options.location,
            title: vscode_helpers.toStringSafe(options.title),
        };
        return vscode.window.withProgress(OPTS, (p, ct) => {
            let handledItems = [];
            try {
                let msg;
                let increment;
                const CTX = {
                    baseContext: p,
                    cancellationToken: ct,
                    increment: undefined,
                    incrementIfNeeded: function (item, msg) {
                        if (handledItems.indexOf(item) < 0) {
                            handledItems.push(item);
                            this.message = msg;
                            return true;
                        }
                        return false;
                    },
                    message: undefined,
                };
                const UPDATE_PROGRESS = () => {
                    p.report({
                        increment: increment,
                        message: msg,
                    });
                };
                // CTX.increment
                Object.defineProperty(CTX, 'increment', {
                    enumerable: true,
                    get: () => {
                        return increment;
                    },
                    set: (newValue) => {
                        if (!_.isNil(newValue)) {
                            newValue = parseFloat(vscode_helpers.toStringSafe(newValue).trim());
                        }
                        increment = newValue;
                    }
                });
                // CTX.message
                Object.defineProperty(CTX, 'message', {
                    enumerable: true,
                    get: () => {
                        return msg;
                    },
                    set: (newValue) => {
                        if (_.isNil(newValue)) {
                            newValue = undefined;
                        }
                        else {
                            newValue = vscode_helpers.toStringSafe(newValue);
                        }
                        msg = newValue;
                        UPDATE_PROGRESS();
                    }
                });
                return Promise.resolve(task(CTX));
            }
            finally {
                handledItems = null;
            }
        });
    });
}
exports.withProgress = withProgress;
//# sourceMappingURL=index.js.map