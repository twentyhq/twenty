import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';
const STEP_AGENT_ID = 'step-agent-id';
const REUSABLE_AGENT_ID = 'reusable-agent-id';

const buildAgent = ({ id, isSystem }: { id: string; isSystem: boolean }) => ({
  id,
  isSystem,
  label: 'Agent',
  icon: null,
  description: null,
  prompt: 'Help.',
  modelId: 'model-id',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
  roleId: null,
});

const buildStep = (
  input: WorkflowAiAgentAction['settings']['input'],
): WorkflowAiAgentAction =>
  ({
    id: 'step-id',
    name: 'Agent',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    nextStepIds: [],
    settings: {
      input,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  }) as WorkflowAiAgentAction;

const buildService = () => {
  const agentService = {
    createOneAgent: jest.fn().mockResolvedValue({ id: 'copied-agent-id' }),
    deleteManyAgents: jest.fn().mockResolvedValue(undefined),
    findOneAgentById: jest.fn(async ({ id }: { id: string }) => {
      if (id === STEP_AGENT_ID) {
        return buildAgent({ id: STEP_AGENT_ID, isSystem: true });
      }

      if (id === REUSABLE_AGENT_ID) {
        return buildAgent({ id: REUSABLE_AGENT_ID, isSystem: false });
      }

      throw new AiException('Agent not found', AiExceptionCode.AGENT_NOT_FOUND);
    }),
  };
  const aiAgentRoleService = {
    findAgentRoleId: jest.fn().mockResolvedValue('role-id'),
    assignRoleToAgent: jest.fn().mockResolvedValue(undefined),
    deleteAgentOnlyRoleIfUnused: jest.fn().mockResolvedValue(undefined),
  };
  const roleTargetRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 'role-target-id', roleId: 'role-id' }),
  };
  const featureFlagService = {
    isFeatureEnabled: jest.fn().mockResolvedValue(true),
  };

  const service = new WorkflowVersionStepOperationsWorkspaceService(
    {} as never,
    {} as never,
    {} as never,
    agentService as never,
    roleTargetRepository as never,
    {} as never,
    {} as never,
    aiAgentRoleService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    featureFlagService as never,
  );

  return { service, agentService, aiAgentRoleService };
};

describe('WorkflowVersionStepOperationsWorkspaceService AI agent steps', () => {
  it('creates a step that holds its own config and no agent', async () => {
    const { service, agentService } = buildService();

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.AI_AGENT,
      workspaceId: WORKSPACE_ID,
    });

    expect(agentService.createOneAgent).not.toHaveBeenCalled();
    expect(builtStep.settings.input).toEqual({ instructions: '', prompt: '' });
  });

  describe('deleting a step', () => {
    it('deletes the hidden agent a legacy step owns, and its role', async () => {
      const { service, agentService, aiAgentRoleService } = buildService();

      await service.runWorkflowVersionStepDeletionSideEffects({
        step: buildStep({ agentId: STEP_AGENT_ID }),
        workspaceId: WORKSPACE_ID,
      });

      expect(agentService.deleteManyAgents).toHaveBeenCalledWith({
        ids: [STEP_AGENT_ID],
        workspaceId: WORKSPACE_ID,
      });
      expect(aiAgentRoleService.deleteAgentOnlyRoleIfUnused).toHaveBeenCalled();
    });

    it('never deletes a reusable agent the step runs', async () => {
      const { service, agentService } = buildService();

      await service.runWorkflowVersionStepDeletionSideEffects({
        step: buildStep({ agentId: REUSABLE_AGENT_ID }),
        workspaceId: WORKSPACE_ID,
      });

      expect(agentService.deleteManyAgents).not.toHaveBeenCalled();
    });

    it('deletes nothing for a step without an agent', async () => {
      const { service, agentService } = buildService();

      await service.runWorkflowVersionStepDeletionSideEffects({
        step: buildStep({ instructions: 'Qualify.' }),
        workspaceId: WORKSPACE_ID,
      });

      expect(agentService.findOneAgentById).not.toHaveBeenCalled();
      expect(agentService.deleteManyAgents).not.toHaveBeenCalled();
    });

    it('deletes nothing when the agent is already gone', async () => {
      const { service, agentService } = buildService();

      await service.runWorkflowVersionStepDeletionSideEffects({
        step: buildStep({ agentId: 'deleted-agent-id' }),
        workspaceId: WORKSPACE_ID,
      });

      expect(agentService.deleteManyAgents).not.toHaveBeenCalled();
    });
  });

  describe('duplicating a step', () => {
    it('copies the hidden agent of a legacy step', async () => {
      const { service, agentService } = buildService();

      const clonedStep = (await service.cloneStep({
        step: buildStep({ agentId: STEP_AGENT_ID }),
        workspaceId: WORKSPACE_ID,
      })) as WorkflowAiAgentAction;

      expect(agentService.createOneAgent).toHaveBeenCalled();
      expect(clonedStep.settings.input.agentId).toBe('copied-agent-id');
    });

    it('keeps running the same reusable agent', async () => {
      const { service, agentService } = buildService();

      const clonedStep = (await service.cloneStep({
        step: buildStep({ agentId: REUSABLE_AGENT_ID }),
        workspaceId: WORKSPACE_ID,
      })) as WorkflowAiAgentAction;

      expect(agentService.createOneAgent).not.toHaveBeenCalled();
      expect(clonedStep.settings.input.agentId).toBe(REUSABLE_AGENT_ID);
    });

    it('copies the config of a step without an agent', async () => {
      const { service, agentService } = buildService();
      const step = buildStep({ instructions: 'Qualify.', modelId: 'model-id' });

      const clonedStep = (await service.cloneStep({
        step,
        workspaceId: WORKSPACE_ID,
      })) as WorkflowAiAgentAction;

      expect(agentService.createOneAgent).not.toHaveBeenCalled();
      expect(clonedStep.id).not.toBe(step.id);
      expect(clonedStep.settings.input).toEqual(step.settings.input);
    });
  });

  describe('drafting a version', () => {
    it('copies the hidden agent of a legacy step with its role', async () => {
      const { service, aiAgentRoleService } = buildService();

      const draftStep = (await service.createDraftStep({
        step: buildStep({ agentId: STEP_AGENT_ID }),
        workspaceId: WORKSPACE_ID,
      })) as WorkflowAiAgentAction;

      expect(draftStep.settings.input.agentId).toBe('copied-agent-id');
      expect(aiAgentRoleService.assignRoleToAgent).toHaveBeenCalledWith({
        agentId: 'copied-agent-id',
        roleId: 'role-id',
        workspaceId: WORKSPACE_ID,
      });
    });

    it.each([
      ['a reusable agent', { agentId: REUSABLE_AGENT_ID }],
      ['no agent', { instructions: 'Qualify.' }],
    ])('keeps a step running %s as it is', async (_label, input) => {
      const { service, agentService } = buildService();
      const step = buildStep(input);

      await expect(
        service.createDraftStep({ step, workspaceId: WORKSPACE_ID }),
      ).resolves.toBe(step);
      expect(agentService.createOneAgent).not.toHaveBeenCalled();
    });
  });
});
