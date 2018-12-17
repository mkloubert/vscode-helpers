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
import * as Events from 'events';
import * as vscode from 'vscode';
/**
 * Name of the event, when an object has been disposed.
 */
export declare const EVENT_DISPOSED = "disposed";
/**
 * Name of an event, when an object is going to be disposed.
 */
export declare const EVENT_DISPOSING = "disposing";
/**
 * A disposable object.
 */
export declare abstract class DisposableBase extends Events.EventEmitter implements vscode.Disposable {
    /**
     * Stores disposable sub objects.
     */
    protected readonly _DISPOSABLES: vscode.Disposable[];
    /**
     * Stores intervals.
     */
    protected readonly _INTERVALS: NodeJS.Timer[];
    private _isDisposed;
    private _isDisposing;
    /**
     * Stores timeouts.
     */
    protected readonly _TIMEOUTS: NodeJS.Timer[];
    /**
     * Cleansup all timeouts.
     */
    protected cleanupIntervals(): void;
    /**
     * Cleansup all timeouts.
     */
    protected cleanupTimeouts(): void;
    /** @inheritdoc */
    dispose(): void;
    /**
     * Gets if object has been disposed or not.
     */
    readonly isDisposed: boolean;
    /**
     * Gets if the 'dispose()' method is currently executed or not.
     */
    readonly isDisposing: boolean;
    /**
     * Gets if the object is disposed or currently disposing.
     */
    readonly isInFinalizeState: boolean;
    /**
     * Additional logic for the 'dispose()' method.
     */
    protected onDispose(): void;
}
/**
 * Clones an object and makes it non disposable.
 *
 * @param {TObj} obj The object to clone.
 * @param {boolean} [throwOnDispose] Throw error when coll 'dispose()' method or not.
 *
 * @return {TObj} The cloned object.
 */
export declare function makeNonDisposable<TObj extends vscode.Disposable>(obj: TObj, throwOnDispose?: boolean): TObj;
/**
 * Tries to dispose an object.
 *
 * @param {object} obj The object to dispose.
 *
 * @return {boolean} Operation was successful or not.
 */
export declare function tryDispose(obj: vscode.Disposable): boolean;
/**
 * Tries to dispose an object inside another, parent object and deletes it there.
 *
 * @param {any} obj The "other" / parent object.
 * @param {PropertyKey} key The key inside 'obj', where the disposable object is stored and should be removed.
 * @param {boolean} [alwaysDelete] Delete even if operation failed or not.
 *
 * @return {vscode.Disposable|false} The disposed and removed object or (false) if failed.
 */
export declare function tryDisposeAndDelete(obj: any, key: PropertyKey, alwaysDelete?: boolean): false | vscode.Disposable;
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
export declare function using<TObj extends vscode.Disposable = vscode.Disposable, TResult = any>(obj: TObj, func: (o: TObj, ...args: any[]) => TResult | PromiseLike<TResult>, ...args: any[]): Promise<TResult>;
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
export declare function usingSync<TObj extends vscode.Disposable = vscode.Disposable, TResult = any>(obj: TObj, func: (o: TObj, ...args: any[]) => TResult, ...args: any[]): TResult;
