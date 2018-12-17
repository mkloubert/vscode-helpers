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
import * as vscode_helpers from '../index';
import * as vscode_helpers_http from '../http/index';
/**
 * An extension notification.
 */
export interface ExtensionNotification {
    /**
     * The content.
     */
    content: string;
    /**
     * The ID.
     */
    id: string;
    /**
     * Link
     */
    link?: {
        /**
         * The URL of the link.
         */
        href: string;
        /**
         * The display text of the link.
         */
        text?: string;
    };
    /**
     * The maximum extension version.
     */
    max_version?: string;
    /**
     * The minimum extension version.
     */
    min_version?: string;
    /**
     * The time stamp.
     */
    time: string;
    /**
     * The optional title.
     */
    title?: string;
    /**
     * The time, the message starts to "live".
     */
    valid_from?: string;
    /**
     * The time, while the message "lives".
     */
    valid_until?: string;
    /**
     * The type.
     */
    type?: string;
}
/**
 * Options for 'filterExtensionNotifications()' function.
 */
export interface FilterExtensionNotificationsOptions {
    /**
     * The version of the extension.
     */
    version?: string;
}
/**
 * Filters extension notifications for display.
 *
 * @param {ExtensionNotification | ExtensionNotification[]} notifications The notifications to filter.
 * @param {FilterExtensionNotificationsOptions} [opts] Custom filter options.
 */
export declare function filterExtensionNotifications(notifications: ExtensionNotification | ExtensionNotification[], opts?: FilterExtensionNotificationsOptions): vscode_helpers.ExtensionNotification[];
/**
 * Returns the notifications for an extension.
 *
 * @param {vscode_helpers_http.HTTPRequestURL} url The URL of the JSON file, which contains the notifications.
 *
 * @return {Promise<ExtensionNotification[]>} The promise with the notifications.
 */
export declare function getExtensionNotifications(url: vscode_helpers_http.HTTPRequestURL): Promise<ExtensionNotification[]>;
