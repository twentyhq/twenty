import request from 'supertest';
import {
  destroyWorkflowRun,
  getWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type WorkflowAction,
  type WorkflowDelayAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

const client = request(`http://localhost:${APP_PORT}`);

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const DELAY_DURATION_SECONDS = 20;

describe('Parallel branch leaf resume workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let formStepId: string | null = null;
  let delayStepId: string | null = null;
  let sendEmailStepId: string | null = null;
  let createdWorkflowRunId: string | null = null;

  const getSteps = async (): Promise<WorkflowAction[]> => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              id
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.workflowVersion.steps;
  };

  const createStep = async ({
    stepType,
    parentStepId,
  }: {
    stepType: string;
    parentStepId: string;
  }) => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType,
            parentStepId,
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
  };

  const updateStep = async (step: WorkflowAction) => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step,
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: { name: "Parallel Branch Leaf Resume Workflow" }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
              versions {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        variables: { id: createdWorkflowId },
      });

    expect(getWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const updateTriggerResponse = await updateWorkflowVersionTrigger({
      workflowVersionId: createdWorkflowVersionId!,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    expect(updateTriggerResponse.body.errors).toBeUndefined();

    await createStep({ stepType: 'FORM', parentStepId: 'trigger' });

    formStepId =
      (await getSteps()).find((step) => step.type === 'FORM')?.id ?? null;

    expect(formStepId).not.toBeNull();

    await createStep({ stepType: 'DELAY', parentStepId: 'trigger' });

    delayStepId =
      (await getSteps()).find((step) => step.type === 'DELAY')?.id ?? null;

    expect(delayStepId).not.toBeNull();

    await createStep({ stepType: 'SEND_EMAIL', parentStepId: delayStepId! });

    sendEmailStepId =
      (await getSteps()).find((step) => step.type === 'SEND_EMAIL')?.id ?? null;

    expect(sendEmailStepId).not.toBeNull();

    const steps = await getSteps();

    const formStep = steps.find(
      (step): step is WorkflowFormAction => step.id === formStepId,
    );

    expect(formStep).toBeDefined();

    await updateStep({
      ...formStep!,
      settings: {
        ...formStep!.settings,
        input: [
          {
            id: v4(),
            name: 'answer',
            label: 'Answer',
            type: FieldMetadataType.TEXT,
          },
        ],
      },
    });

    const delayStep = steps.find(
      (step): step is WorkflowDelayAction => step.id === delayStepId,
    );

    expect(delayStep).toBeDefined();

    await updateStep({
      ...delayStep!,
      settings: {
        ...delayStep!.settings,
        input: {
          delayType: 'DURATION',
          duration: { seconds: DELAY_DURATION_SECONDS },
        },
      },
    });

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }
  });

  it('keeps the run alive and the delay branch pending when the parallel form leaf is submitted', async () => {
    const steps = await getSteps();
    const [{ trigger, coreWorkflowVersionId }] =
      await global.testDataSource.query(
        `SELECT trigger, "coreWorkflowVersionId" FROM "${schema}"."workflowVersion" WHERE id = $1`,
        [createdWorkflowVersionId],
      );
    const [{ coreWorkflowId }] = await global.testDataSource.query(
      `SELECT "coreWorkflowId" FROM "${schema}".workflow WHERE id = $1`,
      [createdWorkflowId],
    );

    createdWorkflowRunId = v4();

    const state = {
      flow: { trigger, steps },
      stepInfos: {
        trigger: { status: 'NOT_STARTED', result: {} },
        ...Object.fromEntries(
          steps.map((step) => [step.id, { status: 'NOT_STARTED' }]),
        ),
      },
    };

    // Insert the run directly instead of going through runWorkflowVersion, so
    // no start job is enqueued and the manual handle below is the only driver.
    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, position, "enqueuedAt")
       VALUES ($1, 'Parallel branch leaf resume run', $2, $3, $4, $5, 'ENQUEUED', $6, 0, now())`,
      [
        createdWorkflowRunId,
        createdWorkflowId,
        createdWorkflowVersionId,
        coreWorkflowId,
        coreWorkflowVersionId,
        JSON.stringify(state),
      ],
    );

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
    });

    const pendingRun = await getWorkflowRun(createdWorkflowRunId);

    expect(pendingRun?.status).toBe('RUNNING');
    expect(pendingRun?.state?.stepInfos?.[formStepId!]?.status).toBe('PENDING');
    expect(pendingRun?.state?.stepInfos?.[delayStepId!]?.status).toBe(
      'PENDING',
    );
    expect(pendingRun?.state?.stepInfos?.[sendEmailStepId!]?.status).toBe(
      'NOT_STARTED',
    );

    const submitFormResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation SubmitFormStep($input: SubmitFormStepInput!) {
            submitFormStep(input: $input)
          }
        `,
        variables: {
          input: {
            stepId: formStepId,
            workflowRunId: createdWorkflowRunId,
            response: { answer: 'Submitted from integration test' },
          },
        },
      });

    expect(submitFormResponse.body.errors).toBeUndefined();
    expect(submitFormResponse.body.data.submitFormStep).toBe(true);

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
      lastExecutedStepId: formStepId!,
    });

    const runAfterSubmit = await getWorkflowRun(createdWorkflowRunId);

    expect(runAfterSubmit?.status).toBe('RUNNING');
    expect(runAfterSubmit?.state?.stepInfos?.[formStepId!]?.status).toBe(
      'SUCCESS',
    );
    expect(runAfterSubmit?.state?.stepInfos?.[delayStepId!]?.status).toBe(
      'PENDING',
    );
    expect(runAfterSubmit?.state?.stepInfos?.[sendEmailStepId!]?.status).toBe(
      'NOT_STARTED',
    );
  }, 60000);
});
