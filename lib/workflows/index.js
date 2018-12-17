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
/**
 * A symbol that indicates that 'IWorkflowActionContext.result' will NOT be used
 * as result value of 'IWorkflowBuilder.start()'.
 */
exports.NO_CUSTOM_RESULT = Symbol('NO_CUSTOM_RESULT');
class WorkflowBuilderImpl {
    constructor(initialValue) {
        this._ACTIONS = [];
        this._INITIAL_VALUE = initialValue;
    }
    next(action) {
        this._ACTIONS.push(action);
        return this;
    }
    start(initialPrevValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let index = 0;
            let prevValue = initialPrevValue;
            let result = exports.NO_CUSTOM_RESULT;
            let value = this._INITIAL_VALUE;
            while (index < this._ACTIONS.length) {
                const ACTION = this._ACTIONS[index];
                const CTX = {
                    index: index,
                    result: result,
                    value: value,
                };
                try {
                    if (ACTION) {
                        prevValue = yield Promise.resolve(ACTION(prevValue, CTX));
                    }
                }
                finally {
                    value = CTX.value;
                    result = CTX.result;
                    ++index;
                }
            }
            return exports.NO_CUSTOM_RESULT === result ? prevValue
                : result;
        });
    }
}
/**
 * Starts building a workflows.
 *
 * @param {any} [initialValue] The initial value for 'WorkflowActionContext.value'.
 *
 * @return {WorkflowBuilder<undefined>} The new workflow builder.
 */
function buildWorkflow(initialValue) {
    return new WorkflowBuilderImpl(initialValue);
}
exports.buildWorkflow = buildWorkflow;
//# sourceMappingURL=index.js.map