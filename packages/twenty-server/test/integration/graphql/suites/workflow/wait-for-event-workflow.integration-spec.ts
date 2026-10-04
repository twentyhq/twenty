import request from 'supertest';
import {
  destroyWorkflowRun,
  getWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 } from 'uuid';

import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type WorkflowAction,
  type WorkflowWaitForEventAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowStepWaitDatabaseEventListener } from 'src/modules/workflow/workflow-wait/listeners/workflow-step-wait-database-event.listener';
import { type WorkflowStepWaitResolverWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait-resolver.workspace-service';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';

const client = request(`http://localhost:${APP_PORT}`);

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const buildCompanyUpdatedBatch = async (companyId: string) => ({
  name: 'company.updated',
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  objectMetadata: (
    await getAppProviderByClassName<WorkflowCommonWorkspaceService>(
      'WorkflowCommonWorkspaceService',
    ).getObjectMetadataInfo('company', SEED_APPLE_WORKSPACE_ID)
  ).flatObjectMetadata,
  events: [
    {
      recordId: companyId,
      properties: {
        before: { id: companyId, name: 'Before' },
        after: { id: companyId, name: 'After' },
        updatedFields: ['name'],
        diff: { name: { before: 'Before', after: 'After' } },
      },
    },
  ],
});

describe('Wait for event workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let createdWorkflowRunId: string | null = null;
  let waitStepId: string | null = null;
  let watchedCompanyId: string | null = null;
  let otherCompanyId: string | null = null;

  const getSteps = async (): Promise<WorkflowAction[]> => {
    const response = await graphql(
      `
        query GetWorkflowVersion($id: UUID!) {
          workflowVersion(filter: { id: { eq: $id } }) {
            steps
          }
        }
      `,
      { id: createdWorkflowVersionId },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.workflowVersion.steps;
  };

  const createCompany = async (name: string): Promise<string> => {
    const response = await graphql(
      `
        mutation CreateCompany($data: CompanyCreateInput!) {
          createCompany(data: $data) {
            id
          }
        }
      `,
      { data: { name } },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createCompany.id;
  };

  beforeAll(async () => {
    watchedCompanyId = await createCompany('Wait For Event Watched Co');
    otherCompanyId = await createCompany('Wait For Event Other Co');

    const createWorkflowResponse = await graphql(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "Wait For Event Workflow" }) {
          id
        }
      }
    `);

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
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
      { id: createdWorkflowId },
    );

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

    const createStepResponse = await graphql(
      `
        mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          stepType: 'WAIT_FOR_EVENT',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();

    const waitStep = (await getSteps()).find(
      (step): step is WorkflowWaitForEventAction =>
        step.type === 'WAIT_FOR_EVENT',
    );

    expect(waitStep).toBeDefined();
    waitStepId = waitStep!.id;

    const updateStepResponse = await graphql(
      `
        mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          step: {
            ...waitStep!,
            settings: {
              ...waitStep!.settings,
              input: {
                eventName: 'company.updated',
                recordId: watchedCompanyId,
                timeout: null,
              },
            },
          },
        },
      },
    );

    expect(updateStepResponse.body.errors).toBeUndefined();

    const activateResponse = await graphql(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: createdWorkflowVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (createdWorkflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: createdWorkflowId },
      );
    }

    for (const companyId of [watchedCompanyId, otherCompanyId]) {
      if (companyId) {
        await graphql(
          `
            mutation DestroyCompany($id: UUID!) {
              destroyCompany(id: $id) {
                id
              }
            }
          `,
          { id: companyId },
        );
      }
    }
  });

  it('pauses on the event and resumes with the record once it happens', async () => {
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

    // Inserted directly so no start job is enqueued and the test drives the run
    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, position, "enqueuedAt")
       VALUES ($1, 'Wait for event run', $2, $3, $4, $5, 'ENQUEUED', $6, 0, now())`,
      [
        createdWorkflowRunId,
        createdWorkflowId,
        createdWorkflowVersionId,
        coreWorkflowId,
        coreWorkflowVersionId,
        JSON.stringify(state),
      ],
    );
    await getAppProviderByClassName<WorkflowRunRecordShareService>(
      'WorkflowRunRecordShareService',
    ).syncRuns({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunIds: [createdWorkflowRunId],
    });

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
    });

    const pendingRun = await getWorkflowRun(createdWorkflowRunId);

    expect(pendingRun?.status).toBe('RUNNING');
    expect(pendingRun?.state?.stepInfos?.[waitStepId!]).toMatchObject({
      status: 'PENDING',
      wait: {
        type: 'EVENT',
        eventName: 'company.updated',
        recordId: watchedCompanyId,
      },
    });

    const storedWaits = await global.testDataSource.query(
      `SELECT id, "eventName" FROM core."workflowStepWait" WHERE "workflowRunId" = $1`,
      [createdWorkflowRunId],
    );

    expect(storedWaits).toEqual([
      { id: expect.any(String), eventName: 'company.updated' },
    ]);

    const listener =
      getAppProviderByClassName<WorkflowStepWaitDatabaseEventListener>(
        'WorkflowStepWaitDatabaseEventListener',
      );
    const listenerQueue = (
      listener as unknown as { messageQueueService: MessageQueueService }
    ).messageQueueService;
    const addSpy = jest.spyOn(listenerQueue, 'add').mockResolvedValue();

    await listener.handleObjectRecordUpdateEvent(
      (await buildCompanyUpdatedBatch(otherCompanyId!)) as never,
    );

    expect(addSpy).not.toHaveBeenCalled();

    await listener.handleObjectRecordUpdateEvent(
      (await buildCompanyUpdatedBatch(watchedCompanyId!)) as never,
    );

    expect(addSpy).toHaveBeenCalledTimes(1);

    const [, jobData] = addSpy.mock.calls[0] as [
      string,
      ResumeWaitingWorkflowStepJobData,
    ];

    addSpy.mockRestore();

    await getAppProviderByClassName<WorkflowStepWaitResolverWorkspaceService>(
      'WorkflowStepWaitResolverWorkspaceService',
    ).resolve(jobData);

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
      lastExecutedStepId: waitStepId!,
    });

    const completedRun = await getWorkflowRun(createdWorkflowRunId);

    expect(completedRun?.status).toBe('COMPLETED');
    expect(completedRun?.state?.stepInfos?.[waitStepId!]).toMatchObject({
      status: 'SUCCESS',
      result: {
        hasTimedOut: false,
        eventName: 'company.updated',
        recordId: watchedCompanyId,
        record: { name: 'After' },
        updatedFields: ['name'],
      },
    });

    const remainingWaits = await global.testDataSource.query(
      `SELECT id FROM core."workflowStepWait" WHERE "workflowRunId" = $1`,
      [createdWorkflowRunId],
    );

    expect(remainingWaits).toEqual([]);
  }, 60000);
});
