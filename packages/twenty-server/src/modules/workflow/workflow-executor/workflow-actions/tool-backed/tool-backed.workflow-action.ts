import { Logger } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { type WorkflowAction as WorkflowActionContract } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

type BuildStepLogArgs<TInput> = {
  input: TInput;
  output: ToolOutput;
  durationMs: number;
};

export abstract class ToolBackedWorkflowAction<
  TInput extends ToolInput,
> implements WorkflowActionContract {
  protected readonly logger: Logger;

  protected constructor(
    loggerName: string,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
  ) {
    this.logger = new Logger(loggerName);
  }

  protected abstract getTool(): Tool;

  protected abstract assertStep(step: WorkflowAction): void;

  protected async preprocessInput(
    rawInput: TInput,
    _context: Record<string, unknown>,
  ): Promise<TInput> {
    return rawInput;
  }

  protected async postprocessInput(
    resolvedInput: TInput,
    _workspaceId: string,
  ): Promise<TInput> {
    return resolvedInput;
  }

  protected abstract buildStepLog(
    args: BuildStepLogArgs<TInput>,
  ): WorkflowRunStepLog;

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    this.assertStep(step);

    const rawInput = step.settings.input as TInput;
    const preprocessed = await this.preprocessInput(rawInput, context);
    const resolvedInput = await this.postprocessInput(
      resolveInput(preprocessed, context) as TInput,
      runInfo.workspaceId,
    );

    const startedAt = Date.now();
    const toolOutput = await this.getTool().execute(resolvedInput, {
      workspaceId: runInfo.workspaceId,
    });
    const durationMs = Date.now() - startedAt;

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId: runInfo.workspaceId,
      stepId: currentStepId,
      input: resolvedInput,
      output: toolOutput,
      durationMs,
    });

    return {
      result: toolOutput.result as object,
      error: toolOutput.error,
    };
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    input,
    output,
    durationMs,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    input: TInput;
    output: ToolOutput;
    durationMs: number;
  }): Promise<void> {
    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: this.buildStepLog({ input, output, durationMs }),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist step log for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
