/// <reference types="node" />
import * as vscode from 'vscode';
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
export declare type WorkspaceWatcher<TWorkspace extends Workspace = Workspace> = (event: WorkspaceWatcherEvent, folder: vscode.WorkspaceFolder, workspace?: TWorkspace) => WorkspaceWatcherResult<TWorkspace> | PromiseLike<WorkspaceWatcherResult>;
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
export declare type WorkspaceWatcherResult<TWorkspace extends Workspace = Workspace> = TWorkspace | void | null | undefined;
/**
 * List of workspace watcher events.
 */
export declare enum WorkspaceWatcherEvent {
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
export declare abstract class WorkspaceBase extends vscode_disposable.DisposableBase implements Workspace {
    readonly folder: vscode.WorkspaceFolder;
    /**
     * Initializes a new instance of that class.
     *
     * @param {vscode.WorkspaceFolder} folder The underlying folder.
     */
    constructor(folder: vscode.WorkspaceFolder);
    /** @inheritdoc */
    readonly abstract configSource: WorkspaceConfigSource;
    /** @inheritdoc */
    onDidChangeConfiguration(e: vscode.ConfigurationChangeEvent): Promise<void>;
    /** @inheritdoc */
    readonly rootPath: string;
}
/**
 * Registers a workspace watcher.
 *
 * @param {vscode.ExtensionContext} extension The underlying extension (context).
 * @param {WorkspaceWatcher<TWorkspace>} watcher The watcher.
 *
 * @return {WorkspaceWatcherContext<TWorkspace>} The watcher context.
 */
export declare function registerWorkspaceWatcher<TWorkspace extends Workspace = Workspace>(extension: vscode.ExtensionContext, watcher: WorkspaceWatcher<TWorkspace>): WorkspaceWatcherContext<TWorkspace>;
