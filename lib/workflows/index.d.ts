/**
 * A workflow builder.
 */
export interface WorkflowBuilder<TPrev = any> {
    /**
     * Adds the next action to invoke.
     *
     * @param {WorkflowAction<TPrev,TNext>} action The next action.
     *
     * @chainable
     */
    next<TNext = any>(action: WorkflowAction<TPrev, TNext>): WorkflowBuilder<TNext>;
    /**
     * Starts the workflow.
     *
     * @param {any} [initialPrevValue] The initial 'previous value'.
     *
     * @return {PromiseLike<TResult>} The promise with the result.
     */
    start<TResult = TPrev>(initialPrevValue?: any): PromiseLike<TResult>;
}
/**
 * The context of a workflow action.
 */
export interface WorkflowActionContext {
    /**
     * The zero-based index of the current action.
     */
    readonly index: number;
    /**
     * Gets or sets the value for the custom result for 'IWorkflowBuilder.start()'.
     */
    result: any;
    /**
     * Gets or sets the value for the execution chain.
     */
    value: any;
}
/**
 * A workflow action.
 *
 * @param {TPrev} prevValue The previous value.
 * @param {IWorkflowActionContext} context The current context.
 */
export declare type WorkflowAction<TPrev, TNext> = (prevValue: TPrev, context: WorkflowActionContext) => TNext | PromiseLike<TNext>;
/**
 * A symbol that indicates that 'IWorkflowActionContext.result' will NOT be used
 * as result value of 'IWorkflowBuilder.start()'.
 */
export declare const NO_CUSTOM_RESULT: unique symbol;
/**
 * Starts building a workflows.
 *
 * @param {any} [initialValue] The initial value for 'WorkflowActionContext.value'.
 *
 * @return {WorkflowBuilder<undefined>} The new workflow builder.
 */
export declare function buildWorkflow(initialValue?: any): WorkflowBuilder<undefined>;
