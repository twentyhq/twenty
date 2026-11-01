import request from 'supertest';
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

const client = request(`http://localhost:${APP_PORT}`);

describe('Pick Record Workflow (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let candidateRecordIds: string[] = [];

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Pick Record Test Workflow',
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

    for (const name of ['Pick Record Company A', 'Pick Record Company B']) {
      const companyResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation CreateCompany($name: String!) {
              createCompany(data: { name: $name }) {
                id
              }
            }
          `,
          variables: { name },
        });

      expect(companyResponse.body.errors).toBeUndefined();
      candidateRecordIds.push(companyResponse.body.data.createCompany.id);
    }

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...pickRecordStep,
        settings: {
          ...pickRecordStep.settings,
          input: {
            objectName: 'company',
            strategy: 'RANDOM',
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

    for (const id of candidateRecordIds) {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyCompany($id: ID!) {
              destroyCompany(id: $id) {
                id
              }
            }
          `,
          variables: { id },
        });

      expect(response.body.errors).toBeUndefined();
    }
  });

  const pickRecordOnce = async (): Promise<{ id: string }> => {
    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersionId!,
      payload: {},
    });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(workflowRun?.state?.stepInfos?.[pickRecordStepId!]?.status).toBe(
      'SUCCESS',
    );

    const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
      ?.result as { id: string } | undefined;

    await destroyWorkflowRun(workflowRunId);

    expect(result?.id).toBeDefined();

    return result!;
  };

  it('picks a record and exposes it as the step output', async () => {
    const pickedRecord = await pickRecordOnce();

    expect(candidateRecordIds).toContain(pickedRecord.id);
  });

  it('only ever picks records from the configured pool', async () => {
    for (let runIndex = 0; runIndex < 5; runIndex++) {
      const pickedRecord = await pickRecordOnce();

      expect(candidateRecordIds).toContain(pickedRecord.id);
    }
  });
});
