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
export declare abstract class CacheProviderBase implements CacheProvider {
    /** @inheritdoc */
    abstract clear(): this;
    /** @inheritdoc */
    abstract get<TValue = any, TDefault = TValue>(key: any, defaultValue?: TDefault): TValue | TDefault;
    /** @inheritdoc */
    abstract has(key: any): boolean;
    /** @inheritdoc */
    abstract set<TValue>(key: any, value: TValue): this;
    /** @inheritdoc */
    abstract unset(key: any): this;
}
/**
 * A cache provider, which stores values in memory.
 */
export declare class MemoryCache extends CacheProviderBase {
    /**
     * The storage object with values.
     */
    protected _storage: {
        [key: string]: any;
    };
    /** @inheritdoc */
    clear(): this;
    /** @inheritdoc */
    get<TValue = any, TDefault = TValue>(key: any, defaultValue?: TDefault): TValue | TDefault;
    /** @inheritdoc */
    has(key: any): boolean;
    /**
     * Normalizes a key value.
     *
     * @param {any} key The input value.
     *
     * @return {string} The normalized value.
     */
    protected normalizeKey(key: any): string;
    /** @inheritdoc */
    set<TValue>(key: any, value: TValue): this;
    /** @inheritdoc */
    unset(key: any): this;
}
