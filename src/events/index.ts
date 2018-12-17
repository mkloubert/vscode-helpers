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

import * as Events from 'events';
import * as vscode from 'vscode';

/**
 * Stores the global event emitter.
 */
export const EVENTS: NodeJS.EventEmitter = new Events.EventEmitter();

/**
 * Disposes the event emitter, stored in 'EVENTS'.
 */
export const EVENT_DISPOSER: vscode.Disposable = {
    /** @inheritdoc */
    dispose: () => {
        EVENTS.removeAllListeners();
    }
};

/**
 * Tries to remove all listeners from an event emitter.
 *
 * @param {NodeJS.EventEmitter} obj The emitter.
 * @param {string|symbol} [ev] The optional event.
 *
 * @return {boolean} Operation was successfull or not.
 */
export function tryRemoveAllListeners(obj: NodeJS.EventEmitter, ev?: string | symbol) {
    try {
        if (obj && obj.removeAllListeners) {
            obj.removeAllListeners(ev);
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Tries to remove a listener from an event emitter.
 *
 * @param {NodeJS.EventEmitter} obj The emitter.
 * @param {string|symbol} ev The event.
 * @param {Function} listener The listener.
 *
 * @return {boolean} Operation was successfull or not.
 */
export function tryRemoveListener(
    obj: NodeJS.EventEmitter,
    ev: string | symbol,
    listener: (...args: any[]) => void,
) {
    try {
        if (obj && obj.removeListener) {
            obj.removeListener(ev, listener);
        }

        return true;
    } catch {
        return false;
    }
}
