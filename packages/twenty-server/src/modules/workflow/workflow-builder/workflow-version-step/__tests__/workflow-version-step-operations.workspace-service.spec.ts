import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';

const WORKSPACE_ID = 'workspace-id';

const buildStep = (
  name: string,
  type: WorkflowActionType,
  input: Record<string, unknown>,
): WorkflowAction =>
  ({
    id: 'step-id',
    name,
    type,
    valid: true,
    settings: { input, outputSchema: {} },
  }) as WorkflowAction;

const buildService = () => {
  const agentService = {
    findOneAgentById: jest
      .fn()
      .mockResolvedValue({ id: 'agent-id', label: 'Lead qualifier' }),
  };
  const dependencies = Array.from({ length: 13 }, () => ({}));

  dependencies[3] = agentService;

  return new (WorkflowVersionStepOperationsWorkspaceService as unknown as new (
    ...args: unknown[]
  ) => WorkflowVersionStepOperationsWorkspaceService)(...dependencies);
};

describe('WorkflowVersionStepOperationsWorkspaceService.getRebuiltStepName', () => {
  const builtStep = buildStep('Generate', WorkflowActionType.AI_AGENT, {});

  it.each([
    ['the Generate default', 'Generate', {}],
    ['the hidden agent default', 'Agent', { agentId: 'agent-id' }],
    [
      'the label of the agent it ran',
      'Lead qualifier',
      { agentId: 'agent-id' },
    ],
  ])('names a step named after %s for its new kind', async (_, name, input) => {
    await expect(
      buildService().getRebuiltStepName({
        existingStep: buildStep(name, WorkflowActionType.AI_AGENT, input),
        builtStep,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe('Generate');
  });

  it('keeps a name the user typed', async () => {
    await expect(
      buildService().getRebuiltStepName({
        existingStep: buildStep('Score the lead', WorkflowActionType.AI_AGENT, {
          agentId: 'agent-id',
        }),
        builtStep,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe('Score the lead');
  });

  it('names a step of another type after its new type', async () => {
    await expect(
      buildService().getRebuiltStepName({
        existingStep: buildStep('Score the lead', WorkflowActionType.CODE, {}),
        builtStep,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe('Generate');
  });
});
