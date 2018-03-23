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
import * as vscode_helpers from '../index';

/**
 * A cache provider.
 */
export interface CacheProvider {
    /**
     * Clears the cache.
     *
     * @returns this
     *
     * @chainable
     */
    clear(): this;

    /**
     * Returns a value from the cache.
     *
     * @param {any} key The key of the value.
     * @param {TValue} [defaultValue] The default value.
     *
     * @returns {TValue|TDefault} The value.
     */
    get<TValue = any, TDefault = TValue>(key: any, defaultValue?: TDefault): TValue | TDefault;

    /**
     * Checks if the cache contains a value.
     *
     * @param {string} key The key of the value.
     *
     * @return {boolean} Contains value or not.
     */
    has(key: any): boolean;

    /**
     * Sets a value for an object.
     *
     * @param {string} key The key of the value.
     * @param {TValue} value The value to set.
     *
     * @returns this
     *
     * @chainable
     */
    set<TValue>(key: any, value: TValue): this;

    /**
     * Sets a value for an object.
     *
     * @param {string} name The name of the value.
     * @param {TValue} value The value to set.
     *
     * @returns this
     *
     * @chainable
     */
    unset(name: string): this;
}

/**
 * A basic cache provider.
 */
export abstract class CacheProviderBase implements CacheProvider {
    /** @inheritdoc */
    public abstract clear(): this;

    /** @inheritdoc */
    public abstract get<TValue = any, TDefault = TValue>(key: any, defaultValue?: TDefault): TValue | TDefault;

    /** @inheritdoc */
    public abstract has(key: any): boolean;

    /** @inheritdoc */
    public abstract set<TValue>(key: any, value: TValue): this;

    /** @inheritdoc */
    public abstract unset(key: any): this;
}

/**
 * A cache provider, which stores values in memory.
 */
export class MemoryCache extends CacheProviderBase {
    /**
     * The storage object with values.
     */
    protected _storage: { [key: string]: any } = {};

    /** @inheritdoc */
    public clear(): this {
        this._storage = {};
        return this;
    }

    /** @inheritdoc */
    public get<TValue = any, TDefault = TValue>(key: any, defaultValue?: TDefault): TValue | TDefault {
        key = this.normalizeKey(key);

        return this.has(key) ? this._storage[ key ]
                             : defaultValue;
    }

    /** @inheritdoc */
    public has(key: any): boolean {
        key = this.normalizeKey(key);

        return _.has(this._storage, key);
    }

    /**
     * Normalizes a key value.
     *
     * @param {any} key The input value.
     *
     * @return {string} The normalized value.
     */
    protected normalizeKey(key: any): string {
        return vscode_helpers.normalizeString(key);
    }

    /** @inheritdoc */
    public set<TValue>(key: any, value: TValue): this {
        key = this.normalizeKey(key);

        this._storage[ key ] = value;
        return this;
    }

    /** @inheritdoc */
    public unset(key: any): this {
        key = this.normalizeKey(key);

        delete this._storage[ key ];
        return this;
    }
}
