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
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';
import * as vscode_helpers_disposable from '../disposable/index';
import * as vscode_helpers_events from '../events/index';
import * as vscode_helpers_http from '../http/index';
import * as WebSocket from 'ws';

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

export type SendToBrowserItemCallback = (message: any) => any;

/**
 * A DevTools client.
 */
export class DevToolsClient extends vscode_helpers_disposable.DisposableBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {DevToolsClientOptions} [opts] Custom options.
     */
    public constructor(opts?: DevToolsClientOptions) {
        super();

        this.options = opts || <any>{};
    }

    private async getBrowserItems(): Promise<any[]> {
        const RESP = await vscode_helpers_http.GET(`http://${ this.host }:${ this.port }/json`);

        if (200 !== RESP.code) {
            throw new Error(`Unexpected response ${ RESP.code }: '${ RESP.status }'`);
        }

        return vscode_helpers.asArray(
            JSON.parse(
                (await RESP.readBody()).toString('utf8')
            )
        ).filter(i => {
            return !vscode_helpers.isEmptyString( i['webSocketDebuggerUrl'] );
        });
    }

    /**
     * Returns a list of all IFrames.
     *
     * @return {Promise<BrowserFrame[]>} The promise with the frames.
     */
    public async getFrames() {
        const IFRAMES: BrowserFrame[] = [];

        const IFRAME_ITEMS = (
            await this.getBrowserItems()
        ).filter(i => {
            return 'iframe' === vscode_helpers.normalizeString(i['type']);
        });

        for (const FI of IFRAME_ITEMS) {
            const NEW_FRAME = new BrowserFrameImpl(this);
            NEW_FRAME.id = vscode_helpers.toStringSafe( FI['id'] );
            NEW_FRAME.parentId = vscode_helpers.toStringSafe( FI['parentId'] );
            NEW_FRAME.favIcon = vscode_helpers.toStringSafe( FI['faviconUrl'] );
            NEW_FRAME.title = vscode_helpers.toStringSafe( FI['title'] );
            NEW_FRAME.description = vscode_helpers.toStringSafe( FI['description'] );
            NEW_FRAME.socketUri = vscode_helpers.toStringSafe( FI['webSocketDebuggerUrl'] );

            IFRAMES.push( NEW_FRAME );
        }

        return IFRAMES;
    }

    /**
     * Returns a list of all pages.
     *
     * @return {Promise<BrowserPage[]>} The promise with the pages.
     */
    public async getPages() {
        const PAGES: BrowserPage[] = [];

        const PAGE_ITEMS = (
            await this.getBrowserItems()
        ).filter(i => {
            return 'page' === vscode_helpers.normalizeString(i['type']);
        });

        for (const PI of PAGE_ITEMS) {
            const NEW_PAGE = new BrowserPageImpl(this);
            NEW_PAGE.id = vscode_helpers.toStringSafe( PI['id'] );
            NEW_PAGE.favIcon = vscode_helpers.toStringSafe( PI['faviconUrl'] );
            NEW_PAGE.title = vscode_helpers.toStringSafe( PI['title'] );
            NEW_PAGE.description = vscode_helpers.toStringSafe( PI['description'] );
            NEW_PAGE.socketUri = vscode_helpers.toStringSafe( PI['webSocketDebuggerUrl'] );

            PAGES.push( NEW_PAGE );
        }

        return PAGES;
    }

    /**
     * Gets the host address.
     */
    public get host() {
        let hostAddr = vscode_helpers.toStringSafe(this.options.host);
        if ('' === hostAddr) {
            hostAddr = '127.0.0.1';
        }

        return hostAddr;
    }

    /**
     * Gets the options for the client.
     */
    public readonly options: DevToolsClientOptions;

    /**
     * Gets the TCP port.
     */
    public get port() {
        let tcpPort = parseInt(
            vscode_helpers.toStringSafe(this.options.port).trim()
        );
        if (isNaN(tcpPort)) {
            tcpPort = 9222;
        }

        return tcpPort;
    }
}

abstract class BrowserItemBase extends vscode_helpers_disposable.DisposableBase implements BrowserItem {
    private _nextId = 0;
    private _sendCallbacks: { [id: number]: SendToBrowserItemCallback };
    private _socket: WebSocket;

