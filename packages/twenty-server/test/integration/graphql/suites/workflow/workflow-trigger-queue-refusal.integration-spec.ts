import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowTriggerDispatchWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger-dispatch.workspace-service';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);
const WORKFLOW_TRIGGER_JOB_NAME = 'WorkflowTriggerJob';
const TRIGGER_PAYLOAD = {
  recordId: 'refused-record-id',
  properties: { after: { name: 'Refused record' } },
};
const SIZE_LIMIT_CONFIG: Record<string, boolean | number> = {
  IS_REDIS_MEMORY_FAIRNESS_ENABLED: true,
  JOB_QUEUE_MAX_JOB_SIZE_BYTES: 1,
};

describe('Workflow trigger queue refusal (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Workflow run created refusal test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Workflow run is created',
        type: 'DATABASE_EVENT',
        settings: { eventName: 'workflowRun.created', outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CODE',
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [coreWorkflowId],
      );
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('records one failed run per refusal without re-triggering itself', async () => {
    const queue = global.app.get<MessageQueueService>(
      getQueueToken(MessageQueue.workflowQueue),
    );
    const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    );
    const getConfig = twentyConfigService.get.bind(twentyConfigService);
    let isEnqueuingTriggerJob = false;

    jest.spyOn(twentyConfigService, 'get').mockImplementation(((
      key: string,
    ) => {
      if (isEnqueuingTriggerJob && key in SIZE_LIMIT_CONFIG) {
        return SIZE_LIMIT_CONFIG[key];
      }

      return getConfig(key as never);
    }) as never);

    const add = queue.add.bind(queue);
    const queueAdd = jest
      .spyOn(queue, 'add')
      .mockImplementation(async (jobName, data, options) => {
        isEnqueuingTriggerJob = jobName === WORKFLOW_TRIGGER_JOB_NAME;

        try {
          return await add(jobName, data, options);
        } finally {
          isEnqueuingTriggerJob = false;
        }
      });
    const countTriggerEnqueueAttempts = () =>
      queueAdd.mock.calls.filter(
        ([jobName]) => jobName === WORKFLOW_TRIGGER_JOB_NAME,
      ).length;
    const findRuns = () =>
      global.testDataSource.query(
        `SELECT status, state FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [coreWorkflowId],
      );

    await getAppProviderByClassName<WorkflowTriggerDispatchWorkspaceService>(
      'WorkflowTriggerDispatchWorkspaceService',
    ).enqueueTriggerOrFailRun({
      jobData: {
        workspaceId,
        workflowId: coreWorkflowId,
        coreWorkflowVersionId,
        payload: TRIGGER_PAYLOAD,
      },
      jobOptions: { workspaceId, isWorkspaceJob: true },
    });

    await expectEventually(async () => {
      expect(await findRuns()).toHaveLength(1);
    });

    await new Promise((resolve) => setTimeout(resolve, 2_000));

    const runs = await findRuns();

    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe('FAILED');
    expect(runs[0].state.stepInfos.trigger.result).toEqual(TRIGGER_PAYLOAD);
    expect(runs[0].state.workflowRunError).toEqual(
      expect.stringContaining(
        'Workflow could not start: trigger job exceeds the 0 MiB queue size limit',
      ),
    );
    expect(countTriggerEnqueueAttempts()).toBe(1);
  });
});
