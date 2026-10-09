import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';
import { createMockIteratorStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const WORKFLOW_ID = 'workflow-id';
const WORKSPACE_MEMBER_ID = '20202020-2222-4222-8222-222222222222';

const buildStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.SEND_CHAT_MESSAGE,
    name: 'Send to Inbox',
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input,
    },
  }) as WorkflowAction;

describe('SendChatMessageWorkflowAction', () => {
  const sendMessage = jest.fn();
  const findWorkflowRun = jest.fn();
  const findCoreWorkflowById = jest.fn();
  const armStepWait = jest.fn();
  let action: SendChatMessageWorkflowAction;

  const execute = (input: Record<string, unknown>) =>
    action.execute({
      currentStepId: 'step-1',
      steps: [buildStep(input)],
      context: { trigger: { ownerId: WORKSPACE_MEMBER_ID, name: 'Acme' } },
      runInfo: { workflowRunId: WORKFLOW_RUN_ID, workspaceId: WORKSPACE_ID },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    sendMessage.mockResolvedValue({
      status: 'DELIVERED',
      threadId: 'thread-id',
    });
    findWorkflowRun.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      coreWorkflowId: WORKFLOW_ID,
    });
    findCoreWorkflowById.mockResolvedValue({
      id: WORKFLOW_ID,
      name: 'New deals',
    });

    action = new SendChatMessageWorkflowAction(
      { sendMessage } as unknown as AgentCallerConversationService,
      new WorkflowRunInboxSenderWorkspaceService(
        {
          executeInWorkspaceContext: jest.fn((callback) => callback()),
          getRepository: jest
            .fn()
            .mockReturnValue({ findOne: findWorkflowRun }),
        } as unknown as WorkspaceOrmManager,
        { findCoreWorkflowById } as unknown as WorkflowCoreSyncService,
      ),
      { arm: armStepWait } as unknown as WorkflowStepWaitWorkspaceService,
    );
  });

  it('posts the resolved message in the run conversation of the member', async () => {
    const output = await execute({
      workspaceMemberId: '{{trigger.ownerId}}',
      title: 'New deal: {{trigger.name}}',
      text: '**{{trigger.name}}** just signed.',
    });

    expect(output).toEqual({ result: { threadId: 'thread-id' } });
    expect(sendMessage).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      sender: {
        type: 'workflow',
        workflowId: WORKFLOW_ID,
        workflowName: 'New deals',
      },
      message: {
        workspaceMemberIds: [WORKSPACE_MEMBER_ID],
        threadKey: WORKFLOW_RUN_ID,
        idempotencyKey: 'step-1',
        title: 'New deal: Acme',
        text: '**Acme** just signed.',
      },
      fallbackThreadKey: `${WORKFLOW_RUN_ID}:${WORKFLOW_RUN_ID}:step-1`,
      awaitedToolCall: undefined,
    });
  });

  it('waits on the answer to the call it posted', async () => {
    sendMessage.mockResolvedValue({
      status: 'AWAITING',
      threadId: 'thread-id',
      toolCallId: 'call-id',
    });

    const output = await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      text: 'Approve the update?',
      toolCall: { toolName: 'update_one_company', arguments: { id: 'id' } },
    });

    expect(output).toEqual({
      wait: { type: 'ANSWER', threadId: 'thread-id', toolCallId: 'call-id' },
    });
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        awaitedToolCall: {
          toolName: 'update_one_company',
          arguments: { id: 'id' },
          caller: {
            type: 'WORKFLOW_STEP',
            ref: { workflowRunId: WORKFLOW_RUN_ID, stepId: 'step-1' },
          },
          waitOnAnswer: expect.any(Function),
        },
      }),
    );
  });

  it('waits on the answer as the call is posted, before it can be answered', async () => {
    sendMessage.mockImplementation(async ({ awaitedToolCall }) => {
      await awaitedToolCall.waitOnAnswer({
        threadId: 'thread-id',
        toolCallId: 'call-id',
      });

      return {
        status: 'AWAITING',
        threadId: 'thread-id',
        toolCallId: 'call-id',
      };
    });

    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      text: 'Approve the update?',
      toolCall: { toolName: 'update_one_company', arguments: { id: 'id' } },
    });

    expect(armStepWait).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      stepId: 'step-1',
      wait: { type: 'ANSWER', threadId: 'thread-id', toolCallId: 'call-id' },
    });
  });

  it('sends each iteration once, even when two iterations say the same thing', async () => {
    const input = {
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: 'Daily digest',
      text: 'Same message every time',
    };
    const steps = [
      createMockIteratorStep('iterator', [], ['step-1']),
      { ...buildStep(input), nextStepIds: ['iterator'] } as WorkflowAction,
    ];
    const runIteration = (currentItemIndex: number) =>
      action.execute({
        currentStepId: 'step-1',
        steps,
        context: {
          iterator: { currentItemIndex, hasProcessedAllItems: false },
        },
        runInfo: { workflowRunId: WORKFLOW_RUN_ID, workspaceId: WORKSPACE_ID },
      });

    await runIteration(0);
    await runIteration(0);
    await runIteration(1);

    const idempotencyKeys = sendMessage.mock.calls.map(
      ([{ message }]) => message.idempotencyKey,
    );

    expect(idempotencyKeys).toEqual([
      'step-1:iterator=0',
      'step-1:iterator=0',
      'step-1:iterator=1',
    ]);
  });

  it('starts a new conversation each time the step runs when asked to', async () => {
    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: 'Hello',
      text: 'Hello',
      conversation: { scope: 'STEP' },
    });

    expect(sendMessage.mock.calls[0][0].message).toMatchObject({
      threadKey: `${WORKFLOW_RUN_ID}:step-1`,
      idempotencyKey: 'step-1',
    });
  });

  it('shares a conversation by its resolved key, keeping each run its own messages', async () => {
    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: 'Hello',
      text: 'Hello',
      conversation: { scope: 'KEY', key: 'deal-{{trigger.name}}' },
    });

    expect(sendMessage.mock.calls[0][0].message).toMatchObject({
      threadKey: 'key:deal-Acme',
      idempotencyKey: `${WORKFLOW_RUN_ID}:step-1`,
    });
  });

  it("falls back to the run's own conversation when the recipient cannot join the shared one", async () => {
    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: 'Hello',
      text: 'Hello',
      conversation: { scope: 'KEY', key: 'deal-{{trigger.name}}' },
    });

    expect(sendMessage.mock.calls[0][0].fallbackThreadKey).toBe(
      `key:deal-Acme:${WORKFLOW_RUN_ID}:step-1`,
    );
  });

  it('refuses a shared conversation without a key', async () => {
    await expect(
      execute({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        title: 'Hello',
        text: 'Hello',
        conversation: { scope: 'KEY', key: '' },
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('titles the conversation with the step name when no title is set', async () => {
    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: '',
      text: 'Hello',
    });

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({ title: 'Send to Inbox' }),
      }),
    );
  });

  it('fails the step when the run has no core workflow', async () => {
    findWorkflowRun.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      coreWorkflowId: null,
    });

    await expect(
      execute({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        title: '',
        text: 'Hello',
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it.each([
    ['no recipient', { workspaceMemberId: '', title: '', text: 'Hello' }],
    [
      'no text',
      { workspaceMemberId: WORKSPACE_MEMBER_ID, title: '', text: '' },
    ],
  ])('fails the step with %s', async (_, input) => {
    await expect(execute(input)).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
