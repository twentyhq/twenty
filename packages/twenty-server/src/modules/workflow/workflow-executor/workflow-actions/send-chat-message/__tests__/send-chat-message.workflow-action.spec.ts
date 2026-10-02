import { WorkflowActionType } from 'twenty-shared/workflow';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { createMockIteratorStep } from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { SendChatMessageWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/send-chat-message.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const WORKFLOW_ID = 'workflow-id';
const WORKSPACE_MEMBER_ID = '20202020-2222-4222-8222-222222222222';
const COMPANY_ID = '20202020-3333-4333-8333-333333333333';

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
  const findWorkflowRun = jest.fn();
  const findCoreWorkflowById = jest.fn();
  const getExecutionContext = jest.fn();
  const setStepThreadId = jest.fn();
  const findCatalogEntry = jest.fn();
  const resolveAndExecute = jest.fn();
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
    findWorkflowRun.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      coreWorkflowId: WORKFLOW_ID,
    });
    findCoreWorkflowById.mockResolvedValue({
      id: WORKFLOW_ID,
      name: 'New deals',
    });
    getExecutionContext.mockResolvedValue({
      authContext: { type: 'system' },
      rolePermissionConfig: { unionOf: ['role-id'] },
      application: null,
    });
    findCatalogEntry.mockResolvedValue({
      name: 'update_one_company',
      label: 'Update Company',
      description: '',
      category: 'DATABASE_CRUD',
      executionRef: {
        kind: 'database_crud',
        objectNameSingular: 'company',
        operation: 'update_one',
      },
    });
    resolveAndExecute.mockResolvedValue({
      success: true,
      message: 'Found 1 company records',
      result: { records: [{ employees: 10 }] },
    });

    action = new SendChatMessageWorkflowAction(
      { sendMessage } as unknown as AgentInboxService,
      {
        executeInWorkspaceContext: jest.fn((callback) => callback()),
        getRepository: jest.fn().mockReturnValue({ findOne: findWorkflowRun }),
      } as unknown as WorkspaceOrmManager,
      { findCoreWorkflowById } as unknown as WorkflowCoreSyncService,
      { getExecutionContext } as unknown as WorkflowExecutionContextService,
      { setStepThreadId } as unknown as WorkflowRunWorkspaceService,
      {
        findCatalogEntry,
        resolveAndExecute,
      } as unknown as ToolRegistryService,
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

  it('posts a tool call for approval and waits on the member', async () => {
    const output = await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      title: 'Headcount check',
      text: 'Update the headcount of {{trigger.name}}?',
      toolCall: {
        toolName: 'update_one_company',
        arguments: { id: COMPANY_ID, employees: 25 },
      },
    });

    expect(output).toEqual({ pendingEvent: true });
    expect(resolveAndExecute).toHaveBeenCalledWith(
      'find_one_company',
      { id: COMPANY_ID, select: ['employees'] },
      expect.objectContaining({
        rolePermissionConfig: { unionOf: ['role-id'] },
      }),
    );
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        awaitingToolCall: {
          toolName: 'propose_tool_call',
          input: {
            toolName: 'update_one_company',
            arguments: { id: COMPANY_ID, employees: 25 },
            summary: 'Update the headcount of Acme?',
          },
          output: expect.objectContaining({
            result: expect.objectContaining({
              status: 'pending',
              proposal: expect.objectContaining({
                template: 'recordUpdate',
                recordId: COMPANY_ID,
                currentValues: { employees: 10 },
              }),
            }),
            workflowStep: { workflowRunId: WORKFLOW_RUN_ID, stepId: 'step-1' },
          }),
        },
      }),
    );
    expect(setStepThreadId).toHaveBeenCalledWith({
      stepId: 'step-1',
      threadId: 'thread-id',
      workflowRunId: WORKFLOW_RUN_ID,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('fails the step when its tool call cannot be proposed', async () => {
    findCatalogEntry.mockResolvedValue(undefined);

    await expect(
      execute({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        title: '',
        text: 'Hello',
        toolCall: { toolName: 'drop_everything', arguments: {} },
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
