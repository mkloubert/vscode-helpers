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
const Marked = require("marked");
const MergeDeep = require('merge-deep');
const vscode_helpers = require("../index");
/**
 * Generates HTML from Markdown.
 *
 * @param {any} md The value with Markdown data.
 * @param {Marked.MarkedOptions} [opts] Custom options.
 *
 * @return {string} The generated HTML.
 */
function fromMarkdown(md, opts) {
    if (!opts) {
        opts = opts;
    }
    const DEFAULT_OPTS = {
        breaks: true,
        gfm: true,
        langPrefix: '',
        tables: true,
    };
    md = vscode_helpers.toStringSafe(md);
    return Marked(vscode_helpers.toStringSafe(md), MergeDeep(DEFAULT_OPTS, opts));
}
exports.fromMarkdown = fromMarkdown;
//# sourceMappingURL=index.js.map