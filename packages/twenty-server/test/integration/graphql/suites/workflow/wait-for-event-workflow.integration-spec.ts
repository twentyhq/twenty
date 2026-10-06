import request from 'supertest';
import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersionById,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import {
  destroyWorkflowRun,
  getWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type PendingWakeUpDatabaseEventListener } from 'src/engine/core-modules/pending-wake-up/listeners/pending-wake-up-database-event.listener';
import { type PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { type PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

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
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let createdWorkflowRunId: string | null = null;
  let waitStepId: string | null = null;
  let watchedCompanyId: string | null = null;
  let otherCompanyId: string | null = null;

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

    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Wait For Event Workflow',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    const waitStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'WAIT_FOR_EVENT',
    });

    waitStepId = waitStep.id;

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step: waitStep,
      input: {
        eventName: 'company.updated',
        recordId: watchedCompanyId,
        timeout: null,
      },
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows([coreWorkflowId]);
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
    const coreWorkflowVersion = await findCoreWorkflowVersionById(
      coreWorkflowVersionId!,
    );
    const steps = coreWorkflowVersion?.steps ?? [];

    createdWorkflowRunId = v4();

    const state = {
      flow: { trigger: coreWorkflowVersion?.trigger, steps },
      stepInfos: {
        trigger: { status: 'NOT_STARTED', result: {} },
        ...Object.fromEntries(
          steps.map((step) => [step.id, { status: 'NOT_STARTED' }]),
        ),
      },
    };

    // Inserted directly so no start job is enqueued and the test drives the run
    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, state, position, "enqueuedAt")
       VALUES ($1, 'Wait for event run', $2, $3, 'ENQUEUED', $4, 0, now())`,
      [
        createdWorkflowRunId,
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
      `SELECT id, "eventName" FROM core."pendingWakeUp" WHERE "ownerType" = 'WORKFLOW_STEP' AND "ownerId" = $1`,
      [createdWorkflowRunId],
    );

    expect(storedWaits).toEqual([
      { id: expect.any(String), eventName: 'company.updated' },
    ]);

    const listener =
      getAppProviderByClassName<PendingWakeUpDatabaseEventListener>(
        'PendingWakeUpDatabaseEventListener',
      );
    const scheduleSpy = jest
      .spyOn(
        getAppProviderByClassName<PendingWakeUpService>('PendingWakeUpService'),
        'scheduleResolution',
      )
      .mockResolvedValue(undefined);

    await listener.handleObjectRecordUpdateEvent(
      (await buildCompanyUpdatedBatch(otherCompanyId!)) as never,
    );

    expect(scheduleSpy).not.toHaveBeenCalled();

    await listener.handleObjectRecordUpdateEvent(
      (await buildCompanyUpdatedBatch(watchedCompanyId!)) as never,
    );

    expect(scheduleSpy).toHaveBeenCalledTimes(1);

    const [{ wakeUp, event }] = scheduleSpy.mock.calls[0];

    scheduleSpy.mockRestore();

    await getAppProviderByClassName<PendingWakeUpResolverService>(
      'PendingWakeUpResolverService',
    ).resolve({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      wakeUpId: wakeUp.id,
      event,
    });

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
        record: { id: watchedCompanyId, name: 'Wait For Event Watched Co' },
        updatedFields: ['name'],
      },
    });

    const remainingWaits = await global.testDataSource.query(
      `SELECT id FROM core."pendingWakeUp" WHERE "ownerType" = 'WORKFLOW_STEP' AND "ownerId" = $1`,
      [createdWorkflowRunId],
    );

    expect(remainingWaits).toEqual([]);
  }, 60000);

  it('replaces the wait of a step that waits again with one of a new id', async () => {
    const workflowStepWaitWorkspaceService =
      getAppProviderByClassName<WorkflowStepWaitWorkspaceService>(
        'WorkflowStepWaitWorkspaceService',
      );
    const workflowRunId = v4();
    const arm = () =>
      workflowStepWaitWorkspaceService.arm({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workflowRunId,
        stepId: 'step-waiting-again',
        wait: { type: 'EVENT', eventName: 'company.updated' },
      });
    const findWaits = (): Promise<{ id: string }[]> =>
      global.testDataSource.query(
        `SELECT id FROM core."pendingWakeUp" WHERE "ownerType" = 'WORKFLOW_STEP' AND "ownerId" = $1`,
        [workflowRunId],
      );

    try {
      await arm();
      const [firstWait] = await findWaits();

      await arm();
      const waits = await findWaits();

      expect(waits).toHaveLength(1);
      expect(waits[0].id).not.toBe(firstWait.id);
    } finally {
      await workflowStepWaitWorkspaceService.cancelRunWaits({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workflowRunId,
      });
    }
  });
});
