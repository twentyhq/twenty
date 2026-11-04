import { WorkflowActionType } from 'twenty-shared/workflow';

import { type AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { type AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { AiAgentWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/ai-agent.workflow-action';
import { type WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { type WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';

const executeWithInput = async (input: Record<string, unknown>) => {
  const agentRunnerService = { start: jest.fn() };
  const action = new AiAgentWorkflowAction(
    agentRunnerService as unknown as AgentRunnerService,
    {
      getExecutionContext: jest.fn().mockResolvedValue({
        application: { id: 'application-id' },
        authContext: { type: 'api-key' },
      }),
      assertRunApplicationCanTriggerStepTargetOrThrow: jest.fn(),
    } as unknown as WorkflowExecutionContextService,
    {
      setAiAgentStepLog: jest.fn(),
    } as unknown as WorkflowRunStepLogWorkspaceService,
    {
      openConversation: jest.fn().mockResolvedValue({ threadId: 'thread-id' }),
    } as unknown as WorkflowAgentConversationWorkspaceService,
    {
      resolveOrThrow: jest
        .fn()
        .mockResolvedValue({ applicationId: 'application-id', modelId: 'm' }),
    } as unknown as AgentRunPersonaService,
  );

  const execution = action.execute({
    currentStepId: 'step-id',
    steps: [
      {
        id: 'step-id',
        name: 'Summarize',
        type: WorkflowActionType.AI_AGENT,
        valid: true,
        settings: {
          input,
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: 0 },
          },
        },
        nextStepIds: [],
      },
    ] as never,
    context: { trigger: { note: '   ' } },
    runInfo: { workflowRunId: 'run-id', workspaceId: 'workspace-id' },
  });

  return { execution, agentRunnerService };
};

describe('AiAgentWorkflowAction', () => {
  it.each([
    ['no prompt', {}],
    ['a blank prompt', { prompt: '  ' }],
    ['a prompt resolving to blank', { prompt: '{{trigger.note}}' }],
  ])('fails a Generate step with %s', async (_, input) => {
    const { execution, agentRunnerService } = await executeWithInput(input);

    await expect(execution).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
    expect(agentRunnerService.start).not.toHaveBeenCalled();
  });

  it('starts a Generate step that has a prompt', async () => {
    const { execution, agentRunnerService } = await executeWithInput({
      prompt: 'Summarize the deal',
    });

    await expect(execution).resolves.toEqual({ wait: { type: 'CALLBACK' } });
    expect(agentRunnerService.start).toHaveBeenCalledTimes(1);
  });

  it('starts an Agent step without a prompt', async () => {
    const { execution, agentRunnerService } = await executeWithInput({
      agentId: '20202020-0000-4000-8000-000000000001',
    });

    await expect(execution).resolves.toEqual({ wait: { type: 'CALLBACK' } });
    expect(agentRunnerService.start).toHaveBeenCalledTimes(1);
    expect(agentRunnerService.start).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: null }),
    );
  });
});
