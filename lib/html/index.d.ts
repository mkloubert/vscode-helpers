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
import * as Marked from 'marked';
/**
 * Generates HTML from Markdown.
 *
 * @param {any} md The value with Markdown data.
 * @param {Marked.MarkedOptions} [opts] Custom options.
 *
 * @return {string} The generated HTML.
 */
export declare function fromMarkdown(md: any, opts?: Marked.MarkedOptions): string;
