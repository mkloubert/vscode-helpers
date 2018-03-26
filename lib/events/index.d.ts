/// <reference types="node" />
import * as vscode from 'vscode';
/**
 * Stores the global event emitter.
 */
export declare const EVENTS: NodeJS.EventEmitter;
/**
 * Disposes the event emitter, stored in 'EVENTS'.
 */
export declare const EVENT_DISPOSER: vscode.Disposable;
/**
 * Tries to remove all listeners from an event emitter.
 *
 * @param {NodeJS.EventEmitter} obj The emitter.
 * @param {string|symbol} [ev] The optional event.
 *
 * @return {boolean} Operation was successfull or not.
 */
export declare function tryRemoveAllListeners(obj: NodeJS.EventEmitter, ev?: string | symbol): boolean;
/**
 * Tries to remove a listener from an event emitter.
 *
 * @param {NodeJS.EventEmitter} obj The emitter.
 * @param {string|symbol} ev The event.
 * @param {Function} listener The listener.
 *
 * @return {boolean} Operation was successfull or not.
 */
export declare function tryRemoveListener(obj: NodeJS.EventEmitter, ev: string | symbol, listener: Function): boolean;
