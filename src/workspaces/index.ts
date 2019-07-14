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
import * as Path from 'path';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';
import * as vscode_disposable from '../disposable';

/**
 * A workspace.
 */
export interface Workspace extends vscode.Disposable, NodeJS.EventEmitter {
    /**
     * Gets the config source of that workspace.
     */
    readonly configSource: WorkspaceConfigSource;
    /**
     * The underlying folder.
     */
    readonly folder: vscode.WorkspaceFolder;
    /**
     * Is invoked when the configuration for that workspace changed.
     */
    readonly onDidChangeConfiguration: (e: vscode.ConfigurationChangeEvent) => void | PromiseLike<void>;
    /**
     * Gets the root path of that workspace.
     */
    readonly rootPath: string;
}

/**
 * Stores data of configuration source.
 */
export interface WorkspaceConfigSource {
    /**
     * Gets the resource URI.
     */
    readonly resource?: vscode.Uri;
    /**
     * Gets the name of the section.
     */
    readonly section: string;
}

/**
 * A workspace context.
 */
export interface WorkspaceContext {
    /**
     * The underlying extension context.
     */
    readonly extension: vscode.ExtensionContext;
    /**
     * The list of all available workspaces.
     */
    readonly workspaces: WorkspaceBase[];
}

/**
 * A workspace watcher.
 *
 * @param {WorkspaceEvent} event The event.
 * @param {vscode.WorkspaceFolder} folder The underlying folder.
 * @param {TWorkspace} [workspace] The workspace to remove.
 */
export type WorkspaceWatcher<TWorkspace extends Workspace = Workspace> = (
    event: WorkspaceWatcherEvent,
    folder: vscode.WorkspaceFolder,
    workspace?: TWorkspace,
) => WorkspaceWatcherResult<TWorkspace> | PromiseLike<WorkspaceWatcherResult>;

/**
 * A workspace watcher 'complete action'.
 *
 * @param {any} err The error (if occurred).
 * @param {WorkspaceEvent} event The event.
 * @param {vscode.WorkspaceFolder} folder The underlying folder.
 * @param {TWorkspace} [workspace] The workspace to remove.
 */
export type WorkspaceWatcherCompleteAction<TWorkspace> = (
    err: any,
    event: WorkspaceWatcherEvent,
    folder: vscode.WorkspaceFolder,
    workspace?: TWorkspace
) => void | PromiseLike<void>;

/**
 * A workspace watcher context.
 */
export interface WorkspaceWatcherContext<TWorkspace extends Workspace = Workspace> extends vscode.Disposable {
    /**
     * The underlying extension (context).
     */
    readonly extension: vscode.ExtensionContext;
    /**
     * Reloads all workspaces.
     */
    readonly reload: () => PromiseLike<void>;
    /**
     * The list of all available workspaces.
     */
    readonly workspaces: TWorkspace[];
}

/**
 * Possible results of a workspace watcher.
 */
export type WorkspaceWatcherResult<TWorkspace extends Workspace = Workspace> = TWorkspace | void | null | undefined;

/**
 * List of workspace watcher events.
 */
export enum WorkspaceWatcherEvent {
    /**
     * A workspace is going to be added.
     */
    Added = 1,
    /**
     * A workspace is going to be removed.
     */
    Removed = 2,
}

/**
 * A basic workspace.
 */
export abstract class WorkspaceBase extends vscode_disposable.DisposableBase implements Workspace {
    /**
     * Initializes a new instance of that class.
     *
     * @param {vscode.WorkspaceFolder} folder The underlying folder.
     */
    public constructor(public readonly folder: vscode.WorkspaceFolder) {
        super();
    }

    /** @inheritdoc */
    public abstract get configSource(): WorkspaceConfigSource;

    /** @inheritdoc */
    public async onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent) {
    }

    /** @inheritdoc */
    public get rootPath(): string {
        return Path.resolve(
            this.folder.uri.fsPath
        );
    }
}

