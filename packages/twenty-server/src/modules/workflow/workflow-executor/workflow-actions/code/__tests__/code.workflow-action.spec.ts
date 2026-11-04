import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { CodeWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/code.workflow-action';
import { CodeStepRunnerService } from 'src/modules/workflow/workflow-executor/workflow-actions/code/services/code-step-runner.service';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { type WorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

const APPLICATION = { id: 'application-id', name: 'Workspace' };

const EXECUTE_RESULT = {
  data: { sum: 3 },
  logs: '',
  duration: 1,
  billedDurationMs: 1,
  status: LogicFunctionExecutionStatus.SUCCESS,
};

const buildCodeStep = (input: WorkflowCodeActionInput): WorkflowCodeAction => ({
  id: 'code-step-id',
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  nextStepIds: [],
  settings: {
    input,
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
});

const buildAction = async () => {
  const codeStepRunnerService = {
    run: jest.fn().mockResolvedValue(EXECUTE_RESULT),
  };
  const logicFunctionExecutorService = {
    execute: jest.fn().mockResolvedValue(EXECUTE_RESULT),
  };
  const logicFunctionFromSourceHelperService = {
    findLogicFunctionRunnableOnDemandOrThrow: jest.fn().mockResolvedValue({
      flatLogicFunction: { applicationId: APPLICATION.id, name: 'Legacy' },
    }),
  };
  const workflowExecutionContextService = {
    getExecutionContext: jest.fn().mockResolvedValue({
      authContext: { type: 'application' },
      application: APPLICATION,
      workflowId: 'workflow-id',
    }),
    assertRunApplicationCanTriggerStepTargetOrThrow: jest.fn(),
  };

  const testingModule = await Test.createTestingModule({
    providers: [
      CodeWorkflowAction,
      { provide: CodeStepRunnerService, useValue: codeStepRunnerService },
      {
        provide: LogicFunctionExecutorService,
        useValue: logicFunctionExecutorService,
      },
      {
        provide: LogicFunctionFromSourceHelperService,
        useValue: logicFunctionFromSourceHelperService,
      },
      {
        provide: WorkflowExecutionContextService,
        useValue: workflowExecutionContextService,
      },
      {
        provide: WorkflowRunStepLogWorkspaceService,
        useValue: { setStepLog: jest.fn() },
      },
    ],
  }).compile();

  return {
    action: testingModule.get(CodeWorkflowAction),
    codeStepRunnerService,
    logicFunctionExecutorService,
    workflowExecutionContextService,
  };
};

const runStep = ({
  action,
  step,
}: {
  action: CodeWorkflowAction;
  step: WorkflowCodeAction;
}) =>
  action.execute({
    currentStepId: step.id,
    steps: [step],
    context: { trigger: { a: 1, b: 2 } },
    runInfo: { workflowRunId: 'workflow-run-id', workspaceId: 'workspace-id' },
  });

describe('CodeWorkflowAction', () => {
  it('runs inline code verbatim with only its input resolved', async () => {
    const { action, codeStepRunnerService, logicFunctionExecutorService } =
      await buildAction();

    const code =
      'export const main = async ({ a, b }) => ({ sum: a + b, raw: "{{trigger.a}}" });';

    const result = await runStep({
      action,
      step: buildCodeStep({
        code,
        logicFunctionInput: { a: '{{trigger.a}}', b: '{{trigger.b}}' },
      }),
    });

    expect(codeStepRunnerService.run).toHaveBeenCalledWith({
      flatApplication: APPLICATION,
      code,
      payload: { a: 1, b: 2 },
      workflowId: 'workflow-id',
    });
    expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
    expect(result).toEqual({ result: { sum: 3 } });
  });

  it('runs a legacy step through its logic function', async () => {
    const {
      action,
      codeStepRunnerService,
      logicFunctionExecutorService,
      workflowExecutionContextService,
    } = await buildAction();

    await runStep({
      action,
      step: buildCodeStep({
        logicFunctionId: 'logic-function-id',
        logicFunctionInput: { a: '{{trigger.a}}' },
      }),
    });

    expect(
      workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow,
    ).toHaveBeenCalled();
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
      logicFunctionId: 'logic-function-id',
      workspaceId: 'workspace-id',
      payload: { a: 1 },
    });
    expect(codeStepRunnerService.run).not.toHaveBeenCalled();
  });
});
