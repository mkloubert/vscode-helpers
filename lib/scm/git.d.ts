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
export declare function tryFindGitPath(path?: string): Promise<boolean | GitExecutable>;
/**
 * Tries to find the path of the Git executable (sync).
 *
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {GitExecutable|false} The executable or (false) if not found.
 */
export declare function tryFindGitPathSync(path?: string): GitExecutable | false;
