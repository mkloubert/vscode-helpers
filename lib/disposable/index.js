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
Object.defineProperty(exports, "__esModule", { value: true });
const Events = require("events");
const vscode_helpers = require("../index");
/**
 * Name of the event, when an object has been disposed.
 */
exports.EVENT_DISPOSED = 'disposed';
/**
 * Name of an event, when an object is going to be disposed.
 */
exports.EVENT_DISPOSING = 'disposing';
/**
 * A disposable object.
 */
class DisposableBase extends Events.EventEmitter {
    constructor() {
        super(...arguments);
        /**
         * Stores disposable sub objects.
         */
        this._DISPOSABLES = [];
        /**
         * Stores intervals.
         */
        this._INTERVALS = [];
        this._isDisposed = false;
        this._isDisposing = false;
        /**
         * Stores timeouts.
         */
        this._TIMEOUTS = [];
    }
    /**
     * Cleansup all timeouts.
     */
    cleanupIntervals() {
        while (this._TIMEOUTS.length > 0) {
            vscode_helpers.tryClearInterval(this._TIMEOUTS.shift());
        }
    }
    /**
     * Cleansup all timeouts.
     */
    cleanupTimeouts() {
        while (this._TIMEOUTS.length > 0) {
            vscode_helpers.tryClearTimeout(this._TIMEOUTS.shift());
        }
    }
    /** @inheritdoc */
    dispose() {
        if (this.isInFinalizeState) {
            return;
        }
        try {
            this._isDisposing = true;
            this.emit(exports.EVENT_DISPOSING);
            this.cleanupIntervals();
            this.cleanupTimeouts();
            this.removeAllListeners();
            while (this._DISPOSABLES.length > 0) {
                tryDispose(this._DISPOSABLES.shift());
            }
            this.onDispose();
            this._isDisposed = true;
            this.emit(exports.EVENT_DISPOSED);
        }
        finally {
            this._isDisposing = false;
        }
    }
    /**
     * Gets if object has been disposed or not.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Gets if the 'dispose()' method is currently executed or not.
     */
    get isDisposing() {
        return this._isDisposing;
    }
    /**
     * Gets if the object is disposed or currently disposing.
     */
    get isInFinalizeState() {
        return this.isDisposed || this.isDisposing;
    }
    /**
     * Additional logic for the 'dispose()' method.
     */
    onDispose() {
    }
}
exports.DisposableBase = DisposableBase;
/**
 * Tries to dispose an object.
 *
 * @param {object} obj The object to dispose.
 *
 * @return {boolean} Operation was successful or not.
 */
function tryDispose(obj) {
    try {
        if (obj && obj.dispose) {
            obj.dispose();
        }
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.tryDispose = tryDispose;
//# sourceMappingURL=index.js.map