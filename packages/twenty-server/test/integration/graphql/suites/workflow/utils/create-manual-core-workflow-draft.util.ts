import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

export const createManualCoreWorkflowDraft = async ({
  name,
}: {
  name: string;
}): Promise<{ coreWorkflowId: string; coreWorkflowVersionId: string }> => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
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

  await createCoreWorkflowVersionStep({
    coreWorkflowVersionId,
    stepType: 'FIND_RECORDS',
  });

  return { coreWorkflowId, coreWorkflowVersionId };
};
