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
import * as Events from 'events';
import * as Moment from 'moment';
/**
 * A log action.
 *
 * @param {LogContext} context The log context.
 */
export declare type LogAction = (context: LogContext) => any;
/**
 * A log context.
 */
export interface LogContext {
    /**
     * The message.
     */
    readonly message: any;
    /**
     * The tag.
     */
    readonly tag?: string;
    /**
     * The time.
     */
    readonly time: Moment.Moment;
    /**
     * The type.
     */
    readonly type?: LogType;
}
/**
 * A log filter.
 */
export declare type LogFilter = (context: LogContext) => any;
/**
 * A logger.
 */
export interface Logger extends NodeJS.EventEmitter {
    /**
     * Logs an alert message.
     */
    readonly alert: TypedLogAction;
    /**
     * Logs a critical message.
     */
    readonly crit: TypedLogAction;
    /**
     * Logs a debug message.
     */
    readonly debug: TypedLogAction;
    /**
     * Logs an emergency message.
     */
    readonly emerg: TypedLogAction;
    /**
     * Logs an error message.
     */
    readonly err: TypedLogAction;
    /**
     * Logs an info message.
     */
    readonly info: TypedLogAction;
    /**
     * Logs a message.
     *
     * @param {LogType} The type.
     * @param {any} msg The message to log.
     * @param {string} [tag] The additional tag.
     */
    readonly log: (type: LogType, msg: any, tag?: string) => PromiseLike<void> | void;
    /**
     * Logs a note message.
     */
    readonly notice: TypedLogAction;
    /**
     * Logs a trace message.
     */
    readonly trace: TypedLogAction;
    /**
     * Logs a warning message.
     */
    readonly warn: TypedLogAction;
}
/**
 * A typed log action.
 *
 * @param {any} msg The message to log.
 * @param {string} [tag] An additional, optional tag.
 *
 * @return {Logger} The logger instance.
 *
 * @chainable
 */
export declare type TypedLogAction = (msg: any, tag?: string) => Logger;
/**
 * List of log types.
 */
export declare enum LogType {
    /**
     * Emergency
     */
    Emerg = 0,
    /**
     * Alert
     */
    Alert = 1,
    /**
     * Critical
     */
    Crit = 2,
    /**
     * Error
     */
    Err = 3,
    /**
     * Warning
     */
    Warn = 4,
    /**
     * Notice
     */
    Notice = 5,
    /**
     * Informational
     */
    Info = 6,
    /**
     * Debug
     */
    Debug = 7,
    /**
     * Trace
     */
    Trace = 8
}
/**
 * A basic logger.
 */
export declare abstract class LoggerBase extends Events.EventEmitter implements Logger {
    /** @inheritdoc */
    alert(msg: any, tag?: string): this;
    /** @inheritdoc */
    crit(msg: any, tag?: string): this;
    /** @inheritdoc */
    debug(msg: any, tag?: string): this;
    /** @inheritdoc */
    emerg(msg: any, tag?: string): this;
    /** @inheritdoc */
    err(msg: any, tag?: string): this;
    /** @inheritdoc */
    info(msg: any, tag?: string): this;
    /** @inheritdoc */
    log(type: LogType, msg: any, tag?: string): Promise<void>;
    /**
     * Sync logging.
     *
     * @param {LogType} type The type.
     * @param {any} msg The message.
     * @param {string} [tag] The optional tag.
     */
    protected logSync(type: LogType, msg: any, tag?: string): this;
    /**
     * Normalizes a tag value.
     *
     * @param {string} tag The input value.
     *
     * @return {string} The output value.
     */
    protected normalizeTag(tag: string): string;
    /** @inheritdoc */
    notice(msg: any, tag?: string): this;
    /**
     * The logic for logging a message.
     *
     * @param {LogContext} context The context.
     *
     * @return {Promise<any>} Invoke log event or not.
     */
    protected abstract onLog(context: LogContext): Promise<any>;
    /** @inheritdoc */
    trace(msg: any, tag?: string): this;
    /** @inheritdoc */
    warn(msg: any, tag?: string): this;
}
/**
 * A logger based on actions.
 */
export declare class ActionLogger extends LoggerBase {
    private _actions;
    private _filters;
    /**
     * Adds a new action.
     *
     * @param {LogAction} action The action to add.
     *
     * @return this
     *
     * @chainable
     */
    addAction(action: LogAction): this;
    /**
     * Adds a new filter.
     *
     * @param {LogFilter} filter The filter to add.
     *
     * @return this
     *
     * @chainable
     */
    addFilter(filter: LogFilter): this;
    /**
     * Clears anything of that logger.
     *
     * @return this
     *
     * @chainable
     */
    clear(): this;
    /**
     * Clears the action list.
     *
     * @return this
     *
     * @chainable
     */
    clearActions(): this;
    /**
     * Clears the filter list.
     *
     * @return this
     *
     * @chainable
     */
    clearFilters(): this;
    /** @inheritdoc */
    protected onLog(context: LogContext): Promise<void>;
}
/**
 * Creates a new logger instance.
 *
 * @param {LogAction[]} [actions] One or more initial actions to define.
 *
 * @return {vscode_helpers_logging.ActionLogger} The new logger.
 */
export declare function createLogger(...actions: LogAction[]): ActionLogger;
