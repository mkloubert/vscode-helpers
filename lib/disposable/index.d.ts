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