/**
 * Registers a workspace watcher.
 *
 * @param {vscode.ExtensionContext} extension The underlying extension (context).
 * @param {WorkspaceWatcher<TWorkspace>} watcher The watcher.
 * @param {WorkspaceWatcherCompleteAction<TWorkspace>} [complete] Optional 'complete action'.
 *
 * @return {WorkspaceWatcherContext<TWorkspace>} The watcher context.
 */
export function registerWorkspaceWatcher<TWorkspace extends Workspace = Workspace>(
    extension: vscode.ExtensionContext,
    watcher: WorkspaceWatcher<TWorkspace>,
    complete?: WorkspaceWatcherCompleteAction<TWorkspace>,
): WorkspaceWatcherContext<TWorkspace> {
    let workspaces: TWorkspace[] = [];

    const DISPOSE_WORKSPACES = () => {
        while (workspaces.length > 0) {
            vscode_disposable.tryDispose(
                workspaces.pop()
            );
        }
    };

    const CONFIG_CHANGED_LISTENER = async (e: vscode.ConfigurationChangeEvent) => {
        for (const WS of workspaces) {
            try {
                if (e.affectsConfiguration(WS.configSource.section, WS.configSource.resource)) {
                    await Promise.resolve(
                        WS.onDidChangeConfiguration(e)
                    );
                }
            } catch { }
        }
    };

    const WORKSPACE_FOLDERS_CHANGED_LISTENER = async (added: ReadonlyArray<vscode.WorkspaceFolder>, removed?: ReadonlyArray<vscode.WorkspaceFolder>) => {
        if (removed) {
            for (const WF of removed) {
                try {
                    const MATCHING_WORKSPACES = workspaces.filter(ws => {
                        return ws.folder.uri.fsPath === WF.uri.fsPath;
                    });

                    for (const MWS of MATCHING_WORKSPACES) {
                        let watcherErr: any;
                        try {
                            workspaces = workspaces.filter(ws => {
                                return ws !== MWS;
                            });

                            vscode_disposable.tryDispose( MWS );

                            await Promise.resolve(
                                watcher(
                                    WorkspaceWatcherEvent.Removed,
                                    MWS.folder,
                                    MWS,
                                )
                            );
                        } catch (e) {
                            watcherErr = e;
                        } finally {
                            if (complete) {
                                await Promise.resolve(
                                    complete(
                                        watcherErr,
                                        WorkspaceWatcherEvent.Removed,
                                        MWS.folder,
                                        MWS,
                                    )
                                );
                            }
                        }
                    }
                } catch { }
            }
        }

        if (added) {
            for (const WF of added) {
                let watcherErr: any;
                let newWorkspace: any;
                try {
                    newWorkspace = await Promise.resolve(
                        watcher(
                            WorkspaceWatcherEvent.Added,
                            WF,
                        )
                    );

                    if (!_.isNil(newWorkspace)) {
                        workspaces.push( <TWorkspace>newWorkspace );
                    }
                } catch (e) {
                    watcherErr = e;
                } finally {
                    if (complete) {
                        await Promise.resolve(
                            complete(
                                watcherErr,
                                WorkspaceWatcherEvent.Added,
                                WF,
                                newWorkspace,
                            )
                        );
                    }
                }
            }
        }
    };

    let onDidChangeWorkspaceFolders: vscode.Disposable;
    let onDidChangeConfiguration: vscode.Disposable;

    const CTX: WorkspaceWatcherContext<TWorkspace> = {
        extension: extension,
        dispose: () => {
            vscode_disposable.tryDispose( onDidChangeConfiguration );
            vscode_disposable.tryDispose( onDidChangeWorkspaceFolders );

            DISPOSE_WORKSPACES();
        },
        reload: async () => {
            DISPOSE_WORKSPACES();

            await WORKSPACE_FOLDERS_CHANGED_LISTENER(
                vscode_helpers.asArray( vscode.workspace.workspaceFolders ),
            );
        },
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
