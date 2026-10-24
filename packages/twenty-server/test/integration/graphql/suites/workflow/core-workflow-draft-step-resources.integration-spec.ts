import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

type AiAgentStep = {
  id: string;
  type: string;
  settings: { input: { agentId: string } };
};

describe('Draft creation (e2e)', () => {
  it('gives AI agent steps their own copy of the agent', async () => {
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

    const agentStep = await createCoreWorkflowVersionStep<AiAgentStep>({
      coreWorkflowVersionId,
      stepType: 'AI_AGENT',
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });

    const draft = await createDraftFromCoreWorkflowVersion({
      coreWorkflowId,
      coreWorkflowVersionIdToCopy: coreWorkflowVersionId,
    });

    const { steps } = await findCoreWorkflowVersion<AiAgentStep>({
      coreWorkflowVersionId: draft.id,
    });

    const draftAgentId = steps?.find((step) => step.id === agentStep.id)
      ?.settings.input.agentId;

    expect(draftAgentId).toBeDefined();
    expect(draftAgentId).not.toBe(agentStep.settings.input.agentId);

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });
});
