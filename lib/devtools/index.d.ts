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
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';
import * as vscode_helpers_disposable from '../disposable/index';
/**
 * A browser item.
 */
export interface BrowserItem extends NodeJS.EventEmitter, vscode.Disposable {
    /**
     * The description.
     */
    readonly description?: string;
    /**
     * Closes the connection to the item.
     *
     * @return {PromiseLike<boolean>} The promise that indicates if operation was successful or not.
     */
    readonly close: () => PromiseLike<boolean>;
    /**
     * Options a connection to the item.
     *
     * @return {PromiseLike<boolean>} The promise that indicates if operation was successful or not.
     */
    readonly connect: () => PromiseLike<boolean>;
    /**
     * The ID of the item.
     */
    readonly id: string;
    /**
     * Indicates if a connection to the item has been established or not.
     */
    readonly isConnected: boolean;
    /**
     * Invokes a method for the item.
     *
     * @param {string} method The method to invoke.
     * @param {any} [params] Parameters for the method.
     * @param {SendToBrowserItemCallback} [callback] The optional callback.
     */
    readonly send: (method: string, params?: any, callback?: SendToBrowserItemCallback) => PromiseLike<void>;
    /**
     * Gets the underyling (web) socket URI.
     */
    readonly socketUri: string;
}
/**
 * A browser IFrame.
 */
export interface BrowserFrame extends BrowserPage {
    /**
     * Gets the ID of the parent.
     */
    readonly parentId: string;
}
/**
 * A browser page.
 */
export interface BrowserPage extends BrowserItem {
    /**
     * Gets the URI of the FavIcon.
     */
    readonly favIcon: string;
    /**
     * The title of the page.
     */
    readonly title: string;
}
/**
 * Options for a DevTools client.
 */
export interface DevToolsClientOptions {
    /**
     * The host address.
     */
    readonly host?: string;
    /**
     * The TCP host.
     */
    readonly port?: number;
}
export declare type SendToBrowserItemCallback = (message: any) => any;
/**
 * A DevTools client.
 */
export declare class DevToolsClient extends vscode_helpers_disposable.DisposableBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {DevToolsClientOptions} [opts] Custom options.
     */
    constructor(opts?: DevToolsClientOptions);
    private getBrowserItems;
    /**
     * Returns a list of all IFrames.
     *
     * @return {Promise<BrowserFrame[]>} The promise with the frames.
     */
    getFrames(): Promise<vscode_helpers.BrowserFrame[]>;
    /**
     * Returns a list of all pages.
     *
     * @return {Promise<BrowserPage[]>} The promise with the pages.
     */
    getPages(): Promise<vscode_helpers.BrowserPage[]>;
    /**
     * Gets the host address.
     */
    readonly host: string;
    /**
     * Gets the options for the client.
     */
    readonly options: DevToolsClientOptions;
    /**
     * Gets the TCP port.
     */
    readonly port: number;
}
