import { Test, type TestingModule } from '@nestjs/testing';

import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { HttpRequestWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/http-request.workflow-action';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

const baseSettings: WorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: false },
    continueOnFailure: { value: false },
  },
  input: {},
};

const buildHttpRequestStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.HTTP_REQUEST,
    name: 'HTTP Request',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('HttpRequestWorkflowAction', () => {
  let action: HttpRequestWorkflowAction;
  let mockHttpTool: jest.Mocked<Pick<HttpTool, 'execute'>>;
  let mockSetStepLog: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockHttpTool = {
      execute: jest.fn().mockResolvedValue({
        result: { ok: true },
        error: undefined,
        status: 200,
      }),
    };
    mockSetStepLog = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpRequestWorkflowAction,
        { provide: HttpTool, useValue: mockHttpTool },
        {
          provide: WorkflowRunStepLogWorkspaceService,
          useValue: { setStepLog: mockSetStepLog },
        },
        {
          provide: WorkflowExecutionContextService,
          useValue: {
            getActingUserWorkspaceId: jest
              .fn()
              .mockResolvedValue('user-workspace-1'),
          },
        },
      ],
    }).compile();

    action = module.get(HttpRequestWorkflowAction);
  });

  it('resolves variables in the request input and forwards them to the HTTP tool', async () => {
    await action.execute({
      currentStepId: 'step-1',
      steps: [
        buildHttpRequestStep({
          url: 'https://api.example.com/users/{{trigger.id}}',
          method: 'GET',
        }),
      ],
      context: { trigger: { id: '42' } },
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

    expect(mockHttpTool.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users/42',
        method: 'GET',
      }),
      expect.objectContaining({ workspaceId: 'workspace-1' }),
    );
  });

  it('persists an HTTP_REQUEST step log', async () => {
    await action.execute({
      currentStepId: 'step-1',
      steps: [
        buildHttpRequestStep({
          url: 'https://api.example.com/users',
          method: 'POST',
          body: { name: 'John' },
        }),
      ],
      context: {},
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

    expect(mockSetStepLog).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowRunId: 'run-1',
        workspaceId: 'workspace-1',
        stepId: 'step-1',
        stepLog: expect.objectContaining({
          details: expect.objectContaining({ type: 'HTTP_REQUEST' }),
        }),
      }),
    );
  });

  it('throws when the current step is not an HTTP request action', async () => {
    await expect(
      action.execute({
        currentStepId: 'step-1',
        steps: [
          {
            ...buildHttpRequestStep({
              url: 'https://example.com',
              method: 'GET',
            }),
            type: WorkflowActionType.SEND_EMAIL,
          } as WorkflowAction,
        ],
        context: {},
        runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
      }),
    ).rejects.toThrow('Step is not an HTTP request action');

    expect(mockHttpTool.execute).not.toHaveBeenCalled();
  });
});
