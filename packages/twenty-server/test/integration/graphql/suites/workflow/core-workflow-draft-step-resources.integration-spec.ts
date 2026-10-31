import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';

type AiAgentStep = {
  id: string;
  type: string;
  name?: string;
  settings: {
    input: { agentId?: string; instructions?: string; prompt?: string };
    outputSchema?: Record<string, unknown>;
  };
};

describe('Draft creation (e2e)', () => {
  it('keeps the config of an AI agent step in the draft, with no agent to copy', async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Draft Step Resources Test',
    });

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createdAgentStep = await createCoreWorkflowVersionStep<AiAgentStep>({
      coreWorkflowVersionId,
      stepType: 'AI_AGENT',
    });
    const agentStep = {
      ...createdAgentStep,
      settings: {
        ...createdAgentStep.settings,
        input: {
          ...createdAgentStep.settings.input,
          instructions: 'You qualify leads.',
          prompt: 'Qualify the new lead.',
        },
      },
    };

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: agentStep,
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });

    const draft = await createDraftFromCoreWorkflowVersion({
      coreWorkflowId,
      coreWorkflowVersionIdToCopy: coreWorkflowVersionId,
    });

    const { steps } = await findCoreWorkflowVersion<AiAgentStep>({
      coreWorkflowVersionId: draft.id,
    });

    const draftAgentStep = steps?.find((step) => step.id === agentStep.id);

    expect(draftAgentStep?.settings.input).toEqual(agentStep.settings.input);
    expect(draftAgentStep?.settings.input).not.toHaveProperty('agentId');

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });
});

describe('AI agent step duplication and deletion (e2e)', () => {
  it('creates a step that runs a reusable agent, copies a duplicated step, and never copies or deletes the agent', async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'AI Step Duplication Test',
    });
    const { data: agentData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Reusable Step Agent',
        prompt: 'You qualify leads.',
        modelId: TEST_AI_MODEL_ID,
        responseFormat: {
          type: 'json',
          schema: {
            type: 'object',
            properties: { score: { type: 'number' } },
          },
        },
      },
    });
    const reusableAgentId = agentData.createOneAgent.id;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createAiAgentStep = async (
      input: AiAgentStep['settings']['input'],
    ) => {
      const createdStep = await createCoreWorkflowVersionStep<AiAgentStep>({
        coreWorkflowVersionId,
        stepType: 'AI_AGENT',
      });
      const step = {
        ...createdStep,
        settings: { ...createdStep.settings, input },
      };

      await updateCoreWorkflowVersionStep({ coreWorkflowVersionId, step });

      return step;
    };

    const duplicateStep = async (stepId: string) => {
      const { steps: stepsBefore } = await findCoreWorkflowVersion<AiAgentStep>(
        { coreWorkflowVersionId },
      );

      await coreWorkflowGraphqlRequest({
        query: `
          mutation DuplicateCoreWorkflowVersionStep(
            $input: DuplicateCoreWorkflowVersionStepInput!
          ) {
            duplicateCoreWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: { input: { coreWorkflowVersionId, stepId } },
      });

      const { steps } = await findCoreWorkflowVersion<AiAgentStep>({
        coreWorkflowVersionId,
      });

      return steps?.find(
        (step) => !stepsBefore?.some((stepBefore) => stepBefore.id === step.id),
      );
    };

    const inlineStep = await createAiAgentStep({
      instructions: 'You qualify leads.',
      prompt: 'Qualify the new lead.',
    });
    const reusableAgentStep = await createCoreWorkflowVersionStep<AiAgentStep>({
      coreWorkflowVersionId,
      stepType: 'AI_AGENT',
      defaultSettings: { input: { agentId: reusableAgentId } },
    });

    expect(reusableAgentStep.name).toBe('Reusable Step Agent');
    expect(reusableAgentStep.settings.input).toEqual({
      agentId: reusableAgentId,
      prompt: '',
    });
    expect(Object.keys(reusableAgentStep.settings.outputSchema ?? {})).toEqual([
      'score',
    ]);

    for (const step of [inlineStep, reusableAgentStep]) {
      const duplicatedStep = await duplicateStep(step.id);

      expect(duplicatedStep?.settings.input).toEqual(step.settings.input);
    }

    await coreWorkflowGraphqlRequest({
      query: `
        mutation DeleteCoreWorkflowVersionStep(
          $input: DeleteCoreWorkflowVersionStepInput!
        ) {
          deleteCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      variables: {
        input: { coreWorkflowVersionId, stepId: reusableAgentStep.id },
      },
    });

    const { data: foundAgentData } = await findOneAgent({
      expectToFail: false,
      input: { id: reusableAgentId },
      gqlFields: 'id',
    });

    expect(foundAgentData.findOneAgent.id).toBe(reusableAgentId);

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    await deleteOneAgent({
      expectToFail: false,
      input: { id: reusableAgentId },
    });
  });
});
