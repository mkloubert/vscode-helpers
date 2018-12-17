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
const _ = require("lodash");
const vscode_helpers = require("../index");
/**
 * A basic cache provider.
 */
class CacheProviderBase {
}
exports.CacheProviderBase = CacheProviderBase;
/**
 * A cache provider, which stores values in memory.
 */
class MemoryCache extends CacheProviderBase {
    constructor() {
        super(...arguments);
        /**
         * The storage object with values.
         */
        this._storage = {};
    }
    /** @inheritdoc */
    clear() {
        this._storage = {};
        return this;
    }
    /** @inheritdoc */
    get(key, defaultValue) {
        key = this.normalizeKey(key);
        return this.has(key) ? this._storage[key]
            : defaultValue;
    }
    /** @inheritdoc */
    has(key) {
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
    normalizeKey(key) {
        return vscode_helpers.normalizeString(key);
    }
    /** @inheritdoc */
    set(key, value) {
        key = this.normalizeKey(key);
        this._storage[key] = value;
        return this;
    }
    /** @inheritdoc */
    unset(key) {
        key = this.normalizeKey(key);
        delete this._storage[key];
        return this;
    }
}
exports.MemoryCache = MemoryCache;
//# sourceMappingURL=index.js.map