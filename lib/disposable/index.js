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
 * Clones an object and makes it non disposable.
 *
 * @param {TObj} obj The object to clone.
 * @param {boolean} [throwOnDispose] Throw error when coll 'dispose()' method or not.
 *
 * @return {TObj} The cloned object.
 */
function makeNonDisposable(obj, throwOnDispose = true) {
    throwOnDispose = vscode_helpers.toBooleanSafe(throwOnDispose, true);
    const CLONED_OBJ = vscode_helpers.cloneObjectFlat(obj);
    if (CLONED_OBJ) {
        if (_.isFunction(CLONED_OBJ.dispose)) {
            CLONED_OBJ.dispose = () => {
                if (throwOnDispose) {
                    throw new Error('Disposing object is not allowed!');
                }
            };
        }
    }
    return CLONED_OBJ;
}
exports.makeNonDisposable = makeNonDisposable;
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
/**
 * Tries to dispose an object inside another, parent object and deletes it there.
 *
 * @param {any} obj The "other" / parent object.
 * @param {PropertyKey} key The key inside 'obj', where the disposable object is stored and should be removed.
 * @param {boolean} [alwaysDelete] Delete even if operation failed or not.
 *
 * @return {vscode.Disposable|false} The disposed and removed object or (false) if failed.
 */
function tryDisposeAndDelete(obj, key, alwaysDelete = true) {
    alwaysDelete = vscode_helpers.toBooleanSafe(alwaysDelete, true);
    let result;
    try {
        if (obj) {
            let deleteObject = true;
            result = obj[key];
            if (!tryDispose(result)) {
                deleteObject = alwaysDelete;
            }
            if (deleteObject) {
                delete obj[key];
            }
            else {
                result = false;
            }
        }
    }
    catch (_a) {
        result = false;
    }
    return result;
}
exports.tryDisposeAndDelete = tryDisposeAndDelete;
/**
 * Invokes a function for a disposable object and keeps sure, that this object will be disposed,
 * even on error.
 *
 * @param {TObj} obj The object.
 * @param {Function} func The function to invoke.
 * @param {any[]} [args] One or more additional arguments for the function.
 *
 * @return Promise<TResult> The promise with the result of the function.
 */
function using(obj, func, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield Promise.resolve(func.apply(null, [obj].concat(args)));
        }
        finally {
            if (obj) {
                obj.dispose();
            }
        }
    });
}
exports.using = using;
/**
 * Invokes a function for a disposable object sync and keeps sure, that this object will be disposed,
 * even on error.
 *
 * @param {TObj} obj The object.
 * @param {Function} func The function to invoke.
 * @param {any[]} [args] One or more additional arguments for the function.
 *
 * @return TResult The result of the function.
 */
function usingSync(obj, func, ...args) {
    try {
        return func.apply(null, [obj].concat(args));
    }
    finally {
        if (obj) {
            obj.dispose();
        }
    }
}
exports.usingSync = usingSync;
//# sourceMappingURL=index.js.map