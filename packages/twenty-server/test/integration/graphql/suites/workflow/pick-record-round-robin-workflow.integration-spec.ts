import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

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
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const pickRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'PICK_RECORD',
    });

    pickRecordStepId = pickRecordStep.id;

    const candidateRecordIds = [randomUUID(), randomUUID(), randomUUID()];

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: candidateRecordIds.map((id, index) => ({
          id,
          name: `Round robin candidate ${index + 1}`,
        })),
      }),
    );

    // The executor sorts the resolved pool deterministically by id before
    // applying the round-robin cursor, so the expected cycle order is the
    // pool sorted the same way.
    orderedCandidateRecordIds = [...candidateRecordIds].sort(
      (idA: string, idB: string) => idA.localeCompare(idB),
    );

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...pickRecordStep,
        settings: {
          ...pickRecordStep.settings,
          input: {
            objectName: 'company',
            strategy: 'ROUND_ROBIN',
            recordIds: candidateRecordIds,
          },
        },
      },
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }

    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: orderedCandidateRecordIds } },
      }),
    );
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
