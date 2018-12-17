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
const CompareVersions = require('compare-versions');
const Moment = require("moment");
const vscode_helpers = require("../index");
const vscode_helpers_http = require("../http/index");
/**
 * Filters extension notifications for display.
 *
 * @param {ExtensionNotification | ExtensionNotification[]} notifications The notifications to filter.
 * @param {FilterExtensionNotificationsOptions} [opts] Custom filter options.
 */
function filterExtensionNotifications(notifications, opts) {
    if (!opts) {
        opts = {};
    }
    const NOW = Moment.utc();
    return vscode_helpers.asArray(notifications).filter(n => {
        // versions
        try {
            const CURRENT_VERSION = vscode_helpers.toStringSafe(opts.version).trim();
            if ('' !== CURRENT_VERSION) {
                // min_version
                try {
                    const MIN_VERSION = vscode_helpers.toStringSafe(n.min_version).trim();
                    if ('' !== MIN_VERSION) {
                        if (CompareVersions(CURRENT_VERSION, MIN_VERSION) < 0) {
                            return false;
                        }
                    }
                }
                catch (_a) { }
                // max_version
                try {
                    const MAX_VERSION = vscode_helpers.toStringSafe(n.max_version).trim();
                    if ('' !== MAX_VERSION) {
                        if (CompareVersions(CURRENT_VERSION, MAX_VERSION) > 0) {
                            return false;
                        }
                    }
                }
                catch (_b) { }
            }
        }
        catch (_c) { }
        // valid_from
        try {
            const VALID_FROM = vscode_helpers.toStringSafe(n.valid_from);
            if (!vscode_helpers.isEmptyString(VALID_FROM)) {
                let validFrom = Moment.utc(VALID_FROM);
                if (validFrom.isValid()) {
                    if (NOW.isBefore(validFrom)) {
                        return false;
                    }
                }
            }
        }
        catch (_d) { }
        // valid_until
        try {
            const VALID_UNTIL = vscode_helpers.toStringSafe(n.valid_until);
            if (!vscode_helpers.isEmptyString(VALID_UNTIL)) {
                let validUntil = Moment.utc(VALID_UNTIL);
                if (validUntil.isValid()) {
                    if (NOW.isAfter(validUntil)) {
                        return false;
                    }
                }
            }
        }
        catch (_e) { }
        return true;
    });
}
exports.filterExtensionNotifications = filterExtensionNotifications;
/**
 * Returns the notifications for an extension.
 *
 * @param {vscode_helpers_http.HTTPRequestURL} url The URL of the JSON file, which contains the notifications.
 *
 * @return {Promise<ExtensionNotification[]>} The promise with the notifications.
 */
function getExtensionNotifications(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const RESP = yield vscode_helpers_http.GET(vscode_helpers.toStringSafe(url));
        return vscode_helpers.asArray(JSON.parse((yield RESP.readBody()).toString('utf8')));
    });
}
exports.getExtensionNotifications = getExtensionNotifications;
//# sourceMappingURL=index.js.map