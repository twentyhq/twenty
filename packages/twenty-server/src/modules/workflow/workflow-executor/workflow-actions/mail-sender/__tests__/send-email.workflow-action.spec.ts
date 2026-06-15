import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkflowActionType } from 'twenty-shared/workflow';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { SendEmailWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

jest.mock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
  () => ({
    renderRichTextToHtml: jest.fn().mockResolvedValue('<p>rendered html</p>'),
  }),
);

const { renderRichTextToHtml } = jest.requireMock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
);

const baseSettings: WorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: false },
    continueOnFailure: { value: false },
  },
  input: {},
};

const emailInput = {
  connectedAccountId: 'account-1',
  recipients: { to: 'test@example.com' },
  subject: 'Test',
};

const buildSendEmailStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.SEND_EMAIL,
    name: 'Send Email',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('SendEmailWorkflowAction', () => {
  let action: SendEmailWorkflowAction;
  let mockSendEmailTool: jest.Mocked<Pick<SendEmailTool, 'execute'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSendEmailTool = {
      execute: jest.fn().mockResolvedValue({
        result: { success: true },
        error: undefined,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailWorkflowAction,
        { provide: SendEmailTool, useValue: mockSendEmailTool },
        {
          provide: WorkflowRunStepLogWorkspaceService,
          useValue: { setStepLog: jest.fn() },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
            getRepository: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    action = module.get(SendEmailWorkflowAction);
  });

  const executeWithBody = (body: string | undefined) =>
    action.execute({
      currentStepId: 'step-1',
      steps: [buildSendEmailStep({ ...emailInput, body })],
      context: {
        trigger: {
          name: 'John',
          email: 'john@example.com',
        },
      },
      runInfo: {
        workspaceId: 'workspace-1',
        workflowRunId: 'run-1',
      },
    });

  describe('email body handling', () => {
    it('should render TipTap JSON body to HTML', async () => {
      const tipTapBody = JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      });

      await executeWithBody(tipTapBody);

      expect(renderRichTextToHtml).toHaveBeenCalledWith(JSON.parse(tipTapBody));
      expect(mockSendEmailTool.execute).toHaveBeenCalledWith(
        expect.objectContaining({ body: '<p>rendered html</p>' }),
        expect.any(Object),
      );
    });

    it('should resolve variableTag nodes inside TipTap JSON before rendering', async () => {
      const tipTapBodyWithVariable = JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'variableTag',
                attrs: { variable: '{{trigger.name}}' },
              },
            ],
          },
        ],
      });

      await executeWithBody(tipTapBodyWithVariable);

      expect(renderRichTextToHtml).toHaveBeenCalledWith({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'John' }],
          },
        ],
      });
    });

    it('should pass plain text body through without rendering', async () => {
      await executeWithBody('{{trigger.name}}\n{{trigger.email}}');

      expect(renderRichTextToHtml).not.toHaveBeenCalled();
      expect(mockSendEmailTool.execute).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'John\njohn@example.com' }),
        expect.any(Object),
      );
    });

    it('should treat non-TipTap JSON as plain text', async () => {
      await executeWithBody('{"key":"value"}');

      expect(renderRichTextToHtml).not.toHaveBeenCalled();
      expect(mockSendEmailTool.execute).toHaveBeenCalledWith(
        expect.objectContaining({ body: '{"key":"value"}' }),
        expect.any(Object),
      );
    });

    it('should handle empty string body without crashing', async () => {
      await executeWithBody('');

      expect(renderRichTextToHtml).not.toHaveBeenCalled();
      expect(mockSendEmailTool.execute).toHaveBeenCalled();
    });

    it('should handle undefined body without crashing', async () => {
      await executeWithBody(undefined);

      expect(renderRichTextToHtml).not.toHaveBeenCalled();
      expect(mockSendEmailTool.execute).toHaveBeenCalled();
    });
  });

  describe('step type guard', () => {
    it('throws when the current step is not a send-email action', async () => {
      await expect(
        action.execute({
          currentStepId: 'step-1',
          steps: [
            {
              ...buildSendEmailStep({ ...emailInput, body: 'hi' }),
              type: WorkflowActionType.DRAFT_EMAIL,
            } as WorkflowAction,
          ],
          context: {},
          runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
        }),
      ).rejects.toThrow('Step is not a send-email action');

      expect(mockSendEmailTool.execute).not.toHaveBeenCalled();
    });
  });
});
