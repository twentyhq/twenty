import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { createMockIteratorStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const WORKFLOW_ID = 'workflow-id';
const WORKSPACE_MEMBER_ID = '20202020-2222-4222-8222-222222222222';

const buildStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.SEND_CHAT_MESSAGE,
    name: 'Send Chat Message',
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
  const findWorkflow = jest.fn();
  const isFeatureEnabled = jest.fn();
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
    sendMessage.mockResolvedValue({ threadId: 'thread-id' });
    findWorkflow.mockResolvedValue({ id: WORKFLOW_ID, name: 'New deals' });
    isFeatureEnabled.mockResolvedValue(true);

    action = new SendChatMessageWorkflowAction(
      { sendMessage } as unknown as AgentInboxService,
      {
        getWorkflowRunOrFail: jest
          .fn()
          .mockResolvedValue({ id: WORKFLOW_RUN_ID, workflowId: WORKFLOW_ID }),
      } as unknown as WorkflowRunWorkspaceService,
      {
        executeInWorkspaceContext: jest.fn((callback) => callback()),
        getRepository: jest.fn().mockReturnValue({ findOne: findWorkflow }),
      } as unknown as WorkspaceOrmManager,
      { isFeatureEnabled } as unknown as FeatureFlagService,
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
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        threadKey: WORKFLOW_RUN_ID,
        idempotencyKey: 'step-1',
        title: 'New deal: Acme',
        text: '**Acme** just signed.',
      },
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
      ([{ input: sentInput }]) => sentInput.idempotencyKey,
    );

    expect(idempotencyKeys).toEqual([
      'step-1:iterator=0',
      'step-1:iterator=0',
      'step-1:iterator=1',
    ]);
  });

  it('titles the conversation with the step name when no title is set', async () => {
    await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: '',
      text: 'Hello',
    });

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ title: 'Send Chat Message' }),
      }),
    );
  });

  it('fails the step while the feature flag is off', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    await expect(
      execute({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        title: '',
        text: 'Hello',
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
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
