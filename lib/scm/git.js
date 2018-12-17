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
/**
 * Most of the code has been taken from 'vscode-gitlens':
 * https://github.com/eamodio/vscode-gitlens
 *
 * LICENSE:
 * https://github.com/eamodio/vscode-gitlens/blob/master/LICENSE
 */
const _ = require("lodash");
const ChildProcess = require("child_process");
const FSExtra = require("fs-extra");
const MergeDeep = require('merge-deep');
const Path = require("path");
const vscode_helpers = require("../index");
/**
 * A git client.
 */
class GitClient {
    /**
     * Initializes a new instance of that class.
     *
     * @param {GitExecutable} executable The data of the executable.
     * @param {string} [cwd] The optional working directory.
     */
    constructor(executable, cwd) {
        this.executable = executable;
        this.cwd = vscode_helpers.toStringSafe(cwd);
        if (vscode_helpers.isEmptyString(this.cwd)) {
            this.cwd = undefined;
        }
        else {
            if (!Path.isAbsolute(this.cwd)) {
                this.cwd = Path.join(process.cwd(), this.cwd);
            }
            this.cwd = Path.resolve(this.cwd);
        }
    }
    /**
     * Executes the Git client.
     *
     * @param {any[]} args Arguments for the execution.
     * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
     *
     * @return {Promise<vscode_helpers.ExecFileResult>} The promise with the result.
     */
    exec(args, opts) {
        const DEFAULT_OPTS = {
            cwd: this.cwd,
        };
        return vscode_helpers.execFile(this.executable.path, args, MergeDeep(DEFAULT_OPTS, opts));
    }
    /**
     * Executes the Git client (sync).
     *
     * @param {any[]} args Arguments for the execution.
     * @param {ChildProcess.ExecFileOptions} [opts] Custom options.
     *
     * @return {string} The result.
     */
    execSync(args, opts) {
        const DEFAULT_OPTS = {
            cwd: this.cwd,
        };
        return asString(ChildProcess.execFileSync(this.executable.path, vscode_helpers.asArray(args, false)
            .map(x => vscode_helpers.toStringSafe(x)), MergeDeep(DEFAULT_OPTS, opts)));
    }
}
exports.GitClient = GitClient;
function asString(val) {
    if (!_.isNil(val)) {
        if (Buffer.isBuffer(val)) {
            val = val.toString('utf8');
        }
    }
    return vscode_helpers.toStringSafe(val);
}
function findExecutableSync(exe, args) {
    // POSIX can just execute scripts directly, no need for silly goosery
    if (!vscode_helpers.IS_WINDOWS) {
        return {
            cmd: runDownPathSync(exe),
            args: args,
        };
    }
    if (!FSExtra.existsSync(exe)) {
        // NB: When you write something like `surf-client ... -- surf-build` on Windows,
        // a shell would normally convert that to surf-build.cmd, but since it's passed
        // in as an argument, it doesn't happen
        const POSSIBLE_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1'];
        for (const EXT of POSSIBLE_EXTENSIONS) {
            const FULL_PATH = runDownPathSync(`${exe}${EXT}`);
            if (FSExtra.existsSync(FULL_PATH)) {
                return findExecutableSync(FULL_PATH, args);
            }
        }
    }
    if (exe.match(/\.ps1$/i)) { // PowerShell
        const CMD = Path.join(process.env.SYSTEMROOT, 'System32', 'WindowsPowerShell', 'v1.0', 'PowerShell.exe');
        const PS_ARGS = ['-ExecutionPolicy', 'Unrestricted', '-NoLogo', '-NonInteractive', '-File', exe];
        return {
            cmd: CMD,
            args: PS_ARGS.concat(args),
        };
    }
    if (exe.match(/\.(bat|cmd)$/i)) { // Windows batch?
        const CMD = Path.join(process.env.SYSTEMROOT, 'System32', 'cmd.exe');
        const CMD_ARGS = ['/C', exe, ...args];
        return {
            cmd: CMD,
            args: CMD_ARGS,
        };
    }
    if (exe.match(/\.(js)$/i)) { // NodeJS?
        const CMD = process.execPath;
        const NODE_ARGS = [exe];
        return {
            cmd: CMD,
            args: NODE_ARGS.concat(args)
        };
    }
    return {
        cmd: exe,
        args: args
    };
}
function findGitDarwinSync() {
    let path = runCommandSync('which', ['git']);
    path = path.replace(/^\s+|\s+$/g, '');
    if (path !== '/usr/bin/git') {
        return findSpecificGitSync(path);
    }
    try {
        runCommandSync('xcode-select', ['-p']);
        return findSpecificGitSync(path);
    }
    catch (e) {
        if (2 === e.code) {
            throw new Error('Unable to find git');
        }
        return findSpecificGitSync(path);
    }
}
function findGitPathSync(path) {
    path = vscode_helpers.toStringSafe(path);
    if (vscode_helpers.isEmptyString(path)) {
        path = 'git'; // default
    }
    try {
        return findSpecificGitSync(path);
    }
    catch (_a) { }
    // fallback: platform specific
    try {
        if (vscode_helpers.IS_MAC) {
            return findGitDarwinSync();
        }
        if (vscode_helpers.IS_WINDOWS) {
            return findGitWin32Sync();
        }
    }
    catch (_b) { }
    return false;
}
function findGitWin32Sync() {
    try {
        return findSystemGitWin32Sync(process.env['ProgramW6432']);
    }
    catch (_a) {
        try {
            return findSystemGitWin32Sync(process.env['ProgramFiles(x86)']);
        }
        catch (_b) {
            try {
                return findSystemGitWin32Sync(process.env['ProgramFiles']);
            }
            catch (_c) {
                return findSpecificGitSync('git');
            }
        }
    }
}
function findSpecificGitSync(path) {
    const VERSION = runCommandSync(path, ['--version']);
    // If needed, let's update our path to avoid the search on every command
    if (vscode_helpers.isEmptyString(path) || path === 'git') {
        path = (findExecutableSync(path, ['--version'])).cmd;
    }
    return {
        path,
        version: parseVersion(VERSION.trim()),
    };
}
function findSystemGitWin32Sync(basePath) {
    if (vscode_helpers.isEmptyString(basePath)) {
        throw new Error('Unable to find git');
    }
    return findSpecificGitSync(Path.join(basePath, 'Git', 'cmd', 'git.exe'));
}
function parseVersion(raw) {
    return raw.replace(/^git version /, '');
}
function runCommandSync(command, args) {
    return asString(ChildProcess.execFileSync(vscode_helpers.toStringSafe(command), vscode_helpers.asArray(args, false)
        .map(x => vscode_helpers.toStringSafe(x))));
}
function runDownPathSync(exe) {
    // NB: Windows won't search PATH looking for executables in spawn like
    // Posix does
    // Files with any directory path don't get this applied
    if (exe.match(/[\\\/]/)) {
        return exe;
    }
    const TARGET = Path.join('.', exe);
    try {
        if (FSExtra.statSync(TARGET)) {
            return TARGET;
        }
    }
    catch (_a) { }
    const HAYSTACK = process.env.PATH.split(vscode_helpers.IS_WINDOWS ? ';' : ':');
    for (const P of HAYSTACK) {
        const NEEDLE = Path.join(P, exe);
        try {
            if (FSExtra.statSync(NEEDLE)) {
                return NEEDLE;
            }
        }
        catch (_b) { }
    }
    return exe;
}
/**
 * Tries to find the path of the Git executable.
 *
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {Promise<GitExecutable|false>} The promise with the executable or (false) if not found.
 */
function tryFindGitPath(path) {
    return Promise.resolve(tryFindGitPathSync(path));
}
exports.tryFindGitPath = tryFindGitPath;
/**
 * Tries to find the path of the Git executable (sync).
 *
 * @param {string} [path] The optional specific path where to search first.
 *
 * @return {GitExecutable|false} The executable or (false) if not found.
 */
function tryFindGitPathSync(path) {
    let git;
    try {
        git = findGitPathSync(path);
        if (false !== git) {
            git = {
                path: Path.resolve(git.path),
                version: git.version,
            };
        }
    }
    catch (_a) {
        git = false;
    }
    return git;
}
exports.tryFindGitPathSync = tryFindGitPathSync;
//# sourceMappingURL=git.js.map