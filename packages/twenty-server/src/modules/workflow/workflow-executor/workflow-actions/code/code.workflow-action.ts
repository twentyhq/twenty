import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { CodeStepRunnerService } from 'src/modules/workflow/workflow-executor/workflow-actions/code/services/code-step-runner.service';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { buildCodeStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/code/utils/build-code-step-log.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

@Injectable()
export class CodeWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(CodeWorkflowAction.name);

  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionFromSourceHelperService: LogicFunctionFromSourceHelperService,
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly codeStepRunnerService: CodeStepRunnerService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowCodeAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a code action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    // Inline code must stay verbatim: only the step input goes through the variable resolver
    const logicFunctionInput = resolveInput(
      step.settings.input.logicFunctionInput,
      context,
    ) as WorkflowCodeActionInput['logicFunctionInput'];

    const { workspaceId } = runInfo;

    const { authContext, application, workflowId } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const result = await this.runCodeStep({
      code: step.settings.input.code,
      logicFunctionId: step.settings.input.logicFunctionId,
      workspaceId,
      payload: logicFunctionInput,
      executionContext: { authContext, application, workflowId },
    });

    await this.persistStepLog({
      workflowRunId: runInfo.workflowRunId,
      workspaceId,
      stepId: currentStepId,
      result,
    });

    if (result.error) {
      return { error: result.error.errorMessage };
    }

    return { result: result.data || {} };
  }

  private async runCodeStep({
    code,
    logicFunctionId,
    workspaceId,
    payload,
    executionContext,
  }: {
    code: string | undefined;
    logicFunctionId: string | undefined;
    workspaceId: string;
    payload: object;
    executionContext: Pick<
      WorkflowExecutionContext,
      'authContext' | 'application' | 'workflowId'
    >;
  }): Promise<LogicFunctionExecuteResult> {
    if (isDefined(code)) {
      return this.codeStepRunnerService.run({
        flatApplication: executionContext.application,
        code,
        payload,
        workflowId: executionContext.workflowId,
        ...getUserFromAuthContext(executionContext.authContext),
      });
    }

    return this.executeLegacyLogicFunction({
      logicFunctionId,
      workspaceId,
      payload,
      executionContext,
    });
  }

  // runs started before upgrade:2-56:inline-code-step-sources
  private async executeLegacyLogicFunction({
    logicFunctionId,
    workspaceId,
    payload,
    executionContext,
  }: {
    logicFunctionId: string | undefined;
    workspaceId: string;
    payload: object;
    executionContext: Pick<
      WorkflowExecutionContext,
      'authContext' | 'application'
    >;
  }): Promise<LogicFunctionExecuteResult> {
    if (!isNonEmptyString(logicFunctionId)) {
      throw new WorkflowStepExecutorException(
        'Code step has neither code nor a logic function',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const { flatLogicFunction } =
      await this.logicFunctionFromSourceHelperService.findLogicFunctionRunnableOnDemandOrThrow(
        {
          id: logicFunctionId,
          workspaceId,
        },
      );

    this.workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow(
      {
        executionContext,
        targetApplicationId: flatLogicFunction.applicationId,
        targetLabel: `Logic function "${flatLogicFunction.name}"`,
      },
    );

    if (!flatLogicFunction.isBuildUpToDate) {
      await this.logicFunctionFromSourceService.buildOneFromSource({
        id: logicFunctionId,
        workspaceId,
      });
    }

    return this.logicFunctionExecutorService.execute({
      logicFunctionId,
      workspaceId,
      payload,
      ...getUserFromAuthContext(executionContext.authContext),
    });
  }

  private async persistStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    result,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    result: LogicFunctionExecuteResult;
  }): Promise<void> {
    try {
      await this.workflowRunStepLogService.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        stepLog: buildCodeStepLog(result),
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
