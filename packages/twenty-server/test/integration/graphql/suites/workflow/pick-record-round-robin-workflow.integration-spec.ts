import request from 'supertest';
import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { isDefined } from 'twenty-shared/utils';

const client = request(`http://localhost:${APP_PORT}`);

describe('Pick Record Workflow - round robin (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let orderedCandidateRecordIds: string[] = [];

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Pick Record Round Robin Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    const pickRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'PICK_RECORD',
    });

    pickRecordStepId = pickRecordStep.id;

    const companiesResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query Companies {
            companies(first: 3) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });

    const candidateRecordIds = companiesResponse.body.data.companies.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(candidateRecordIds.length).toBe(3);

    // The executor sorts the resolved pool deterministically by id before
    // applying the round-robin cursor, so the expected cycle order is the
    // pool sorted the same way.
    orderedCandidateRecordIds = [...candidateRecordIds].sort(
      (idA: string, idB: string) => idA.localeCompare(idB),
    );

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step: pickRecordStep,
      input: {
        objectName: 'company',
        strategy: 'ROUND_ROBIN',
        recordIds: candidateRecordIds,
      },
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows([coreWorkflowId]);
    }
  });

  it('cycles through the pool in order on consecutive runs', async () => {
    const pickedRecordIds: string[] = [];

    for (let runIndex = 0; runIndex < 4; runIndex++) {
      const workflowRunId = await runCoreWorkflowVersion({
        coreWorkflowVersionId: coreWorkflowVersionId!,
        payload: {},
      });

      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');

      const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
        ?.result as { id: string } | undefined;

      expect(result?.id).toBeDefined();
      pickedRecordIds.push(result!.id);

      await destroyWorkflowRun(workflowRunId);
    }

    expect(pickedRecordIds).toEqual([
      orderedCandidateRecordIds[0],
      orderedCandidateRecordIds[1],
      orderedCandidateRecordIds[2],
      orderedCandidateRecordIds[0],
    ]);
  });
});
