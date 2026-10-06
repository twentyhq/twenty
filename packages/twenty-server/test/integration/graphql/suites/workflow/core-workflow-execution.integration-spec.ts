import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { randomUUID } from 'node:crypto';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

import request from 'supertest';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowAiAgentAction,
  type WorkflowEmptyAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkflowPrefillIds } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import {
  ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
  RUN_CORE_WORKFLOW_VERSION_MUTATION,
  UPDATE_CORE_WORKFLOW_VERSION_TRIGGER_MUTATION,
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';

import { type CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';

import { type CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);

const settings = {
  input: {},
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};
const emptyStep = (): WorkflowEmptyAction => ({
  id: randomUUID(),
  name: 'Core execution marker',
  type: WorkflowActionType.EMPTY,
  valid: true,
  settings,
  nextStepIds: [],
});

type Fixture = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  trigger: object;
  steps: WorkflowAction[];
};

const refreshWorkflowCaches = () =>
  global.workflowTestServices.workspaceCache.invalidateAndRecompute(
    workspaceId,
    [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ],
  );

describe('core workflow execution and queue compatibility (e2e)', () => {
  const fixtures: Fixture[] = [];

  const createFixture = async ({
    status = 'ACTIVE',
    triggerType = 'MANUAL',
    triggerSettings = {},
    steps = [emptyStep()],
    triggerNextStepIds = steps.length > 0 ? [steps[0].id] : [],
  }: {
    status?: 'ACTIVE' | 'DRAFT';
    triggerType?: string;
    triggerSettings?: object;
    steps?: WorkflowAction[];
    triggerNextStepIds?: string[];
  } = {}): Promise<Fixture> => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'B-Async execution',
    });
    const trigger = {
      name: 'B-Async trigger',
      type: triggerType,
      settings: { outputSchema: {}, ...triggerSettings },
      nextStepIds: triggerNextStepIds,
    };
    const fixture = { coreWorkflowId, coreWorkflowVersionId, trigger, steps };

    fixtures.push(fixture);
    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET triggers = $2, steps = $3, status = $4 WHERE id = $1`,
      [
        coreWorkflowVersionId,
        JSON.stringify([trigger]),
        JSON.stringify(steps),
        status,
      ],
    );

    if (status === 'ACTIVE') {
      await global.testDataSource.query(
        `UPDATE core.workflow SET "lastPublishedCoreWorkflowVersionId" = $2 WHERE id = $1`,
        [coreWorkflowId, coreWorkflowVersionId],
      );
    }

    await refreshWorkflowCaches();

    return fixture;
  };

  const getRun = async (runId: string) => {
    const [run] = await global.testDataSource.query(
      `SELECT * FROM "${schema}"."workflowRun" WHERE id = $1`,
      [runId],
    );

    return run;
  };

  const waitForRun = async (runId: string, status: string) => {
    for (let attempt = 0; attempt < 150; attempt++) {
      const run = await getRun(runId);

      if (run?.status === status) {
        return run;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect((await getRun(runId))?.status).toBe(status);
  };

  const runFixture = async (fixture: Fixture) => {
    const workflowRunId = randomUUID();
    const response = await workflowGraphqlRequest(
      RUN_CORE_WORKFLOW_VERSION_MUTATION,
      {
        input: {
          coreWorkflowVersionId: fixture.coreWorkflowVersionId,
          workflowRunId,
          payload: { marker: 'B-Async payload' },
        },
      },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.runCoreWorkflowVersion).toEqual({
      workflowRunId,
    });

    return workflowRunId;
  };

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    const coreWorkflowIds = fixtures.map((fixture) => fixture.coreWorkflowId);

    await deleteCoreWorkflows(coreWorkflowIds);
    await global.testDataSource.query(
      `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = ANY($1::uuid[])`,
      [coreWorkflowIds],
    );
    await global.testDataSource.query(
      'DELETE FROM core."workflowVersion" WHERE "coreWorkflowId" = ANY($1::uuid[])',
      [coreWorkflowIds],
    );
    await global.testDataSource.query(
      'DELETE FROM core.workflow WHERE id = ANY($1::uuid[])',
      [coreWorkflowIds],
    );
    await refreshWorkflowCaches();
  });

  it('completes a core run with core ids, a supplied run id, actor, and payload', async () => {
    const fixture = await createFixture();
    const run = await waitForRun(await runFixture(fixture), 'COMPLETED');

    expect(run).toMatchObject({
      coreWorkflowId: fixture.coreWorkflowId,
      coreWorkflowVersionId: fixture.coreWorkflowVersionId,
      state: {
        flow: { steps: fixture.steps },
        stepInfos: { trigger: { result: { marker: 'B-Async payload' } } },
      },
    });
    expect(run.createdByWorkspaceMemberId).toBeTruthy();
  });

  it.each(Object.values(WorkflowActionType))(
    'dispatches %s through the core runner',
    async (actionType) => {
      const step = {
        id: randomUUID(),
        name: `${actionType} dispatch marker`,
        type: actionType,
        valid: true,
        settings: {
          ...settings,
          input:
            actionType === WorkflowActionType.IF_ELSE
              ? { branches: [] }
              : actionType === WorkflowActionType.ITERATOR
                ? { initialLoopStepIds: [] }
                : actionType === WorkflowActionType.CODE
                  ? { logicFunctionId: randomUUID() }
                  : {},
        },
        nextStepIds: [],
      } as WorkflowAction;
      const execute = jest.fn().mockResolvedValue({
        result:
          actionType === WorkflowActionType.ITERATOR
            ? { hasProcessedAllItems: true }
            : { actionType },
      });
      const actionFactory = getAppProviderByClassName<WorkflowActionFactory>(
        'WorkflowActionFactory',
      );

      jest.spyOn(actionFactory, 'get').mockReturnValue({ execute });

      const fixture = await createFixture({ steps: [step] });
      const run = await waitForRun(await runFixture(fixture), 'COMPLETED');

      expect(actionFactory.get).toHaveBeenCalledWith(actionType);
      expect(execute).toHaveBeenCalledTimes(1);
      expect(run.state.flow.steps[0].type).toBe(actionType);
      expect(run.state.stepInfos[step.id].status).toBe('SUCCESS');
    },
  );

  it('bills the core-owned spender mapping', async () => {
    const fixture = await createFixture();
    const charge = jest.spyOn(global.workflowTestServices.quota, 'charge');

    await waitForRun(await runFixture(fixture), 'COMPLETED');

    const [workspace] = await global.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
      [workspaceId],
    );

    expect(charge).toHaveBeenCalledWith({
      workspaceId,
      events: [
        expect.objectContaining({
          spenders: {
            workflowId: fixture.coreWorkflowId,
            applicationId: workspace.workspaceCustomApplicationId,
          },
        }),
      ],
    });
  });

  it.each(['unversioned', 'core-version'] as const)(
    'accepts the %s queue envelope',
    async (envelope) => {
      const fixture = await createFixture();
      const queue = global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.workflowQueue),
      );

      await queue.add('WorkflowTriggerJob', {
        workspaceId,
        workflowId: fixture.coreWorkflowId,
        payload: { marker: envelope },
        ...(envelope === 'core-version'
          ? { coreWorkflowVersionId: fixture.coreWorkflowVersionId }
          : {}),
      });
      for (let attempt = 0; attempt < 100; attempt++) {
        const [run] = await global.testDataSource.query(
          `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
          [fixture.coreWorkflowId],
        );
        if (run) {
          const completedRun = await waitForRun(run.id, 'COMPLETED');

          expect(completedRun.createdByName).toBe('B-Async execution');
          expect(completedRun.createdBySource).toBe('WORKFLOW');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('Queue envelope did not dispatch');
    },
  );

  it('rejects a queued version belonging to another workflow or tenant', async () => {
    const first = await createFixture();
    const second = await createFixture();
    const job = await global.workflowTestServices.triggerJob();

    await job.handle({
      workspaceId,
      workflowId: first.coreWorkflowId,
      coreWorkflowVersionId: second.coreWorkflowVersionId,
      payload: {},
    });
    await job.handle({
      workspaceId: randomUUID(),
      workflowId: first.coreWorkflowId,
      coreWorkflowVersionId: first.coreWorkflowVersionId,
      payload: {},
    });
    const runs = await global.testDataSource.query(
      `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = ANY($1::uuid[])`,
      [[first.coreWorkflowId, second.coreWorkflowId]],
    );

    expect(runs).toHaveLength(0);
  });

  it('starts a webhook workflow from the webhook URL carrying its core id', async () => {
    const fixture = await createFixture({
      triggerType: 'WEBHOOK',
      triggerSettings: {
        httpMethod: 'POST',
        authentication: null,
        expectedBody: {},
      },
    });

    const response = await request(`http://localhost:${APP_PORT}`)
      .post(`/webhooks/workflows/${workspaceId}/${fixture.coreWorkflowId}`)
      .send({ marker: 'webhook-url' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    await waitForRun(response.body.workflowRunId, 'COMPLETED');
  });

  it('starts a queued run from its persisted snapshot after a core edit', async () => {
    const fixture = await createFixture();
    const workflowRunId = randomUUID();
    const state = {
      flow: { trigger: fixture.trigger, steps: fixture.steps },
      stepInfos: {
        trigger: { status: 'NOT_STARTED', result: {} },
        ...Object.fromEntries(
          fixture.steps.map((step) => [
            (step as { id: string }).id,
            { status: 'NOT_STARTED' },
          ]),
        ),
      },
    };

    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, state, position) VALUES ($1, 'B-Async queued run', $2, $3, 'ENQUEUED', $4, 0)`,
      [
        workflowRunId,
        fixture.coreWorkflowId,
        fixture.coreWorkflowVersionId,
        JSON.stringify(state),
      ],
    );
    await global.testDataSource.query(
      'UPDATE core."workflowVersion" SET triggers = NULL, steps = NULL WHERE id = $1',
      [fixture.coreWorkflowVersionId],
    );
    await (
      await global.workflowTestServices.runJob()
    ).handle({ workspaceId, workflowRunId });
    const run = await waitForRun(workflowRunId, 'COMPLETED');

    expect(run.coreWorkflowVersionId).toBe(fixture.coreWorkflowVersionId);
    expect(run.state.flow).toEqual(state.flow);
  });

  it('defers the core trigger cache during historical upgrades and rebuilds it afterwards', async () => {
    const fixture = await createFixture({
      triggerType: 'CRON',
      triggerSettings: { type: 'CUSTOM', pattern: '* * * * *' },
    });
    const { workspaceCache, upgradeState } = global.workflowTestServices;
    const hiddenColumns = jest
      .spyOn(upgradeState, 'getHiddenColumnPropertyNames')
      .mockReturnValue(new Set(['workspaceWorkflowVersionId']));

    await workspaceCache.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
    const duringUpgrade = await workspaceCache.getOrRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    expect(duringUpgrade.workflowAutomatedTriggerMaps.byWorkflowId).toEqual({});
    hiddenColumns.mockRestore();
    await workspaceCache.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
    const afterUpgrade = await workspaceCache.getOrRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    expect(
      afterUpgrade.workflowAutomatedTriggerMaps.byWorkflowId[
        fixture.coreWorkflowId
      ],
    ).toMatchObject({ coreWorkflowVersionId: fixture.coreWorkflowVersionId });
  });

  it('normalizes overlapping cron cache entries of one core workflow without duplicate runs', async () => {
    const fixture = await createFixture({
      triggerType: 'CRON',
      triggerSettings: { type: 'CUSTOM', pattern: '* * * * *' },
    });
    const cache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.ModuleWorkflow,
    );
    const cron = global.workflowTestServices.cron;
    const unversionedEntry = {
      workspaceId,
      workflowId: fixture.coreWorkflowId,
      pattern: '* * * * *',
    };
    const versionedEntry = {
      workspaceId,
      workflowId: fixture.coreWorkflowId,
      coreWorkflowVersionId: fixture.coreWorkflowVersionId,
      pattern: '* * * * *',
    };

    jest
      .spyOn(cache, 'hashGetValues')
      .mockResolvedValue([
        JSON.stringify(unversionedEntry),
        JSON.stringify(versionedEntry),
      ]);
    const dispatchTime = new Date();
    const shouldDispatch =
      CronTriggerDeduplicationService.prototype.shouldDispatch;

    jest
      .spyOn(CronTriggerDeduplicationService.prototype, 'shouldDispatch')
      .mockImplementation(function (key, pattern) {
        return shouldDispatch.call(this, key, pattern, dispatchTime);
      });
    await cron.handle();
    await cron.handle();

    for (let attempt = 0; attempt < 100; attempt++) {
      const runs = await global.testDataSource.query(
        `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [fixture.coreWorkflowId],
      );

      if (runs.length > 0) {
        expect(runs).toHaveLength(1);
        await waitForRun(runs[0].id, 'COMPLETED');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Cron failed to dispatch');
  });
  const waitForStep = async (runId: string, stepId: string, status: string) => {
    for (let attempt = 0; attempt < 150; attempt++) {
      const run = await getRun(runId);

      if (run?.state?.stepInfos[stepId]?.status === status) {
        return run;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    expect((await getRun(runId))?.state?.stepInfos[stepId]?.status).toBe(
      status,
    );
  };

  const clearDefinitions = async (fixture: Fixture) => {
    await global.testDataSource.query(
      'UPDATE core."workflowVersion" SET triggers = NULL, steps = NULL WHERE id = $1',
      [fixture.coreWorkflowVersionId],
    );
  };

  it('resumes a delayed run after definition changes', async () => {
    const finalStep = emptyStep();
    const delay: WorkflowAction = {
      ...emptyStep(),
      type: WorkflowActionType.DELAY,
      nextStepIds: [finalStep.id],
      settings: {
        ...settings,
        input: { delayType: 'DURATION', duration: { seconds: 2 } },
      },
    };
    const fixture = await createFixture({ steps: [delay, finalStep] });
    const runId = await runFixture(fixture);
    await waitForStep(runId, delay.id, 'PENDING');
    await clearDefinitions(fixture);
    const run = await waitForRun(runId, 'COMPLETED');

    expect(run.state.flow.steps).toEqual(fixture.steps);
    expect(run.state.stepInfos[finalStep.id].status).toBe('SUCCESS');
  });

  it('resumes a pending form after definition changes', async () => {
    const finalStep = emptyStep();
    const form: WorkflowAction = {
      ...emptyStep(),
      type: WorkflowActionType.FORM,
      nextStepIds: [finalStep.id],
      settings: {
        ...settings,
        input: [
          {
            id: randomUUID(),
            name: 'answer',
            label: 'Answer',
            type: FieldMetadataType.TEXT,
          },
        ],
      },
    };
    const fixture = await createFixture({ steps: [form, finalStep] });
    const runId = await runFixture(fixture);
    await waitForStep(runId, form.id, 'PENDING');
    await clearDefinitions(fixture);
    const response = await submitFormStep({
      workflowRunId: runId,
      stepId: form.id,
      response: { answer: 'From the stored form' },
    });

    expect(response.body.errors).toBeUndefined();
    const run = await waitForRun(runId, 'COMPLETED');
    expect(run.state.stepInfos[form.id].result).toEqual({
      answer: 'From the stored form',
    });
    expect(run.state.stepInfos[finalStep.id].status).toBe('SUCCESS');
  });

  const formStep = (nextStepIds: string[]): WorkflowAction => ({
    ...emptyStep(),
    type: WorkflowActionType.FORM,
    nextStepIds,
    settings: {
      ...settings,
      input: [
        {
          id: randomUUID(),
          name: 'answer',
          label: 'Answer',
          type: FieldMetadataType.TEXT,
        },
      ],
    },
  });

  const submitForm = ({
    runId,
    stepId,
    answer,
  }: {
    runId: string;
    stepId: string;
    answer: string;
  }) => submitFormStep({ workflowRunId: runId, stepId, response: { answer } });

  describe('submitting a form step', () => {
    it('waits without a conversation and completes with the submitted values', async () => {
      const finalStep = emptyStep();
      const form = formStep([finalStep.id]);
      const fixture = await createFixture({ steps: [form, finalStep] });
      const runId = await runFixture(fixture);

      await waitForStep(runId, form.id, 'PENDING');

      expect((await getRun(runId)).state.stepInfos[form.id].threadId).toBe(
        undefined,
      );

      const response = await submitForm({
        runId,
        stepId: form.id,
        answer: 'Approved',
      });

      expect(response.body.errors).toBeUndefined();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[form.id].result).toEqual({
        answer: 'Approved',
      });
    });

    it('refuses values for fields the form does not have', async () => {
      const finalStep = emptyStep();
      const form = formStep([finalStep.id]);
      const fixture = await createFixture({ steps: [form, finalStep] });
      const runId = await runFixture(fixture);

      await waitForStep(runId, form.id, 'PENDING');

      const refused = await submitFormStep({
        workflowRunId: runId,
        stepId: form.id,
        response: { unknownField: 'Approved' },
      });

      expect(refused.body.errors).toBeDefined();
      expect((await getRun(runId)).state.stepInfos[form.id].status).toBe(
        'PENDING',
      );
    });

    it('refuses a second submission and keeps the first answer', async () => {
      const finalStep = emptyStep();
      const form = formStep([finalStep.id]);
      const fixture = await createFixture({ steps: [form, finalStep] });
      const runId = await runFixture(fixture);

      await waitForStep(runId, form.id, 'PENDING');

      const first = await submitForm({
        runId,
        stepId: form.id,
        answer: 'Approved',
      });

      expect(first.body.errors).toBeUndefined();
      await waitForRun(runId, 'COMPLETED');

      const second = await submitForm({
        runId,
        stepId: form.id,
        answer: 'Approved again',
      });

      expect(JSON.stringify(second.body.errors)).toContain(
        'no longer waiting for an answer',
      );
      expect((await getRun(runId)).state.stepInfos[form.id].result).toEqual({
        answer: 'Approved',
      });
    });

    it('takes a submission for each iteration of a form inside a loop', async () => {
      const afterLoop = emptyStep();
      const form = formStep([]);
      const iterator: WorkflowAction = {
        ...emptyStep(),
        type: WorkflowActionType.ITERATOR,
        settings: {
          ...settings,
          input: {
            items: ['first', 'second'],
            initialLoopStepIds: [form.id],
          },
        },
        nextStepIds: [afterLoop.id],
      };

      form.nextStepIds = [iterator.id];

      const fixture = await createFixture({
        steps: [iterator, form, afterLoop],
      });
      const runId = await runFixture(fixture);

      await waitForStep(runId, form.id, 'PENDING');

      const first = await submitForm({
        runId,
        stepId: form.id,
        answer: 'First item',
      });

      expect(first.body.errors).toBeUndefined();
      await waitForStep(runId, form.id, 'PENDING');

      const second = await submitForm({
        runId,
        stepId: form.id,
        answer: 'Second item',
      });

      expect(second.body.errors).toBeUndefined();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[form.id].result).toEqual({
        answer: 'Second item',
      });
    });

    it('refuses a submission once its run ended', async () => {
      const finalStep = emptyStep();
      const form = formStep([finalStep.id]);
      const fixture = await createFixture({ steps: [form, finalStep] });
      const runId = await runFixture(fixture);

      await waitForStep(runId, form.id, 'PENDING');

      const response = await workflowGraphqlRequest(
        'mutation Stop($id: UUID!) { stopWorkflowRun(workflowRunId: $id) { id status } }',
        { id: runId },
      );

      expect(response.body.errors).toBeUndefined();
      await waitForRun(runId, 'STOPPED');

      const late = await submitForm({
        runId,
        stepId: form.id,
        answer: 'Too late',
      });

      expect(JSON.stringify(late.body.errors)).toContain(
        'no longer waiting for an answer',
      );

      const run = await getRun(runId);

      expect(run.status).toBe('STOPPED');
      expect(run.state.stepInfos[form.id].status).toBe('FAILED');
      expect(run.state.stepInfos[finalStep.id].status).toBe('NOT_STARTED');
    });
  });

  // Nothing would resume an answer submitted to a run parked in STOPPING.
  it('refuses a submission while its run is stopping', async () => {
    const finalStep = emptyStep();
    const form = formStep([finalStep.id]);
    const fixture = await createFixture({ steps: [form, finalStep] });
    const runId = await runFixture(fixture);

    await waitForStep(runId, form.id, 'PENDING');
    await global.testDataSource.query(
      `UPDATE "${schema}"."workflowRun" SET status = 'STOPPING' WHERE id = $1`,
      [runId],
    );

    const response = await submitForm({
      runId,
      stepId: form.id,
      answer: 'While stopping',
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'no longer waiting for an answer',
    );
    expect((await getRun(runId)).state.stepInfos[form.id].status).toBe(
      'PENDING',
    );
  });

  describe('an agent step that asks a question', () => {
    const QUESTION = {
      header: 'Quote',
      question: 'Send the quote to the customer?',
      options: [{ label: 'Send it' }, { label: 'Hold it' }],
    };

    const agentStep = (nextStepIds: string[]): WorkflowAiAgentAction =>
      ({
        ...emptyStep(),
        name: 'Draft the quote',
        type: WorkflowActionType.AI_AGENT,
        nextStepIds,
        settings: {
          ...settings,
          input: {
            prompt: 'Draft the quote',
            humanInputInstructions: 'Ask before choosing a plan.',
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          },
        },
      }) as WorkflowAiAgentAction;

    const agentResult = (
      overrides: Partial<AgentExecutionResult>,
    ): AgentExecutionResult =>
      ({
        result: { response: '' },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        cacheCreationTokens: 0,
        nativeWebSearchCallCount: 0,
        hasNoMoreAvailableCredits: false,
        modelId: 'test-model',
        ...overrides,
      }) as AgentExecutionResult;

    const askingResult = agentResult({
      isPaused: true,
      steps: [
        {
          content: [
            {
              type: 'tool-call',
              toolCallId: 'ask-1',
              toolName: 'ask_question',
              input: QUESTION,
            },
            {
              type: 'tool-result',
              toolCallId: 'ask-1',
              toolName: 'ask_question',
              input: QUESTION,
              output: {
                success: true,
                message:
                  'Question presented to the user; awaiting their answer.',
                result: { question: QUESTION, status: 'pending' },
              },
            },
          ],
        },
      ] as AgentExecutionResult['steps'],
    });

    const replyingResult = agentResult({
      result: { response: 'Quote sent' },
      steps: [
        { content: [{ type: 'text', text: 'Quote sent' }] },
      ] as AgentExecutionResult['steps'],
    });

    const mockAgent = () =>
      jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(askingResult)
        .mockResolvedValueOnce(replyingResult);

    const getToolCalls = async (threadId: string) => {
      const [thread] = await global.testDataSource.query(
        `SELECT "pendingQuestionMessageId" FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      );
      const parts = await global.testDataSource.query(
        `SELECT part."toolCallId", part."toolOutput" FROM "${schema}"."agentMessagePart" part JOIN "${schema}"."agentMessage" message ON message.id = part."messageId" WHERE message."threadId" = $1 AND part."toolName" = 'ask_question' ORDER BY part."toolCallId"`,
        [threadId],
      );

      return {
        isWaiting: isDefined(thread.pendingQuestionMessageId),
        calls: parts.map(
          (part: {
            toolCallId: string;
            toolOutput: { result: Record<string, unknown> };
          }) => ({
            toolCallId: part.toolCallId,
            status: part.toolOutput.result.status,
            answer: part.toolOutput.result.answer,
          }),
        ),
      };
    };

    const getConversation = async (threadId: string) => {
      const messages = await global.testDataSource.query(
        `SELECT id, role FROM "${schema}"."agentMessage" WHERE "threadId" = $1 ORDER BY "processedAt", "createdAt"`,
        [threadId],
      );
      const [questionPart] = await global.testDataSource.query(
        `SELECT "toolOutput" FROM "${schema}"."agentMessagePart" WHERE "toolCallId" = 'ask-1' AND "messageId" = ANY($1::uuid[])`,
        [messages.map(({ id }: { id: string }) => id)],
      );

      return { messages, questionPart };
    };

    const startAskingRun = async () => {
      const finalStep = emptyStep();
      const agent = agentStep([finalStep.id]);
      const fixture = await createFixture({ steps: [agent, finalStep] });
      const runId = await runFixture(fixture);
      const run = await waitForStep(runId, agent.id, 'PENDING');
      const threadId: string = run.stepLogs[agent.id].details.threadId;

      return { runId, agent, finalStep, threadId };
    };

    const answer = ({
      threadId,
      toolCallId = 'ask-1',
    }: {
      threadId: string;
      toolCallId?: string;
    }) =>
      answerToolCall({
        toolCall: { threadId, toolCallId },
        response: { selectedOptionIndices: [0] },
      });

    const getInboxState = async (threadId: string) => {
      const [state] = await global.testDataSource.query(
        `SELECT thread."workspaceMemberId", thread."lastMessageText",
           participant."archivedAt" IS NOT NULL AS "isArchived",
           thread."lastActivityAt" > participant."archivedAt" AS "isBackInInbox"
         FROM "${schema}"."agentChatThread" thread
         LEFT JOIN "${schema}"."agentChatThreadParticipant" participant
           ON participant."threadId" = thread.id AND participant."workspaceMemberId" = thread."workspaceMemberId"
         WHERE thread.id = $1`,
        [threadId],
      );

      return state;
    };

    it('records the conversation of an agent that answers without asking, filed under done', async () => {
      jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(replyingResult);
      const finalStep = emptyStep();
      const agent = agentStep([finalStep.id]);
      const fixture = await createFixture({ steps: [agent, finalStep] });
      const runId = await runFixture(fixture);

      const run = await waitForRun(runId, 'COMPLETED');
      const threadId: string = run.stepLogs[agent.id].details.threadId;

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(await getInboxState(threadId)).toMatchObject({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        isArchived: true,
        isBackInInbox: false,
      });
      expect(
        (await getConversation(threadId)).messages.map(
          ({ role }: { role: string }) => role,
        ),
      ).toEqual(['user', 'assistant']);
    });

    it('keeps the usage and the conversation in the step log when its tool calls outgrow it', async () => {
      const largeOutput = 'x'.repeat(64_000);
      const toolCallIds = ['find-1', 'find-2', 'find-3', 'find-4', 'find-5'];

      jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(
          agentResult({
            result: { response: 'Quote sent' },
            steps: [
              {
                content: toolCallIds.flatMap((toolCallId) => [
                  {
                    type: 'tool-call',
                    toolCallId,
                    toolName: 'find_companies',
                    input: {},
                  },
                  {
                    type: 'tool-result',
                    toolCallId,
                    toolName: 'find_companies',
                    input: {},
                    output: { success: true, result: largeOutput },
                  },
                ]),
              },
            ] as AgentExecutionResult['steps'],
          }),
        );
      const finalStep = emptyStep();
      const agent = agentStep([finalStep.id]);
      const fixture = await createFixture({ steps: [agent, finalStep] });
      const runId = await runFixture(fixture);

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.stepLogs[agent.id]).toMatchObject({
        details: {
          type: 'AI_AGENT',
          usage: { totalTokens: 2 },
          toolCalls: [],
          threadId: expect.any(String),
        },
        truncated: { droppedEntries: toolCallIds.length },
      });
    });

    it('continues the conversation its key names across runs', async () => {
      const executeAgent = jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(replyingResult)
        .mockResolvedValueOnce(replyingResult);
      const agent = {
        ...agentStep([]),
        settings: {
          ...agentStep([]).settings,
          input: {
            ...agentStep([]).settings.input,
            conversation: { scope: 'KEY', key: 'quotes' },
          },
        },
      } as WorkflowAction;
      const fixture = await createFixture({ steps: [agent] });

      const firstRun = await waitForRun(await runFixture(fixture), 'COMPLETED');
      const secondRun = await waitForRun(
        await runFixture(fixture),
        'COMPLETED',
      );
      const threadId: string = firstRun.stepLogs[agent.id].details.threadId;

      expect(secondRun.stepLogs[agent.id].details.threadId).toBe(threadId);
      expect(executeAgent.mock.calls[0][0].priorMessages).toEqual([]);
      expect(
        JSON.stringify(executeAgent.mock.calls[1][0].priorMessages),
      ).toContain('Quote sent');
    });

    it("routes the waiting conversation to the workflow creator's inbox when the step names no recipient", async () => {
      mockAgent();
      const [creator] = await global.testDataSource.query(
        `SELECT membership.id AS "userWorkspaceId", member.id AS "workspaceMemberId"
         FROM core."userWorkspace" membership
         JOIN "${schema}"."workspaceMember" member ON member."userId" = membership."userId"
         WHERE membership."workspaceId" = $1 AND membership."deletedAt" IS NULL AND member.id = $2`,
        [workspaceId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      );
      const agent = {
        ...agentStep([]),
        settings: {
          ...agentStep([]).settings,
          input: {
            ...agentStep([]).settings.input,
            workspaceMemberId: undefined,
          },
        },
      } as WorkflowAction;
      const fixture = await createFixture({ steps: [agent] });

      await global.testDataSource.query(
        `UPDATE core.workflow SET "createdByUserWorkspaceId" = $1 WHERE id = $2`,
        [creator.userWorkspaceId, fixture.coreWorkflowId],
      );

      const runId = await runFixture(fixture);
      const run = await waitForStep(runId, agent.id, 'PENDING');
      const threadId: string = run.stepLogs[agent.id].details.threadId;

      expect(await getInboxState(threadId)).toMatchObject({
        workspaceMemberId: creator.workspaceMemberId,
        lastMessageText: agent.name,
        isArchived: true,
        isBackInInbox: true,
      });

      const readByAnotherMember = await request(`http://localhost:${APP_PORT}`)
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `query ReadRunConversation($threadId: UUID!) { chatMessages(threadId: $threadId) { role } }`,
          variables: { threadId },
        });

      expect(readByAnotherMember.body.errors).toBeDefined();
    });

    it('keeps the conversation of a workflow without a member creator off every inbox', async () => {
      mockAgent();
      const agent = {
        ...agentStep([]),
        settings: {
          ...agentStep([]).settings,
          input: {
            ...agentStep([]).settings.input,
            workspaceMemberId: undefined,
          },
        },
      } as WorkflowAction;
      const fixture = await createFixture({ steps: [agent] });

      await global.testDataSource.query(
        `UPDATE core.workflow SET "createdByUserWorkspaceId" = NULL WHERE id = $1`,
        [fixture.coreWorkflowId],
      );

      const runId = await runFixture(fixture);
      const run = await waitForStep(runId, agent.id, 'PENDING');
      const threadId: string = run.stepLogs[agent.id].details.threadId;
      const [conversation] = await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM "${schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      );

      expect(conversation.workspaceMemberId).toBeNull();
    });

    it('keeps a question waiting when it is answered before its step is marked as waiting', async () => {
      mockAgent();
      const { runId, agent, threadId } = await startAskingRun();
      const setStepStatus = (status: string) =>
        global.testDataSource.query(
          `UPDATE "${schema}"."workflowRun" SET state = jsonb_set(state, ARRAY['stepInfos', $2::text, 'status'], to_jsonb($3::text)) WHERE id = $1`,
          [runId, agent.id, status],
        );

      await setStepStatus('RUNNING');

      const earlyAnswer = await answer({ threadId });

      expect(JSON.stringify(earlyAnswer.body.errors)).toContain(
        'TOOL_CALL_NOT_PENDING',
      );
      expect(await getToolCalls(threadId)).toEqual({
        isWaiting: true,
        calls: [{ toolCallId: 'ask-1', status: 'pending' }],
      });

      await setStepStatus('PENDING');

      expect((await answer({ threadId })).body.errors).toBeUndefined();
      await waitForRun(runId, 'COMPLETED');
    });

    it('retries a step whose agent failed after its answer in the same conversation, which holds the answer', async () => {
      const executeAgent = jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(askingResult)
        .mockRejectedValueOnce(new Error('The model is overloaded'))
        .mockResolvedValueOnce(replyingResult);
      const agent = {
        ...agentStep([]),
        settings: {
          ...agentStep([]).settings,
          errorHandlingOptions: {
            retryOnFailure: { value: 1 },
            continueOnFailure: { value: false },
          },
        },
      } as WorkflowAction;
      const fixture = await createFixture({ steps: [agent] });
      const runId = await runFixture(fixture);
      const pausedRun = await waitForStep(runId, agent.id, 'PENDING');
      const threadId: string = pausedRun.stepLogs[agent.id].details.threadId;

      expect((await answer({ threadId })).body.errors).toBeUndefined();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
      });
      expect(run.stepLogs[agent.id].details.threadId).toBe(threadId);
      expect(executeAgent).toHaveBeenCalledTimes(3);
      expect(executeAgent.mock.calls[2][0].messages).toEqual([
        { role: 'user', content: 'Draft the quote' },
      ]);
      expect(
        JSON.stringify(executeAgent.mock.calls[2][0].priorMessages),
      ).toContain('Send it');
      expect(await getToolCalls(threadId)).toMatchObject({
        isWaiting: false,
        calls: [{ toolCallId: 'ask-1', status: 'answered' }],
      });
    });

    it('still waits on the question when its conversation cannot be surfaced in the inbox', async () => {
      mockAgent();
      const recordThreadActivity = jest
        .spyOn(
          getAppProviderByClassName<AgentChatThreadService>(
            'AgentChatThreadService',
          ),
          'recordThreadActivity',
        )
        .mockRejectedValueOnce(new Error('Database unavailable'));

      try {
        const { runId, threadId } = await startAskingRun();

        expect(await getToolCalls(threadId)).toMatchObject({
          isWaiting: true,
        });
        expect((await answer({ threadId })).body.errors).toBeUndefined();
        await waitForRun(runId, 'COMPLETED');
      } finally {
        recordThreadActivity.mockRestore();
      }
    });

    it('pauses the run on the question and lets the engine continue the agent, without running the step again', async () => {
      const executeAgent = mockAgent();
      const { runId, agent, finalStep, threadId } = await startAskingRun();

      expect((await getRun(runId)).state.stepInfos[finalStep.id].status).toBe(
        'NOT_STARTED',
      );
      expect(await getToolCalls(threadId)).toEqual({
        isWaiting: true,
        calls: [{ toolCallId: 'ask-1', status: 'pending' }],
      });

      const response = await answer({ threadId });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.answerToolCall.streamId).toBeNull();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(run.stepLogs[agent.id].details).toMatchObject({
        threadId,
        usage: { totalTokens: 4 },
      });
      expect(run.state.stepInfos[finalStep.id].status).toBe('SUCCESS');

      const resumedWith = executeAgent.mock.calls[1][0];

      expect(resumedWith.messages).toEqual([]);
      expect(JSON.stringify(resumedWith.priorMessages)).toContain('Send it');

      const { messages, questionPart } = await getConversation(threadId);

      expect(questionPart.toolOutput.result.status).toBe('answered');
      expect(await getToolCalls(threadId)).toEqual({
        isWaiting: false,
        calls: [
          {
            toolCallId: 'ask-1',
            status: 'answered',
            answer: { selectedOptionIndices: [0] },
          },
        ],
      });
      expect(messages.map(({ role }: { role: string }) => role)).toEqual([
        'user',
        'assistant',
        'user',
        'assistant',
      ]);
    });

    it('refuses a second answer to the same question', async () => {
      mockAgent();
      const { runId, threadId } = await startAskingRun();

      expect((await answer({ threadId })).body.errors).toBeUndefined();
      await waitForRun(runId, 'COMPLETED');

      const second = await answer({ threadId });

      expect(JSON.stringify(second.body.errors)).toContain(
        'TOOL_CALL_NOT_PENDING',
      );
      expect((await getToolCalls(threadId)).calls).toMatchObject([
        { status: 'answered' },
      ]);
    });

    it('continues an agent that paused on a wait once its wake-up resolves, without running the step again', async () => {
      const resumeAt = new Date(Date.now() + 1_000).toISOString();
      const executeAgent = jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(
          agentResult({
            isPaused: true,
            steps: [
              {
                content: [
                  {
                    type: 'tool-call',
                    toolCallId: 'wait-1',
                    toolName: 'wait_for_duration',
                    input: { durationInMinutes: 1 },
                  },
                  {
                    type: 'tool-result',
                    toolCallId: 'wait-1',
                    toolName: 'wait_for_duration',
                    input: { durationInMinutes: 1 },
                    output: {
                      success: true,
                      message: `Waiting until ${resumeAt}.`,
                      result: {
                        status: 'pending',
                        wait: { type: 'TIME', resumeAt },
                      },
                    },
                  },
                ],
                toolResults: [
                  {
                    toolCallId: 'wait-1',
                    toolName: 'wait_for_duration',
                    output: {
                      success: true,
                      result: {
                        status: 'pending',
                        wait: { type: 'TIME', resumeAt },
                      },
                    },
                  },
                ],
              },
            ] as unknown as AgentExecutionResult['steps'],
          }),
        )
        .mockResolvedValueOnce(replyingResult);
      const finalStep = emptyStep();
      const agent = agentStep([finalStep.id]);
      const fixture = await createFixture({ steps: [agent, finalStep] });
      const runId = await runFixture(fixture);
      const pausedRun = await waitForStep(runId, agent.id, 'PENDING');
      const threadId: string = pausedRun.stepLogs[agent.id].details.threadId;

      expect(pausedRun.state.stepInfos[agent.id].wait).toEqual({
        type: 'CALLBACK',
      });
      expect(
        await global.testDataSource.query(
          `SELECT "ownerType", "ownerKey" FROM core."pendingWakeUp" WHERE "ownerId" = (SELECT id FROM core."agentRunSuspension" WHERE "threadId" = $1)`,
          [threadId],
        ),
      ).toEqual([{ ownerType: 'AGENT_RUN', ownerKey: 'wait-1' }]);

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(executeAgent).toHaveBeenCalledTimes(2);
      expect(executeAgent.mock.calls[1][0].messages).toEqual([]);
      expect(
        JSON.stringify(executeAgent.mock.calls[1][0].priorMessages),
      ).toContain('The wait is over.');
      expect(
        await global.testDataSource.query(
          `SELECT id FROM core."agentRunSuspension" WHERE "threadId" = $1`,
          [threadId],
        ),
      ).toEqual([]);
    });

    it('continues an agent step paused on a question by 2.45 once the upgrade suspends it', async () => {
      const executeAgent = mockAgent();
      const { runId, agent, threadId } = await startAskingRun();

      // the shape a step paused by 2.45 left behind
      await global.testDataSource.query(
        `DELETE FROM core."agentRunSuspension" WHERE "threadId" = $1`,
        [threadId],
      );
      await global.testDataSource.query(
        `UPDATE "${schema}"."agentMessagePart" SET "toolOutput" = "toolOutput" - 'awaitedByCaller' WHERE "toolCallId" = 'ask-1'`,
      );
      await global.testDataSource.query(
        `UPDATE "${schema}"."workflowRun" SET state = jsonb_set(state, ARRAY['stepInfos', $2::text], (state->'stepInfos'->$2::text) - 'wait' || jsonb_build_object('threadId', $3::text)) WHERE id = $1`,
        [runId, agent.id, threadId],
      );

      await getAppProviderByClassName<ProvisionedWorkspaceCommandRunner>(
        'SuspendPausedAgentStepsCommand',
      ).runOnWorkspace({ workspaceId, options: {}, index: 0, total: 1 });

      expect((await answer({ threadId })).body.errors).toBeUndefined();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(executeAgent).toHaveBeenCalledTimes(2);
      expect(executeAgent.mock.calls[1][0].messages).toEqual([]);
      expect(run.stepLogs[agent.id].details.usage.totalTokens).toBe(4);
    });

    it('waits for every question asked at once and resumes once all are answered', async () => {
      const askCall = (toolCallId: string) => [
        {
          type: 'tool-call',
          toolCallId,
          toolName: 'ask_question',
          input: QUESTION,
        },
        {
          type: 'tool-result',
          toolCallId,
          toolName: 'ask_question',
          input: QUESTION,
          output: {
            success: true,
            message: 'Question presented to the user; awaiting their answer.',
            result: { question: QUESTION, status: 'pending' },
          },
        },
      ];
      const executeAgent = jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockResolvedValueOnce(
          agentResult({
            isPaused: true,
            steps: [
              { content: [...askCall('ask-1'), ...askCall('ask-2')] },
            ] as AgentExecutionResult['steps'],
          }),
        )
        .mockResolvedValueOnce(replyingResult);
      const { runId, agent, threadId } = await startAskingRun();

      expect(await getToolCalls(threadId)).toEqual({
        isWaiting: true,
        calls: [
          { toolCallId: 'ask-1', status: 'pending' },
          { toolCallId: 'ask-2', status: 'pending' },
        ],
      });

      const first = await answer({ threadId, toolCallId: 'ask-1' });

      expect(first.body.errors).toBeUndefined();

      const waitingRun = await getRun(runId);

      expect(waitingRun.status).toBe('RUNNING');
      expect(waitingRun.state.stepInfos[agent.id].status).toBe('PENDING');

      const second = await answer({ threadId, toolCallId: 'ask-2' });

      expect(second.body.errors).toBeUndefined();

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(executeAgent).toHaveBeenCalledTimes(2);
      expect(
        JSON.stringify(executeAgent.mock.calls[1][0].priorMessages),
      ).not.toContain('"pending"');
    });

    it('refuses an answer once the run is stopped, whose end closed the call', async () => {
      mockAgent();
      const { runId, agent, threadId } = await startAskingRun();

      await workflowGraphqlRequest(
        'mutation Stop($id: UUID!) { stopWorkflowRun(workflowRunId: $id) { id status } }',
        { id: runId },
      );
      await waitForRun(runId, 'STOPPED');

      const response = await answer({ threadId });

      expect(JSON.stringify(response.body.errors)).toContain(
        'TOOL_CALL_NOT_PENDING',
      );

      const { messages, questionPart } = await getConversation(threadId);

      expect(questionPart.toolOutput.result.status).toBe('skipped');
      expect(messages).toHaveLength(2);
      expect((await getToolCalls(threadId)).isWaiting).toBe(false);
      expect((await getRun(runId)).state.stepInfos[agent.id].status).toBe(
        'FAILED',
      );
    });

    it('keeps the run alive while the agent continuation is queued, even once a parallel branch has finished', async () => {
      const executeAgent = mockAgent();
      const agent = agentStep([]);
      const parallelBranch = emptyStep();
      const fixture = await createFixture({
        steps: [agent, parallelBranch],
        triggerNextStepIds: [agent.id, parallelBranch.id],
      });
      const runId = await runFixture(fixture);
      const pausedRun = await waitForStep(runId, agent.id, 'PENDING');

      await waitForStep(runId, parallelBranch.id, 'SUCCESS');

      const threadId: string = pausedRun.stepLogs[agent.id].details.threadId;
      const queue = global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.workflowQueue),
      );
      const aiQueue = global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.aiQueue),
      );

      // Holds the continuation back so the run's fate is decided while it is still queued.
      const enqueue = jest
        .spyOn(aiQueue, 'add')
        .mockResolvedValueOnce(undefined);

      const response = await answer({ threadId });
      const [[continueJobName, continueJobData, continueJobOptions]] =
        enqueue.mock.calls;

      enqueue.mockRestore();

      expect(response.body.errors).toBeUndefined();
      expect(continueJobData).toMatchObject({
        workspaceId,
        suspensionId: expect.any(String),
        resumeCount: 0,
      });

      // The decision a parallel branch finishing in that window takes.
      await queue.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId,
          workflowRunId: runId,
          lastExecutedStepId: parallelBranch.id,
        },
        buildRunWorkflowJobOptions(runId),
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const queuedRun = await getRun(runId);

      expect(queuedRun.status).toBe('RUNNING');
      expect(queuedRun.state.stepInfos[agent.id].status).toBe('PENDING');

      // Delivered twice: the second finds the run already continued.
      await aiQueue.add(continueJobName, continueJobData, continueJobOptions);
      await aiQueue.add(continueJobName, continueJobData, continueJobOptions);

      const run = await waitForRun(runId, 'COMPLETED');

      expect(run.state.stepInfos[agent.id]).toMatchObject({
        status: 'SUCCESS',
        result: { response: 'Quote sent' },
      });
      expect(executeAgent).toHaveBeenCalledTimes(2);
    });

    it('refuses the answer, leaving the question open, when it cannot be recorded', async () => {
      mockAgent();
      const { runId, agent, threadId } = await startAskingRun();

      const recordToolCallAnswer = jest
        .spyOn(
          getAppProviderByClassName<AgentChatService>('AgentChatService'),
          'recordToolCallAnswer',
        )
        .mockRejectedValueOnce(new Error('Answer write failed'));

      const refused = await answer({ threadId });

      recordToolCallAnswer.mockRestore();

      expect(refused.body.errors).toBeDefined();
      expect((await getRun(runId)).state.stepInfos[agent.id]).toMatchObject({
        status: 'PENDING',
      });
      expect((await getConversation(threadId)).messages).toHaveLength(2);
      expect(await getToolCalls(threadId)).toEqual({
        isWaiting: true,
        calls: [{ toolCallId: 'ask-1', status: 'pending' }],
      });

      expect((await answer({ threadId })).body.errors).toBeUndefined();
      await waitForRun(runId, 'COMPLETED');
    });

    it('keeps the answer and fails the run, so it can be retried, when the agent continuation cannot be scheduled', async () => {
      mockAgent();
      const { runId, threadId } = await startAskingRun();

      const enqueue = jest
        .spyOn(
          global.app.get<MessageQueueService>(
            getQueueToken(MessageQueue.aiQueue),
          ),
          'add',
        )
        .mockRejectedValueOnce(new Error('Queue unavailable'));

      const failedAnswer = await answer({ threadId });

      enqueue.mockRestore();

      expect(failedAnswer.body.errors).toBeDefined();
      await waitForRun(runId, 'FAILED');
      expect((await getToolCalls(threadId)).calls).toMatchObject([
        { status: 'answered' },
      ]);
      expect(
        JSON.stringify((await answer({ threadId })).body.errors),
      ).toContain('TOOL_CALL_NOT_PENDING');
    });
  });

  it('stops a pending delay and ignores its later resume job', async () => {
    const finalStep = emptyStep();
    const delay: WorkflowAction = {
      ...emptyStep(),
      type: WorkflowActionType.DELAY,
      nextStepIds: [finalStep.id],
      settings: {
        ...settings,
        input: { delayType: 'DURATION', duration: { seconds: 2 } },
      },
    };
    const fixture = await createFixture({ steps: [delay, finalStep] });
    const runId = await runFixture(fixture);
    await waitForStep(runId, delay.id, 'PENDING');
    const response = await workflowGraphqlRequest(
      'mutation Stop($id: UUID!) { stopWorkflowRun(workflowRunId: $id) { id status } }',
      { id: runId },
    );

    expect(response.body.errors).toBeUndefined();
    await waitForRun(runId, 'STOPPED');
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const run = await getRun(runId);
    expect(run.status).toBe('STOPPED');
    expect(run.state.stepInfos[finalStep.id].status).toBe('NOT_STARTED');
  });

  it('retries the failed snapshot instead of the newly edited core version', async () => {
    const failedStep: WorkflowAction = {
      ...emptyStep(),
      type: WorkflowActionType.DELAY,
      settings: {
        ...settings,
        input: {
          delayType: 'SCHEDULED_DATE',
          scheduledDateTime: '2000-01-01T00:00:00.000Z',
        },
      },
    };
    const fixture = await createFixture({ steps: [failedStep] });
    const runId = await runFixture(fixture);
    const original = await waitForRun(runId, 'FAILED');
    await global.testDataSource.query(
      'UPDATE core."workflowVersion" SET steps = $2 WHERE id = $1',
      [fixture.coreWorkflowVersionId, JSON.stringify([emptyStep()])],
    );
    const response = await workflowGraphqlRequest(
      'mutation Retry($id: UUID!) { retryWorkflowRun(workflowRunId: $id) { id status } }',
      { id: runId },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.retryWorkflowRun.status).toBe('RUNNING');
    const retried = await waitForRun(runId, 'FAILED');
    expect(retried.state.flow).toEqual(original.state.flow);
    expect(retried.state.stepInfos[failedStep.id].status).toBe('FAILED');
  });

  it('records hard-throttled runs with their requested id and snapshot', async () => {
    const fixture = await createFixture();
    jest
      .spyOn(
        global.workflowTestServices.throttling,
        'throttleOrThrowIfHardLimitReached',
      )
      .mockRejectedValue(new Error('Throttle limit reached'));
    const run = await waitForRun(await runFixture(fixture), 'FAILED');

    expect(run.coreWorkflowVersionId).toBe(fixture.coreWorkflowVersionId);
    expect(run.state.flow.steps).toEqual(fixture.steps);
    expect(run.state.workflowRunError).toBe('Throttle limit reached');
  });

  it('leaves automated runs queued under the soft limit and drains them when capacity returns', async () => {
    const fixture = await createFixture({
      triggerType: 'WEBHOOK',
      triggerSettings: {
        httpMethod: 'POST',
        authentication: null,
        expectedBody: {},
      },
    });
    const capacity = jest
      .spyOn(
        global.workflowTestServices.throttling,
        'consumeRemainingRunsToEnqueueCount',
      )
      .mockResolvedValue(0);
    const runId = await runFixture(fixture);
    await waitForRun(runId, 'NOT_STARTED');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect((await getRun(runId)).status).toBe('NOT_STARTED');
    capacity.mockRestore();
    await global.app
      .get<MessageQueueService>(getQueueToken(MessageQueue.workflowQueue))
      .add('WorkflowRunEnqueueJob', { workspaceId, isCacheMode: false });
    await waitForRun(runId, 'COMPLETED');
  });

  it('fails the run when the subscription is inactive', async () => {
    const fixture = await createFixture();
    const subscriptionCheck = jest
      .spyOn(
        global.workflowTestServices.billing,
        'getSubscriptionInactiveReason',
      )
      .mockResolvedValue('WORKSPACE_SUSPENDED');
    const runId = await runFixture(fixture);
    const run = await waitForRun(runId, 'FAILED');
    expect(subscriptionCheck).toHaveBeenCalledWith(workspaceId);
    expect(run.coreWorkflowVersionId).toBe(fixture.coreWorkflowVersionId);
    expect(run.state.flow.steps).toEqual(fixture.steps);
  });

  it('fails the run when the subscription is inactive even if the step continues on failure', async () => {
    const step: WorkflowEmptyAction = {
      ...emptyStep(),
      settings: {
        ...settings,
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: true },
        },
      },
    };
    const fixture = await createFixture({ steps: [step] });

    jest
      .spyOn(
        global.workflowTestServices.billing,
        'getSubscriptionInactiveReason',
      )
      .mockResolvedValue('WORKSPACE_SUSPENDED');

    const run = await waitForRun(await runFixture(fixture), 'FAILED');

    expect(run.state.stepInfos[step.id].status).toBe('FAILED');
  });

  it('edits, activates and executes successive drafts', async () => {
    const fixture = await createFixture();

    for (const cycle of [1, 2, 3]) {
      const draftId = await createDraftFromCoreWorkflowVersion({
        coreWorkflowId: fixture.coreWorkflowId,
        coreWorkflowVersionIdToCopy: fixture.coreWorkflowVersionId,
      });

      fixture.coreWorkflowVersionId = draftId;
      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId: draftId,
        trigger: { ...fixture.trigger, name: `B-Async cycle ${cycle}` },
      });
      await activateCoreWorkflowVersion(draftId);

      const run = await waitForRun(await runFixture(fixture), 'COMPLETED');

      expect(run.coreWorkflowVersionId).toBe(draftId);
    }
  });

  it('keeps the published version executable when replacement activation fails', async () => {
    const fixture = await createFixture({
      status: 'DRAFT',
      triggerType: 'CRON',
      triggerSettings: { type: 'CUSTOM', pattern: '* * * * *' },
    });

    await activateCoreWorkflowVersion(fixture.coreWorkflowVersionId);

    const cache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.ModuleWorkflow,
    );
    const cronCacheKey = WORKFLOW_CRON_TRIGGER_CACHE_KEY;
    const originalCache = await cache.hashGetValues(cronCacheKey);
    const draftId = await createDraftFromCoreWorkflowVersion({
      coreWorkflowId: fixture.coreWorkflowId,
      coreWorkflowVersionIdToCopy: fixture.coreWorkflowVersionId,
    });
    const failure = jest
      .spyOn(
        getAppProviderByClassName<CodeStepBuildService>('CodeStepBuildService'),
        'switchCodeStepLogicFunctionsToPrebuilt',
      )
      .mockRejectedValueOnce(new Error('Replacement activation failure'));
    const response = await workflowGraphqlRequest(
      ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
      { coreWorkflowVersionId: draftId },
    );
    expect(response.body.errors).toBeDefined();
    expect(failure).toHaveBeenCalledTimes(1);
    failure.mockRestore();
    const [oldVersion] = await global.testDataSource.query(
      'SELECT status FROM core."workflowVersion" WHERE id = $1',
      [fixture.coreWorkflowVersionId],
    );
    const [newVersion] = await global.testDataSource.query(
      'SELECT status FROM core."workflowVersion" WHERE id = $1',
      [draftId],
    );
    const [workflow] = await global.testDataSource.query(
      'SELECT "lastPublishedCoreWorkflowVersionId" FROM core.workflow WHERE id = $1',
      [fixture.coreWorkflowId],
    );
    const { workflowAutomatedTriggerMaps } =
      await global.workflowTestServices.workspaceCache.getOrRecompute(
        workspaceId,
        ['workflowAutomatedTriggerMaps'],
      );
    expect(oldVersion.status).toBe('ACTIVE');
    expect(newVersion.status).toBe('DRAFT');
    expect(workflow.lastPublishedCoreWorkflowVersionId).toBe(
      fixture.coreWorkflowVersionId,
    );
    expect(
      workflowAutomatedTriggerMaps.byWorkflowId[fixture.coreWorkflowId],
    ).toMatchObject({ coreWorkflowVersionId: fixture.coreWorkflowVersionId });
    expect(await cache.hashGetValues(cronCacheKey)).toEqual(originalCache);
    await waitForRun(await runFixture(fixture), 'COMPLETED');
    await activateCoreWorkflowVersion(draftId);
    const versions = await global.testDataSource.query(
      'SELECT id, status FROM core."workflowVersion" WHERE "coreWorkflowId" = $1',
      [fixture.coreWorkflowId],
    );
    expect(versions).toEqual(
      expect.arrayContaining([
        { id: fixture.coreWorkflowVersionId, status: 'ARCHIVED' },
        { id: draftId, status: 'ACTIVE' },
      ]),
    );
  });

  it('rejects a draft edited while the core API prepares activation', async () => {
    const fixture = await createFixture({ status: 'DRAFT' });
    const codeBuild = getAppProviderByClassName<CodeStepBuildService>(
      'CodeStepBuildService',
    );
    let notifyPreparing: () => void = () => {};
    let releasePreparation: () => void = () => {};
    const preparing = new Promise<void>((resolve) => {
      notifyPreparing = resolve;
    });
    const prepared = new Promise<void>((resolve) => {
      releasePreparation = resolve;
    });
    const buildSpy = jest
      .spyOn(codeBuild, 'switchCodeStepLogicFunctionsToPrebuilt')
      .mockImplementationOnce(async () => {
        notifyPreparing();
        await prepared;
      });
    const activation = workflowGraphqlRequest(
      ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
      { coreWorkflowVersionId: fixture.coreWorkflowVersionId },
    ).then((response) => response);
    try {
      await preparing;
      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId: fixture.coreWorkflowVersionId,
        trigger: { ...fixture.trigger, name: 'Edited during activation' },
      });
    } finally {
      releasePreparation();
      buildSpy.mockRestore();
    }
    expect(JSON.stringify((await activation).body.errors)).toContain('changed');
    const [core] = await global.testDataSource.query(
      'SELECT status, triggers FROM core."workflowVersion" WHERE id = $1',
      [fixture.coreWorkflowVersionId],
    );
    expect(core.status).toBe('DRAFT');
    expect(core.triggers[0].name).toBe('Edited during activation');
  });

  it('rebuilds cron dispatch after a cache publication failure through the core API', async () => {
    const fixture = await createFixture({
      status: 'DRAFT',
      triggerType: 'CRON',
      triggerSettings: { type: 'CUSTOM', pattern: '* * * * *' },
    });
    const cache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.ModuleWorkflow,
    );
    await cache.hashSet({
      key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      field: 'b-async-rebuild-test',
      value: '{}',
    });
    const publication = jest
      .spyOn(cache, 'hashSetIfExists')
      .mockRejectedValueOnce(new Error('Cron cache publication failure'));
    await activateCoreWorkflowVersion(fixture.coreWorkflowVersionId);
    expect(publication).toHaveBeenCalledTimes(1);
    publication.mockRestore();
    expect(await cache.hashGetValues(WORKFLOW_CRON_TRIGGER_CACHE_KEY)).toEqual(
      [],
    );
    await global.workflowTestServices.cron.handle();
    const entries = await cache.hashGetValues(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
    expect(entries.map((entry) => JSON.parse(entry))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          coreWorkflowVersionId: fixture.coreWorkflowVersionId,
        }),
      ]),
    );
    for (let attempt = 0; attempt < 100; attempt++) {
      const runs = await global.testDataSource.query(
        `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [fixture.coreWorkflowId],
      );
      if (runs.length > 0) {
        await waitForRun(runs[0].id, 'COMPLETED');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
      'Rebuilt cron cache did not dispatch the activated workflow',
    );
  });

  it('rejects an overlapping builder edit without losing the successful edit and accepts a fresh retry', async () => {
    const fixture = await createFixture({ status: 'DRAFT' });
    const writer = getAppProviderByClassName<CoreWorkflowVersionWriteService>(
      'CoreWorkflowVersionWriteService',
    );
    const readDraft = writer.getValidatedDraftCoreWorkflowVersion.bind(writer);
    let releaseReads: () => void = () => {};
    const bothRead = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });
    let readCount = 0;
    const readSpy = jest
      .spyOn(writer, 'getValidatedDraftCoreWorkflowVersion')
      .mockImplementation(async (input) => {
        const result = await readDraft(input);
        if (input.coreWorkflowVersionId === fixture.coreWorkflowVersionId) {
          readCount++;
          if (readCount === 2) {
            releaseReads();
          }
          await bothRead;
        }
        return result;
      });
    const edits = [
      () =>
        workflowGraphqlRequest(UPDATE_CORE_WORKFLOW_VERSION_TRIGGER_MUTATION, {
          input: {
            coreWorkflowVersionId: fixture.coreWorkflowVersionId,
            trigger: { ...fixture.trigger, name: 'Concurrent trigger edit' },
          },
        }),
      () =>
        workflowGraphqlRequest(
          'mutation Edit($input: UpdateCoreWorkflowVersionPositionsInput!) { updateCoreWorkflowVersionPositions(input: $input) }',
          {
            input: {
              coreWorkflowVersionId: fixture.coreWorkflowVersionId,
              positions: [
                { id: fixture.steps[0].id, position: { x: 321, y: 654 } },
              ],
            },
          },
        ),
    ];
    const results = await Promise.all(edits.map((edit) => edit()));
    readSpy.mockRestore();
    expect(results.filter((response) => !response.body.errors)).toHaveLength(1);
    const failedIndex = results.findIndex((response) => response.body.errors);
    expect(JSON.stringify(results[failedIndex].body.errors)).toContain(
      'changed',
    );
    expect((await edits[failedIndex]()).body.errors).toBeUndefined();
    const [core] = await global.testDataSource.query(
      'SELECT triggers, steps FROM core."workflowVersion" WHERE id = $1',
      [fixture.coreWorkflowVersionId],
    );
    expect(core.triggers[0].name).toBe('Concurrent trigger edit');
    expect(core.steps[0].position).toEqual({ x: 321, y: 654 });
  });

  it('fires a core database-event workflow from a real record creation', async () => {
    const fixture = await createFixture({
      triggerType: 'DATABASE_EVENT',
      triggerSettings: { eventName: 'company.created' },
    });
    const response = await workflowGraphqlRequest(
      'mutation { createCompany(data: { name: "B-Async event" }) { id } }',
    );
    expect(response.body.errors).toBeUndefined();
    const companyId = response.body.data.createCompany.id;
    try {
      for (let attempt = 0; attempt < 100; attempt++) {
        const [run] = await global.testDataSource.query(
          `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
          [fixture.coreWorkflowId],
        );
        if (run) {
          await waitForRun(run.id, 'COMPLETED');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('Database event did not start the core workflow');
    } finally {
      const cleanup = await workflowGraphqlRequest(
        'mutation Destroy($id: UUID!) { destroyCompany(id: $id) { id } }',
        { id: companyId },
      );
      expect(cleanup.body.errors).toBeUndefined();
    }
  });

  it.each(['ARCHIVED', 'DRAFT'])(
    'drops queued versions that are %s',
    async (status) => {
      const fixture = await createFixture();
      await global.testDataSource.query(
        'UPDATE core."workflowVersion" SET status = $2 WHERE id = $1',
        [fixture.coreWorkflowVersionId, status],
      );
      await (
        await global.workflowTestServices.triggerJob()
      ).handle({
        workspaceId,
        workflowId: fixture.coreWorkflowId,
        coreWorkflowVersionId: fixture.coreWorkflowVersionId,
        payload: {},
      });
      const runs = await global.testDataSource.query(
        `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [fixture.coreWorkflowId],
      );
      expect(runs).toHaveLength(0);
    },
  );

  it('uses the queued core version even when the latest published pointer changes', async () => {
    const fixture = await createFixture();
    const latestVersionId = randomUUID();
    await global.testDataSource.query(
      `INSERT INTO core."workflowVersion" (id, "workspaceId", "applicationId", "universalIdentifier", "coreWorkflowId", status, triggers, steps)
       SELECT $2, "workspaceId", "applicationId", $2, "coreWorkflowId", 'DEACTIVATED', triggers, '[]'::jsonb FROM core."workflowVersion" WHERE id = $1`,
      [fixture.coreWorkflowVersionId, latestVersionId],
    );
    await global.testDataSource.query(
      'UPDATE core.workflow SET "lastPublishedCoreWorkflowVersionId" = $2 WHERE id = $1',
      [fixture.coreWorkflowId, latestVersionId],
    );
    await refreshWorkflowCaches();
    await (
      await global.workflowTestServices.triggerJob()
    ).handle({
      workspaceId,
      workflowId: fixture.coreWorkflowId,
      coreWorkflowVersionId: fixture.coreWorkflowVersionId,
      payload: {},
    });
    const [created] = await global.testDataSource.query(
      `SELECT id FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
      [fixture.coreWorkflowId],
    );
    const run = await waitForRun(created.id, 'COMPLETED');
    expect(run.coreWorkflowVersionId).toBe(fixture.coreWorkflowVersionId);
    expect(run.state.flow.steps).toEqual(fixture.steps);
  });

  it('provisions a fresh workspace with linked core workflows and versions', async () => {
    const services = global.workflowTestServices;
    const freshWorkspaceId = randomUUID();
    const applicationId = randomUUID();
    const users =
      services.coreDataSource.getRepository<UserEntity>('UserEntity');
    const user = await users.findOneByOrFail({ id: USER_DATA_SEED_IDS.JANE });
    const workspaces =
      services.coreDataSource.getRepository<WorkspaceEntity>('WorkspaceEntity');
    try {
      const workspace = await services.coreDataSource.transaction(
        async (manager) => {
          const workspace = await manager
            .getRepository<WorkspaceEntity>('WorkspaceEntity')
            .save({
              id: freshWorkspaceId,
              displayName: 'B-Async fresh workspace',
              subdomain: `b-async-${freshWorkspaceId.slice(0, 8)}`,
              inviteHash: randomUUID(),
              activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
              workspaceCustomApplicationId: applicationId,
            });
          const application =
            await services.application.createWorkspaceCustomApplication(
              { workspaceId: freshWorkspaceId, applicationId },
              manager.queryRunner,
            );
          await services.userWorkspace.create(
            {
              userId: user.id,
              workspaceId: freshWorkspaceId,
              isExistingUser: true,
              applicationUniversalIdentifier: application.universalIdentifier,
              locale: user.locale,
            },
            manager.queryRunner,
          );
          return workspace;
        },
      );
      await services.workspace.activateWorkspace(
        {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          deletedAt: user.deletedAt?.toISOString() ?? null,
        },
        workspace,
      );
      const {
        coreQuickLeadWorkflowId,
        coreQuickLeadWorkflowVersionId,
        coreCreateCompanyWorkflowId,
        coreCreateCompanyWorkflowVersionId,
      } = getWorkflowPrefillIds(freshWorkspaceId);
      const versions = await global.testDataSource.query(
        `SELECT cv.id, cv."coreWorkflowId", cw."lastPublishedCoreWorkflowVersionId"
         FROM core."workflowVersion" cv
         JOIN core.workflow cw ON cw.id = cv."coreWorkflowId" AND cw."workspaceId" = $1
         WHERE cv."workspaceId" = $1 AND cv.id = ANY($2::uuid[])`,
        [
          freshWorkspaceId,
          [coreQuickLeadWorkflowVersionId, coreCreateCompanyWorkflowVersionId],
        ],
      );
      expect(versions).toHaveLength(2);
      expect(versions).toEqual(
        expect.arrayContaining([
          {
            id: coreQuickLeadWorkflowVersionId,
            coreWorkflowId: coreQuickLeadWorkflowId,
            lastPublishedCoreWorkflowVersionId: coreQuickLeadWorkflowVersionId,
          },
          {
            id: coreCreateCompanyWorkflowVersionId,
            coreWorkflowId: coreCreateCompanyWorkflowId,
            lastPublishedCoreWorkflowVersionId:
              coreCreateCompanyWorkflowVersionId,
          },
        ]),
      );
    } finally {
      if (await workspaces.existsBy({ id: freshWorkspaceId })) {
        await services.workspace.deleteWorkspace(freshWorkspaceId);
      }
    }
  }, 180_000);
});
