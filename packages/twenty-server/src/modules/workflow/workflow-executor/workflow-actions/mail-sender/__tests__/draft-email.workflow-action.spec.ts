import { Test, type TestingModule } from '@nestjs/testing';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { DraftEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/draft-email.workflow-action';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

jest.mock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
  () => ({
    renderRichTextToHtml: jest.fn().mockResolvedValue('<p>rendered html</p>'),
  }),
);

const baseSettings: WorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: false },
    continueOnFailure: { value: false },
  },
  input: {},
};

const buildDraftEmailStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.DRAFT_EMAIL,
    name: 'Draft Email',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('DraftEmailWorkflowAction', () => {
  let action: DraftEmailWorkflowAction;
  let mockDraftEmailTool: jest.Mocked<Pick<DraftEmailTool, 'execute'>>;
  let mockSetStepLog: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDraftEmailTool = {
      execute: jest.fn().mockResolvedValue({
        result: { success: true },
        error: undefined,
      }),
    };
    mockSetStepLog = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DraftEmailWorkflowAction,
        { provide: DraftEmailTool, useValue: mockDraftEmailTool },
        {
          provide: WorkflowRunStepLogWorkspaceService,
          useValue: { setStepLog: mockSetStepLog },
        },
      ],
    }).compile();

    action = module.get(DraftEmailWorkflowAction);
  });

  it('runs the draft email tool and resolves variables in the body', async () => {
    await action.execute({
      currentStepId: 'step-1',
      steps: [
        buildDraftEmailStep({
          connectedAccountId: 'account-1',
          recipients: { to: 'test@example.com' },
          subject: 'Draft Test',
          body: '{{trigger.name}}',
        }),
      ],
      context: { trigger: { name: 'John' } },
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

    expect(mockDraftEmailTool.execute).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'John' }),
      expect.objectContaining({ workspaceId: 'workspace-1' }),
    );
  });

  it('persists a step log tagged with the DRAFT mode', async () => {
    await action.execute({
      currentStepId: 'step-1',
      steps: [
        buildDraftEmailStep({
          connectedAccountId: 'account-1',
          recipients: { to: 'test@example.com' },
          subject: 'Draft Test',
          body: 'hello',
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
          details: expect.objectContaining({
            type: 'EMAIL',
            mode: 'DRAFT',
          }),
        }),
      }),
    );
  });

  it('throws when the current step is not a draft-email action', async () => {
    await expect(
      action.execute({
        currentStepId: 'step-1',
        steps: [
          {
            ...buildDraftEmailStep({
              connectedAccountId: 'account-1',
              recipients: { to: 'test@example.com' },
              subject: 'Wrong type',
            }),
            type: WorkflowActionType.SEND_EMAIL,
          } as WorkflowAction,
        ],
        context: {},
        runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
      }),
    ).rejects.toThrow('Step is not a draft-email action');

    expect(mockDraftEmailTool.execute).not.toHaveBeenCalled();
  });
});
