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
import * as Events from 'events';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';

/**
 * Name of the event, when an object has been disposed.
 */
export const EVENT_DISPOSED = 'disposed';
/**
 * Name of an event, when an object is going to be disposed.
 */
export const EVENT_DISPOSING = 'disposing';

/**
 * A disposable object.
 */
export abstract class DisposableBase extends Events.EventEmitter implements vscode.Disposable {
    /**
     * Stores disposable sub objects.
     */
    protected readonly _DISPOSABLES: vscode.Disposable[] = [];
    /**
     * Stores intervals.
     */
    protected readonly _INTERVALS: NodeJS.Timer[] = [];
    private _isDisposed = false;
    private _isDisposing = false;
    /**
     * Stores timeouts.
     */
    protected readonly _TIMEOUTS: NodeJS.Timer[] = [];

    /**
     * Cleansup all timeouts.
     */
    protected cleanupIntervals() {
        while (this._TIMEOUTS.length > 0) {
            vscode_helpers.tryClearInterval(
                this._TIMEOUTS.shift()
            );
        }
    }

    /**
     * Cleansup all timeouts.
     */
    protected cleanupTimeouts() {
        while (this._TIMEOUTS.length > 0) {
            vscode_helpers.tryClearTimeout(
                this._TIMEOUTS.shift()
            );
        }
    }

    /** @inheritdoc */
    public dispose() {
        if (this.isInFinalizeState) {
            return;
        }

        try {
            this._isDisposing = true;
            this.emit( EVENT_DISPOSING );

            this.cleanupIntervals();
            this.cleanupTimeouts();

            this.removeAllListeners();

            while (this._DISPOSABLES.length > 0) {
                tryDispose(
                    this._DISPOSABLES.shift()
                );
            }

            this.onDispose();

            this._isDisposed = true;
            this.emit( EVENT_DISPOSED );
        } finally {
            this._isDisposing = false;
        }
    }

    /**
     * Gets if object has been disposed or not.
     */
    public get isDisposed() {
        return this._isDisposed;
    }

    /**
     * Gets if the 'dispose()' method is currently executed or not.
     */
    public get isDisposing() {
        return this._isDisposing;
    }

    /**
     * Gets if the object is disposed or currently disposing.
     */
    public get isInFinalizeState() {
        return this.isDisposed || this.isDisposing;
    }

    /**
     * Additional logic for the 'dispose()' method.
     */
    protected onDispose(): void {
    }
}

/**
 * Clones an object and makes it non disposable.
 *
 * @param {TObj} obj The object to clone.
 * @param {boolean} [throwOnDispose] Throw error when coll 'dispose()' method or not.
 *
 * @return {TObj} The cloned object.
 */
export function makeNonDisposable<TObj extends vscode.Disposable>(
    obj: TObj,
    throwOnDispose = true,
): TObj {
    throwOnDispose = vscode_helpers.toBooleanSafe(throwOnDispose, true);

    const CLONED_OBJ: any = vscode_helpers.cloneObjectFlat(obj);

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

/**
 * Tries to dispose an object.
 *
 * @param {object} obj The object to dispose.
 *
 * @return {boolean} Operation was successful or not.
 */
export function tryDispose(obj: vscode.Disposable): boolean {
    try {
        if (obj && obj.dispose) {
            obj.dispose();
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Tries to dispose an object inside another, parent object and deletes it there.
 *
 * @param {any} obj The "other" / parent object.
 * @param {PropertyKey} key The key inside 'obj', where the disposable object is stored and should be removed.
 * @param {boolean} [alwaysDelete] Delete even if operation failed or not.
 *
 * @return {vscode.Disposable|false} The disposed and removed object or (false) if failed.
 */
export function tryDisposeAndDelete(obj: any, key: PropertyKey, alwaysDelete = true): false | vscode.Disposable {
    alwaysDelete = vscode_helpers.toBooleanSafe(alwaysDelete, true);

    let result: false | vscode.Disposable;

    try {
        if (obj) {
            let deleteObject = true;
            result = obj[key];

            if (!tryDispose( <vscode.Disposable>result )) {
                deleteObject = alwaysDelete;
            }

            if (deleteObject) {
                delete obj[key];
            } else {
                result = false;
            }
        }
    } catch {
        result = false;
    }

    return result;
}

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
export async function using<TObj extends vscode.Disposable = vscode.Disposable, TResult = any>(
    obj: TObj,
    func: (o: TObj, ...args: any[]) => TResult | PromiseLike<TResult>,
    ...args: any[]
): Promise<TResult> {
    try {
        return await Promise.resolve(
            func.apply(null,
                       [ obj ].concat(args))
        );
    } finally {
        if (obj) {
            obj.dispose();
        }
    }
}

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
export function usingSync<TObj extends vscode.Disposable = vscode.Disposable, TResult = any>(
    obj: TObj,
    func: (o: TObj, ...args: any[]) => TResult,
    ...args: any[]
): TResult {
    try {
        return func.apply(null,
                          [ obj ].concat(args));
    } finally {
        if (obj) {
            obj.dispose();
        }
    }
}
