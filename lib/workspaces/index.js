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
const Path = require("path");
const vscode = require("vscode");
const vscode_helpers = require("../index");
const vscode_disposable = require("../disposable");
/**
 * List of workspace watcher events.
 */
var WorkspaceWatcherEvent;
(function (WorkspaceWatcherEvent) {
    /**
     * A workspace is going to be added.
     */
    WorkspaceWatcherEvent[WorkspaceWatcherEvent["Added"] = 1] = "Added";
    /**
     * A workspace is going to be removed.
     */
    WorkspaceWatcherEvent[WorkspaceWatcherEvent["Removed"] = 2] = "Removed";
})(WorkspaceWatcherEvent = exports.WorkspaceWatcherEvent || (exports.WorkspaceWatcherEvent = {}));
/**
 * A basic workspace.
 */
class WorkspaceBase extends vscode_disposable.DisposableBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {vscode.WorkspaceFolder} folder The underlying folder.
     */
    constructor(folder) {
        super();
        this.folder = folder;
    }
    /** @inheritdoc */
    onDidChangeConfiguration(e) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /** @inheritdoc */
    get rootPath() {
        return Path.resolve(this.folder.uri.fsPath);
    }
}
exports.WorkspaceBase = WorkspaceBase;
/**
 * Registers a workspace watcher.
 *
 * @param {vscode.ExtensionContext} extension The underlying extension (context).
 * @param {WorkspaceWatcher<TWorkspace>} watcher The watcher.
 * @param {WorkspaceWatcherCompleteAction<TWorkspace>} [complete] Optional 'complete action'.
 *
 * @return {WorkspaceWatcherContext<TWorkspace>} The watcher context.
 */
function registerWorkspaceWatcher(extension, watcher, complete) {
    let workspaces = [];
    const DISPOSE_WORKSPACES = () => {
        while (workspaces.length > 0) {
            vscode_disposable.tryDispose(workspaces.pop());
        }
    };
    const CONFIG_CHANGED_LISTENER = (e) => __awaiter(this, void 0, void 0, function* () {
        for (const WS of workspaces) {
            try {
                if (e.affectsConfiguration(WS.configSource.section, WS.configSource.resource)) {
                    yield Promise.resolve(WS.onDidChangeConfiguration(e));
                }
            }
            catch (_a) { }
        }
    });
    const WORKSPACE_FOLDERS_CHANGED_LISTENER = (added, removed) => __awaiter(this, void 0, void 0, function* () {
        if (removed) {
            for (const WF of removed) {
                try {
                    const MATCHING_WORKSPACES = workspaces.filter(ws => {
                        return ws.folder.uri.fsPath === WF.uri.fsPath;
                    });
                    for (const MWS of MATCHING_WORKSPACES) {
                        let watcherErr;
                        try {
                            workspaces = workspaces.filter(ws => {
                                return ws !== MWS;
                            });
                            vscode_disposable.tryDispose(MWS);
                            yield Promise.resolve(watcher(WorkspaceWatcherEvent.Removed, MWS.folder, MWS));
                        }
                        catch (e) {
                            watcherErr = e;
                        }
                        finally {
                            if (complete) {
                                yield Promise.resolve(complete(watcherErr, WorkspaceWatcherEvent.Removed, MWS.folder, MWS));
                            }
                        }
                    }
                }
                catch (_b) { }
            }
        }
        if (added) {
            for (const WF of added) {
                let watcherErr;
                let newWorkspace;
                try {
                    newWorkspace = yield Promise.resolve(watcher(WorkspaceWatcherEvent.Added, WF));
                    if (!_.isNil(newWorkspace)) {
                        workspaces.push(newWorkspace);
                    }
                }
                catch (e) {
                    watcherErr = e;
                }
                finally {
                    if (complete) {
                        yield Promise.resolve(complete(watcherErr, WorkspaceWatcherEvent.Added, WF, newWorkspace));
                    }
                }
            }
        }
    });
    let onDidChangeWorkspaceFolders;
    let onDidChangeConfiguration;
    const CTX = {
        extension: extension,
        dispose: () => {
            vscode_disposable.tryDispose(onDidChangeConfiguration);
            vscode_disposable.tryDispose(onDidChangeWorkspaceFolders);
            DISPOSE_WORKSPACES();
        },
        reload: () => __awaiter(this, void 0, void 0, function* () {
            DISPOSE_WORKSPACES();
            yield WORKSPACE_FOLDERS_CHANGED_LISTENER(vscode_helpers.asArray(vscode.workspace.workspaceFolders));
        }),
        workspaces: undefined,
    };
    // CTX.workspaces
    Object.defineProperty(CTX, 'workspaces', {
        enumerable: true,
        get: () => workspaces.map(ws => ws),
    });
    onDidChangeWorkspaceFolders = vscode.workspace.onDidChangeWorkspaceFolders((e) => {
        WORKSPACE_FOLDERS_CHANGED_LISTENER(e.added, e.removed).then(() => {
        }, (err) => {
        });
    });
    onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((e) => {
        CONFIG_CHANGED_LISTENER(e).then(() => {
        }, (err) => {
        });
    });
    return CTX;
}
exports.registerWorkspaceWatcher = registerWorkspaceWatcher;
//# sourceMappingURL=index.js.map