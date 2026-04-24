import { Test, type TestingModule } from '@nestjs/testing';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { ToolExecutorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-executor-workflow-action';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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

const buildEmailStep = (
  type: 'SEND_EMAIL' | 'DRAFT_EMAIL',
  input: Record<string, unknown>,
): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType[type],
    name: type === 'SEND_EMAIL' ? 'Send Email' : 'Draft Email',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('ToolExecutorWorkflowAction', () => {
  let action: ToolExecutorWorkflowAction;
  let mockSendEmailTool: jest.Mocked<Pick<SendEmailTool, 'execute'>>;
  let mockDraftEmailTool: jest.Mocked<Pick<DraftEmailTool, 'execute'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const toolResult = {
      result: { success: true },
      error: undefined,
    };

    mockSendEmailTool = { execute: jest.fn().mockResolvedValue(toolResult) };
    mockDraftEmailTool = { execute: jest.fn().mockResolvedValue(toolResult) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolExecutorWorkflowAction,
        { provide: HttpTool, useValue: { execute: jest.fn() } },
        { provide: SendEmailTool, useValue: mockSendEmailTool },
        { provide: DraftEmailTool, useValue: mockDraftEmailTool },
      ],
    }).compile();

    action = module.get(ToolExecutorWorkflowAction);
  });

  const executeWithBody = (
    body: string | undefined,
    type: 'SEND_EMAIL' | 'DRAFT_EMAIL' = 'SEND_EMAIL',
  ) =>
    action.execute({
      currentStepId: 'step-1',
      steps: [buildEmailStep(type, { ...emailInput, body })],
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

    it('should apply the same body handling for DRAFT_EMAIL', async () => {
      await executeWithBody('{{trigger.name}}', 'DRAFT_EMAIL');

      expect(renderRichTextToHtml).not.toHaveBeenCalled();
      expect(mockDraftEmailTool.execute).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'John' }),
        expect.any(Object),
      );
    });
  });
});
