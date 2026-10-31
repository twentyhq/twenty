import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

type AiAgentStep = {
  id: string;
  type: string;
  settings: {
    input: { agentId?: string; instructions?: string; prompt?: string };
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
