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
const Events = require("events");
const Moment = require("moment");
const vscode_helpers = require("../index");
/**
 * List of log types.
 */
var LogType;
(function (LogType) {
    /**
     * Emergency
     */
    LogType[LogType["Emerg"] = 0] = "Emerg";
    /**
     * Alert
     */
    LogType[LogType["Alert"] = 1] = "Alert";
    /**
     * Critical
     */
    LogType[LogType["Crit"] = 2] = "Crit";
    /**
     * Error
     */
    LogType[LogType["Err"] = 3] = "Err";
    /**
     * Warning
     */
    LogType[LogType["Warn"] = 4] = "Warn";
    /**
     * Notice
     */
    LogType[LogType["Notice"] = 5] = "Notice";
    /**
     * Informational
     */
    LogType[LogType["Info"] = 6] = "Info";
    /**
     * Debug
     */
    LogType[LogType["Debug"] = 7] = "Debug";
    /**
     * Trace
     */
    LogType[LogType["Trace"] = 8] = "Trace";
})(LogType = exports.LogType || (exports.LogType = {}));
/**
 * A basic logger.
 */
class LoggerBase extends Events.EventEmitter {
    /** @inheritdoc */
    alert(msg, tag) {
        return this.logSync(LogType.Alert, msg, tag);
    }
    /** @inheritdoc */
    crit(msg, tag) {
        return this.logSync(LogType.Crit, msg, tag);
    }
    /** @inheritdoc */
    debug(msg, tag) {
        return this.logSync(LogType.Debug, msg, tag);
    }
    /** @inheritdoc */
    emerg(msg, tag) {
        return this.logSync(LogType.Emerg, msg, tag);
    }
    /** @inheritdoc */
    err(msg, tag) {
        return this.logSync(LogType.Err, msg, tag);
    }
    /** @inheritdoc */
    info(msg, tag) {
        return this.logSync(LogType.Info, msg, tag);
    }
    /** @inheritdoc */
    log(type, msg, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTEXT = {
                message: msg,
                tag: this.normalizeTag(tag),
                time: Moment(),
                type: type,
            };
            const RAISE_EVENT = yield Promise.resolve(vscode_helpers.toBooleanSafe(yield this.onLog(CONTEXT), true));
            if (RAISE_EVENT) {
                this.emit('log', CONTEXT);
            }
        });
    }
    /**
     * Sync logging.
     *
     * @param {LogType} type The type.
     * @param {any} msg The message.
     * @param {string} [tag] The optional tag.
     */
    logSync(type, msg, tag) {
        this.log(type, msg, tag);
        return this;
    }
    /**
     * Normalizes a tag value.
     *
     * @param {string} tag The input value.
     *
     * @return {string} The output value.
     */
    normalizeTag(tag) {
        tag = vscode_helpers.normalizeString(tag, s => s.toUpperCase().trim());
        if ('' === tag) {
            tag = undefined;
        }
        return tag;
    }
    /** @inheritdoc */
    notice(msg, tag) {
        return this.logSync(LogType.Notice, msg, tag);
    }
    /** @inheritdoc */
    trace(msg, tag) {
        return this.logSync(LogType.Trace, msg, tag);
    }
    /** @inheritdoc */
    warn(msg, tag) {
        return this.logSync(LogType.Warn, msg, tag);
    }
}
exports.LoggerBase = LoggerBase;
/**
 * A logger based on actions.
 */
class ActionLogger extends LoggerBase {
    constructor() {
        super(...arguments);
        this._actions = [];
        this._filters = [];
    }
    /**
     * Adds a new action.
     *
     * @param {LogAction} action The action to add.
     *
     * @return this
     *
     * @chainable
     */
    addAction(action) {
        this._actions
            .push(action);
        return this;
    }
    /**
     * Adds a new filter.
     *
     * @param {LogFilter} filter The filter to add.
     *
     * @return this
     *
     * @chainable
     */
    addFilter(filter) {
        this._filters
            .push(filter);
        return this;
    }
    /**
     * Clears anything of that logger.
     *
     * @return this
     *
     * @chainable
     */
    clear() {
        return this.clearActions()
            .clearFilters();
    }
    /**
     * Clears the action list.
     *
     * @return this
     *
     * @chainable
     */
    clearActions() {
        this._actions = [];
        return this;
    }
    /**
     * Clears the filter list.
     *
     * @return this
     *
     * @chainable
     */
    clearFilters() {
        this._filters = [];
        return this;
    }
    /** @inheritdoc */
    onLog(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const ACTIONS = this._actions || [];
            const FILTERS = this._filters || [];
            for (let i = 0; i < ACTIONS.length; i++) {
                try {
                    const LOG_ACTION = ACTIONS[i];
                    let doLog = true;
                    for (let j = 0; j < FILTERS.length; j++) {
                        try {
                            const LOG_FILTER = FILTERS[j];
                            doLog = vscode_helpers.toBooleanSafe(yield Promise.resolve(LOG_FILTER(context)), true);
                        }
                        catch (_a) { }
                        if (!doLog) {
                            break;
                        }
                    }
                    if (doLog) {
                        LOG_ACTION(context);
                    }
                }
                catch (_b) { }
            }
        });
    }
}
exports.ActionLogger = ActionLogger;
/**
 * Creates a new logger instance.
 *
 * @param {LogAction[]} [actions] One or more initial actions to define.
 *
 * @return {vscode_helpers_logging.ActionLogger} The new logger.
 */
function createLogger(...actions) {
    const NEW_LOGGER = new ActionLogger();
    actions.forEach(a => {
        NEW_LOGGER.addAction(a);
    });
    return NEW_LOGGER;
}
exports.createLogger = createLogger;
//# sourceMappingURL=index.js.map