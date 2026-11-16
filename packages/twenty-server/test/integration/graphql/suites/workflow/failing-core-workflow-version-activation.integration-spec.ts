import { activateCoreWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/activate-core-workflow-version.util';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { isDefined } from 'twenty-shared/utils';

// Fixed because the refusal message names the iterator id, and it is snapshotted
const ITERATOR_STEP_ID = '7d3c9a52-4f1e-4b8a-9c6d-2e5f8a1b3c47';

type IteratorStep = {
  id: string;
  type: string;
  settings: { input: { initialLoopStepIds: string[] } };
};

describe('Core workflow version activation should fail', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Failing core workflow version activation',
    }));

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

    const iteratorStep = await createCoreWorkflowVersionStep<IteratorStep>({
      coreWorkflowVersionId,
      stepType: 'ITERATOR',
      id: ITERATOR_STEP_ID,
    });

    const [loopStepId] = iteratorStep.settings.input.initialLoopStepIds;
    const { steps } = await findCoreWorkflowVersion({ coreWorkflowVersionId });
    const loopStep = steps?.find((step) => step.id === loopStepId);

    if (!isDefined(loopStep)) {
      throw new Error('The iterator was created without a loop step');
    }

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: { ...loopStep, nextStepIds: [] },
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('should refuse a loop whose last step does not return to the iterator', async () => {
    const { errors } = await activateCoreWorkflowVersion({
      input: { coreWorkflowVersionId },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should leave the refused version as a draft', async () => {
    const { status } = await findCoreWorkflowVersion({ coreWorkflowVersionId });

    expect(status).toBe('DRAFT');
  });
});