    public constructor(public readonly client: DevToolsClient) {
        super();
    }

    public close() {
        return new Promise<boolean>((resolve, reject) => {
            const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

            const CUR_SOCKET = this._socket;
            if (_.isNil(CUR_SOCKET)) {
                COMPLETED(null, false);
                return;
            }

            try {
                CUR_SOCKET.close();
                vscode_helpers_events.tryRemoveAllListeners(CUR_SOCKET);

                this._socket = null;

                COMPLETED(null);
            } catch (e) {
                COMPLETED(e);
            }
        });
    }

    public connect() {
        return new Promise<boolean>((resolve, reject) => {
            const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

            if (this.isInFinalizeState) {
                COMPLETED(
                    new Error('Object is or is going to be disposed')
                );
                return;
            }

            if (!_.isNil(this._socket)) {
                COMPLETED(null, false);
                return;
            }

            try {
                const NEW_SOCKET = new WebSocket( this.socketUri );

                NEW_SOCKET.once('error', (err) => {
                    if (err) {
                        COMPLETED(err);
                    }
                });

                NEW_SOCKET.once('close', () => {
                    this._socket = null;

                    this.emit('close',
                              NEW_SOCKET);
                });

                NEW_SOCKET.once('open', () => {
                    this._sendCallbacks = {};
                    this._socket = NEW_SOCKET;

                    COMPLETED(null, true);
                });

                NEW_SOCKET.on('message', (data) => {
                    const ALL_CALLBACKS = this._sendCallbacks;
                    if (!_.isNil(ALL_CALLBACKS)) {
                        try {
                            let msg: any;
                            if (!_.isNil(data)) {
                                msg = JSON.parse(
                                    vscode_helpers.toStringSafe(data)
                                );
                            }

                            if (_.isObject(msg)) {
                                const MSG_ID = parseInt(
                                    vscode_helpers.toStringSafe(msg.id).trim()
                                );
                                if (!isNaN(MSG_ID)) {
                                    const DELETE_CALLBACK = (err?: any) => {
                                        delete ALL_CALLBACKS[MSG_ID];
                                    };

                                    try {
                                        const CALLBACK = ALL_CALLBACKS[MSG_ID];
                                        if (!_.isNil(CALLBACK)) {
                                            Promise.resolve(
                                                CALLBACK(msg)
                                            ).then(() => {
                                                DELETE_CALLBACK();
                                            }, (err) => {
                                                DELETE_CALLBACK(err);
                                            });
                                        }
                                    } finally {
                                        DELETE_CALLBACK();
                                    }
                                }
                            }
                        } catch { }
                    }

                    this.emit('message',
                              NEW_SOCKET, data);
                });
            } catch (e) {
                COMPLETED(e);
            }
        });
    }

    public description: string;

    public id: string;

    public get isConnected() {
        return !_.isNil(this._socket);
    }

    public onDispose() {
        const CUR_SOCKET = this._socket;
        if (!_.isNil(CUR_SOCKET)) {
            CUR_SOCKET.close();
            vscode_helpers_events.tryRemoveAllListeners(CUR_SOCKET);

            this._socket = null;
        }

        this._sendCallbacks = null;
    }

    public send(method: string, params?: any, callback?: SendToBrowserItemCallback) {
        method = vscode_helpers.toStringSafe(method).trim();

        return new Promise<void>((resolve, reject) => {
            const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

            let id = 0;
            try {
                id = ++this._nextId;

                if (!_.isNil(callback)) {
                    this._sendCallbacks[id] = callback;
                }

                this._socket.send(
                    JSON.stringify({
                        id: id,
                        method: method,
                        params: params,
                    }),
                    (err) => {
                        COMPLETED(err);
                    }
                );
            } catch (e) {
                delete this._sendCallbacks[id];

                COMPLETED(e);
            }
        });
    }

    public socketUri: string;
}

class BrowserPageImpl extends BrowserItemBase implements BrowserPage {
    public favIcon: string;

    public title: string;
}

class BrowserFrameImpl extends BrowserPageImpl implements BrowserFrame {
    public parentId: string;
}
