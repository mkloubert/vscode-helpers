/// <reference types="node" />
/// <reference types="glob" />
import * as Glob from 'glob';
/**
 * Creates a directory (if needed).
 *
 * @param {string} dir The path of the directory to create.
 *
 * @return {Promise<boolean>} The promise that indicates if directory has been created or not.
 */
export declare function createDirectoryIfNeeded(dir: string): Promise<boolean>;
/**
 * Promise version of 'FS.exists()' function.
 *
 * @param {string|Buffer} path The path.
 *
 * @return {Promise<boolean>} The promise that indicates if path exists or not.
 */
export declare function exists(path: string | Buffer): Promise<boolean>;
/**
 * Promise version of 'Glob()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {Promise<string[]>} The promise with the matches.
 */
export declare function glob(patterns: string | string[], opts?: Glob.IOptions): Promise<string[]>;
/**
 * Multi pattern version of 'Glob.sync()' function.
 *
 * @param {string|string[]} patterns One or more patterns.
 * @param {Glob.IOptions} [opts] Custom options.
 *
 * @return {string[]} The matches.
 */
export declare function globSync(patterns: string | string[], opts?: Glob.IOptions): string[];
/**
 * Checks if a path exists and is a block device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isBlockDevice(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a block device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isBlockDeviceSync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isCharacterDevice(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a character device.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isCharacterDeviceSync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isDirectory(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a directory.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isDirectorySync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isFIFO(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is FIFO.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isFIFOSync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isFile(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a file.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isFileSync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isSocket(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a socket.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isSocketSync(path: string, useLSTAT?: boolean): boolean;
/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {Promise<boolean>} The promise with the value that indicates if condition matches or not.
 */
export declare function isSymbolicLink(path: string, useLSTAT?: boolean): Promise<boolean>;
/**
 * Checks if a path exists and is a symbolic link.
 *
 * @param {string} path The path to check.
 * @param {boolean} [useLSTAT] If (true) use 'FS.lstat()' function, otherwise 'FS.stat()'.
 *
 * @return {boolean} A value that indicates if condition matches or not.
 */
export declare function isSymbolicLinkSync(path: string, useLSTAT?: boolean): boolean;
