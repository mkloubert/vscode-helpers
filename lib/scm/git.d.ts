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
/// <reference types="node" />
import * as ChildProcess from 'child_process';
import * as vscode_helpers from '../index';
import * as vscode_helpers_scm from './index';
/**
 * Stores the data of a git executable.
 */
export interface GitExecutable {
    /**
     * The path to the executable.
     */
    readonly path: string;
    /**
     * The version.
     */
    readonly version: string;
}
/**
 * A git client.
 */
export declare class GitClient implements vscode_helpers_scm.SourceControlClient {
    readonly executable: GitExecutable;
    /**
     * Initializes a new instance of that class.
     *
     * @param {GitExecutable} executable The data of the executable.
     * @param {string} [cwd] The optional working directory.
     */
    constructor(executable: GitExecutable, cwd?: string);
    /** @inheritdoc */
    readonly cwd: string;
    /**
     * Executes the Git client.
     *
     * @param {any[]} args Arguments for the execution.
     * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
     *
     * @return {Promise<vscode_helpers.ExecFileResult>} The promise with the result.
     */
    exec(args: any[], opts?: ChildProcess.ExecFileOptions): Promise<vscode_helpers.ExecFileResult>;
    /**
     * Executes the Git client (sync).
     *
     * @param {any[]} args Arguments for the execution.
     * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
     *
     * @return {string} The result.
     */
    execSync(args: any[], opts?: ChildProcess.ExecFileOptions): string;
}
/**
 * Tries to find the path of the Git executable.
 *
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<GitExecutable|false>} The promise with the executable or (false) if not found.
 */
export declare function tryFindGitPath(path?: string): Promise<false | GitExecutable>;
/**
 * Tries to find the path of the Git executable (sync).
 *
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {GitExecutable|false} The executable or (false) if not found.
 */
export declare function tryFindGitPathSync(path?: string): GitExecutable | false;
