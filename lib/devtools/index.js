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
const vscode_helpers = require("../index");
const vscode_helpers_disposable = require("../disposable/index");
const vscode_helpers_events = require("../events/index");
const vscode_helpers_http = require("../http/index");
const WebSocket = require("ws");
/**
 * A DevTools client.
 */
class DevToolsClient extends vscode_helpers_disposable.DisposableBase {
    /**
     * Initializes a new instance of that class.
     *
     * @param {DevToolsClientOptions} [opts] Custom options.
     */
    constructor(opts) {
        super();
        this.options = opts || {};
    }
    getBrowserItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const RESP = yield vscode_helpers_http.GET(`http://${this.host}:${this.port}/json`);
            if (200 !== RESP.code) {
                throw new Error(`Unexpected response ${RESP.code}: '${RESP.status}'`);
            }
            return vscode_helpers.asArray(JSON.parse((yield RESP.readBody()).toString('utf8'))).filter(i => {
                return !vscode_helpers.isEmptyString(i['webSocketDebuggerUrl']);
            });
        });
    }
    /**
     * Returns a list of all IFrames.
     *
     * @return {Promise<BrowserFrame[]>} The promise with the frames.
     */
    getFrames() {
        return __awaiter(this, void 0, void 0, function* () {
            const IFRAMES = [];
            const IFRAME_ITEMS = (yield this.getBrowserItems()).filter(i => {
                return 'iframe' === vscode_helpers.normalizeString(i['type']);
            });
            for (const FI of IFRAME_ITEMS) {
                const NEW_FRAME = new BrowserFrameImpl(this);
                NEW_FRAME.id = vscode_helpers.toStringSafe(FI['id']);
                NEW_FRAME.parentId = vscode_helpers.toStringSafe(FI['parentId']);
                NEW_FRAME.favIcon = vscode_helpers.toStringSafe(FI['faviconUrl']);
                NEW_FRAME.title = vscode_helpers.toStringSafe(FI['title']);
                NEW_FRAME.description = vscode_helpers.toStringSafe(FI['description']);
                NEW_FRAME.socketUri = vscode_helpers.toStringSafe(FI['webSocketDebuggerUrl']);
                IFRAMES.push(NEW_FRAME);
            }
            return IFRAMES;
        });
    }
    /**
     * Returns a list of all pages.
     *
     * @return {Promise<BrowserPage[]>} The promise with the pages.
     */
    getPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const PAGES = [];
            const PAGE_ITEMS = (yield this.getBrowserItems()).filter(i => {
                return 'page' === vscode_helpers.normalizeString(i['type']);
            });
            for (const PI of PAGE_ITEMS) {
                const NEW_PAGE = new BrowserPageImpl(this);
                NEW_PAGE.id = vscode_helpers.toStringSafe(PI['id']);
                NEW_PAGE.favIcon = vscode_helpers.toStringSafe(PI['faviconUrl']);
                NEW_PAGE.title = vscode_helpers.toStringSafe(PI['title']);
                NEW_PAGE.description = vscode_helpers.toStringSafe(PI['description']);
                NEW_PAGE.socketUri = vscode_helpers.toStringSafe(PI['webSocketDebuggerUrl']);
                PAGES.push(NEW_PAGE);
            }
            return PAGES;
        });
    }
    /**
     * Gets the host address.
     */
    get host() {
        let hostAddr = vscode_helpers.toStringSafe(this.options.host);
        if ('' === hostAddr) {
            hostAddr = '127.0.0.1';
        }
        return hostAddr;
    }
    /**
     * Gets the TCP port.
     */
    get port() {
        let tcpPort = parseInt(vscode_helpers.toStringSafe(this.options.port).trim());
        if (isNaN(tcpPort)) {
            tcpPort = 9222;
        }
        return tcpPort;
    }
}
exports.DevToolsClient = DevToolsClient;
class BrowserItemBase extends vscode_helpers_disposable.DisposableBase {
    constructor(client) {
        super();
        this.client = client;
        this._nextId = 0;
    }
    close() {
        return new Promise((resolve, reject) => {
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
            }
            catch (e) {
                COMPLETED(e);
            }
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);
            if (this.isInFinalizeState) {
                COMPLETED(new Error('Object is or is going to be disposed'));
                return;
            }
            if (!_.isNil(this._socket)) {
                COMPLETED(null, false);
                return;
            }
            try {
                const NEW_SOCKET = new WebSocket(this.socketUri);
                NEW_SOCKET.once('error', (err) => {
                    if (err) {
                        COMPLETED(err);
                    }
                });
                NEW_SOCKET.once('close', () => {
                    this._socket = null;
                    this.emit('close', NEW_SOCKET);
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
                            let msg;
                            if (!_.isNil(data)) {
                                msg = JSON.parse(vscode_helpers.toStringSafe(data));
                            }
                            if (_.isObject(msg)) {
                                const MSG_ID = parseInt(vscode_helpers.toStringSafe(msg.id).trim());
                                if (!isNaN(MSG_ID)) {
                                    const DELETE_CALLBACK = (err) => {
                                        delete ALL_CALLBACKS[MSG_ID];
                                    };
                                    try {
                                        const CALLBACK = ALL_CALLBACKS[MSG_ID];
                                        if (!_.isNil(CALLBACK)) {
                                            Promise.resolve(CALLBACK(msg)).then(() => {
                                                DELETE_CALLBACK();
                                            }, (err) => {
                                                DELETE_CALLBACK(err);
                                            });
                                        }
                                    }
                                    finally {
                                        DELETE_CALLBACK();
                                    }
                                }
                            }
                        }
                        catch (_a) { }
                    }
                    this.emit('message', NEW_SOCKET, data);
                });
            }
            catch (e) {
                COMPLETED(e);
            }
        });
    }
    get isConnected() {
        return !_.isNil(this._socket);
    }
    onDispose() {
        const CUR_SOCKET = this._socket;
        if (!_.isNil(CUR_SOCKET)) {
            CUR_SOCKET.close();
            vscode_helpers_events.tryRemoveAllListeners(CUR_SOCKET);
            this._socket = null;
        }
        this._sendCallbacks = null;
    }
    send(method, params, callback) {
        method = vscode_helpers.toStringSafe(method).trim();
        return new Promise((resolve, reject) => {
            const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);
            let id = 0;
            try {
                id = ++this._nextId;
                if (!_.isNil(callback)) {
                    this._sendCallbacks[id] = callback;
                }
                this._socket.send(JSON.stringify({
                    id: id,
                    method: method,
                    params: params,
                }), (err) => {
                    COMPLETED(err);
                });
            }
            catch (e) {
                delete this._sendCallbacks[id];
                COMPLETED(e);
            }
        });
    }
}
class BrowserPageImpl extends BrowserItemBase {
}
class BrowserFrameImpl extends BrowserPageImpl {
}
//# sourceMappingURL=index.js.map