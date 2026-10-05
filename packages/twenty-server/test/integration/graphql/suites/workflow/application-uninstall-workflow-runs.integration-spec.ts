import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationManifest,
  buildTestApplicationWorkflow,
  countTestCompanies,
  createCompanyStep,
  createOpportunityStep,
  delayStep,
  findTestWorkflowRun,
  findTestWorkflowVersionId,
  formStep,
  logicFunctionStep,
  runCoreWorkflowVersion,
  type TestApplicationWorkflow,
  waitForTestWorkflowRun,
  waitForTestWorkflowRunToEnd,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey, FieldActorSource } from 'twenty-shared/types';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type DeleteWorkflowActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workflow/services/delete-workflow-action-handler.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { ResumeDelayedWorkflowJob } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/jobs/resume-delayed-workflow.job';
import { StopDeletedWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/jobs/stop-deleted-workflow-runs.job';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PREFIX = `Uninstalled app workflow ${randomUUID()}`;
const APP_ID = randomUUID();
const OTHER_APP_ID = randomUUID();
const FUNCTION_ID = randomUUID();

const FORM_COMPANY = `${PREFIX} form company`;
const DELAYED_COMPANY = `${PREFIX} delayed company`;
const SLOW_COMPANY = `${PREFIX} slow company`;

const FORM_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} form`, [
  formStep(),
  createCompanyStep(FORM_COMPANY),
]);
const DELAY_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} delay`, [
  delayStep(55),
  createCompanyStep(DELAYED_COMPANY),
]);
const SLOW_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} slow`, [
  logicFunctionStep(FUNCTION_ID),
  createCompanyStep(SLOW_COMPANY),
]);
const COMPLETED_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} completed`, [
  createCompanyStep(`${PREFIX} completed company`),
]);
const FAILING_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} failing`, [
  createOpportunityStep(`${PREFIX} opportunity`),
]);
const OTHER_APP_FORM_WORKFLOW = buildTestApplicationWorkflow(
  `${PREFIX} other app form`,
  [formStep(), createCompanyStep(`${PREFIX} other app company`)],
);

const WORKFLOWS = [
  FORM_WORKFLOW,
  DELAY_WORKFLOW,
  SLOW_WORKFLOW,
  COMPLETED_WORKFLOW,
  FAILING_WORKFLOW,
];

const createdWorkflowRunIds: string[] = [];
const versionIdByWorkflowIdentifier = new Map<string, string>();

const installApplication = async (
  applicationUniversalIdentifier: string,
  workflows: TestApplicationWorkflow[],
) => {
  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name: `${PREFIX} ${applicationUniversalIdentifier}`,
    description: 'Application whose workflow runs are stopped on uninstall',
    sourcePath: `application-uninstall-workflow-runs-${applicationUniversalIdentifier}`,
  });

  const installation = await syncApplication({
    manifest: buildTestApplicationManifest({
      applicationUniversalIdentifier,
      roleUniversalIdentifier: randomUUID(),
      companyPermissionUniversalIdentifier: randomUUID(),
      logicFunctionUniversalIdentifier:
        applicationUniversalIdentifier === APP_ID ? FUNCTION_ID : randomUUID(),
      workflows,
    }),
  });

  expect(installation.errors).toBeUndefined();

  for (const workflow of workflows) {
    const versionId = await findTestWorkflowVersionId({
      applicationUniversalIdentifier,
      workflow,
    });

    if (versionId === undefined) {
      throw new Error(`${workflow.name} was not installed`);
    }

    versionIdByWorkflowIdentifier.set(workflow.universalIdentifier, versionId);
  }
};

const runWorkflow = async (
  workflow: TestApplicationWorkflow,
): Promise<string> => {
  const response = await runCoreWorkflowVersion(
    versionIdByWorkflowIdentifier.get(workflow.universalIdentifier) ?? '',
  );

  expect(response.body.errors).toBeUndefined();

  const workflowRunId = response.body.data.runCoreWorkflowVersion.workflowRunId;

  createdWorkflowRunIds.push(workflowRunId);

  return workflowRunId;
};

const waitForFirstStepPending = (
  workflowRunId: string,
  workflow: TestApplicationWorkflow,
) =>
  waitForTestWorkflowRun(
    workflowRunId,
    ({ state }) =>
      state?.stepInfos?.[workflow.steps[0].universalIdentifier]?.status ===
      'PENDING',
  );

const expectWaiting = async (
  workflowRunId: string,
  workflow: TestApplicationWorkflow,
) => {
  const workflowRun = await findTestWorkflowRun(workflowRunId);

  expect(workflowRun.status).toBe(WorkflowRunStatus.RUNNING);
  expect(
    workflowRun.state.stepInfos[workflow.steps[0].universalIdentifier].status,
  ).toBe('PENDING');
};

describe('uninstalling an application with unfinished workflow runs', () => {
  let formRunId: string;
  let delayRunId: string;
  let slowRunId: string;
  let queuedRunId: string;
  let completedRunId: string;
  let failedRunId: string;
  let otherAppRunId: string;
  let releaseFunction: () => void = () => {};
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: true,
      expectToFail: false,
    });

    await installApplication(APP_ID, WORKFLOWS);
    await installApplication(OTHER_APP_ID, [OTHER_APP_FORM_WORKFLOW]);
    jest.useRealTimers();

    executeSpy = jest
      .spyOn(
        getAppProviderByClassName<LogicFunctionExecutorService>(
          'LogicFunctionExecutorService',
        ),
        'execute',
      )
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            releaseFunction = () =>
              resolve({
                data: { greeted: true },
                duration: 1,
                billedDurationMs: 1,
                logs: '',
                status: LogicFunctionExecutionStatus.SUCCESS,
              });
          }),
      );

    formRunId = await runWorkflow(FORM_WORKFLOW);
    otherAppRunId = await runWorkflow(OTHER_APP_FORM_WORKFLOW);
    completedRunId = await runWorkflow(COMPLETED_WORKFLOW);
    failedRunId = await runWorkflow(FAILING_WORKFLOW);

    await waitForFirstStepPending(formRunId, FORM_WORKFLOW);
    await waitForFirstStepPending(otherAppRunId, OTHER_APP_FORM_WORKFLOW);
    expect((await waitForTestWorkflowRunToEnd(completedRunId)).status).toBe(
      WorkflowRunStatus.COMPLETED,
    );
    expect((await waitForTestWorkflowRunToEnd(failedRunId)).status).toBe(
      WorkflowRunStatus.FAILED,
    );

    const [definition] = await globalThis.testDataSource.query(
      `SELECT w.id AS "workflowId", v.id AS "versionId", v.triggers->0 AS trigger, v.steps
       FROM core.workflow w JOIN core."workflowVersion" v ON v."coreWorkflowId" = w.id
       WHERE v.id = $1`,
      [versionIdByWorkflowIdentifier.get(FORM_WORKFLOW.universalIdentifier)],
    );

    queuedRunId = await getAppProviderByClassName<WorkflowRunWorkspaceService>(
      'WorkflowRunWorkspaceService',
    ).createCoreWorkflowRun({
      coreWorkflowId: definition.workflowId,
      coreWorkflowVersionId: definition.versionId,
      workspaceWorkflowId: null,
      workspaceWorkflowVersionId: null,
      workflowName: FORM_WORKFLOW.name,
      trigger: definition.trigger,
      steps: definition.steps,
      createdBy: {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: null,
        name: 'Integration test',
        context: {},
      },
      status: WorkflowRunStatus.ENQUEUED,
      triggerPayload: {},
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    createdWorkflowRunIds.push(queuedRunId);
  }, 180000);

  afterAll(async () => {
    releaseFunction();
    executeSpy?.mockRestore();
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
      [createdWorkflowRunIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."company" WHERE name LIKE $1`,
      [`${PREFIX}%`],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APP_ID,
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: false,
      expectToFail: false,
    });
    jest.useFakeTimers();
  });

  it('stops the unfinished runs of every workflow only once the uninstall succeeds', async () => {
    delayRunId = await runWorkflow(DELAY_WORKFLOW);
    await waitForFirstStepPending(delayRunId, DELAY_WORKFLOW);

    try {
      slowRunId = await runWorkflow(SLOW_WORKFLOW);
      await waitForTestWorkflowRun(
        slowRunId,
        () => executeSpy.mock.calls.length > 0,
      );

      const deleteWorkflowActionHandler =
        getAppProviderByClassName<DeleteWorkflowActionHandlerService>(
          'DeleteWorkflowActionHandlerService',
        );
      const deleteWorkflow =
        deleteWorkflowActionHandler.executeForMetadata.bind(
          deleteWorkflowActionHandler,
        );
      const deleteSpy = jest
        .spyOn(deleteWorkflowActionHandler, 'executeForMetadata')
        .mockImplementationOnce(async (context) => {
          await deleteWorkflow(context);
          throw new Error(
            'Simulated uninstall failure after a workflow delete',
          );
        });

      try {
        const failedUninstall = await uninstallApplication({
          universalIdentifier: APP_ID,
          expectToFail: true,
        });

        expect(failedUninstall.errors).toBeDefined();
        expect(deleteSpy).toHaveBeenCalled();
      } finally {
        deleteSpy.mockRestore();
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await expectWaiting(formRunId, FORM_WORKFLOW);
      await expectWaiting(delayRunId, DELAY_WORKFLOW);
      expect((await findTestWorkflowRun(slowRunId)).status).toBe(
        WorkflowRunStatus.RUNNING,
      );

      const finishedRunsBefore = await Promise.all(
        [completedRunId, failedRunId].map(findTestWorkflowRun),
      );

      const uninstall = await uninstallApplication({
        universalIdentifier: APP_ID,
      });

      expect(uninstall.errors).toBeUndefined();

      for (const workflowRunId of [formRunId, delayRunId, queuedRunId]) {
        expect((await waitForTestWorkflowRunToEnd(workflowRunId)).status).toBe(
          WorkflowRunStatus.STOPPED,
        );
      }

      expect(
        (
          await waitForTestWorkflowRun(
            slowRunId,
            ({ status }) => status === WorkflowRunStatus.STOPPING,
          )
        ).status,
      ).toBe(WorkflowRunStatus.STOPPING);

      releaseFunction();

      const slowRun = await waitForTestWorkflowRunToEnd(slowRunId);

      expect(slowRun.status).toBe(WorkflowRunStatus.STOPPED);
      expect(
        slowRun.state.stepInfos[SLOW_WORKFLOW.steps[1].universalIdentifier]
          .status,
      ).toBe('NOT_STARTED');
      expect(await countTestCompanies(SLOW_COMPANY)).toBe(0);

      expect(
        await Promise.all(
          [completedRunId, failedRunId].map(findTestWorkflowRun),
        ),
      ).toEqual(finishedRunsBefore);
      await expectWaiting(otherAppRunId, OTHER_APP_FORM_WORKFLOW);

      const [{ count }] = await globalThis.testDataSource.query(
        `SELECT COUNT(*)::int AS count FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
        [createdWorkflowRunIds],
      );

      expect(count).toBe(createdWorkflowRunIds.length);
    } finally {
      releaseFunction();
    }
  }, 150000);

  it('does not revive stopped runs from delayed jobs, form answers or queued jobs', async () => {
    const stoppedRunsBefore = await Promise.all(
      [formRunId, delayRunId, queuedRunId].map(findTestWorkflowRun),
    );

    await (
      await global.app.resolve(ResumeDelayedWorkflowJob)
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: delayRunId,
      stepId: DELAY_WORKFLOW.steps[0].universalIdentifier,
    });

    const formAnswer = await submitFormStep({
      workflowRunId: formRunId,
      stepId: FORM_WORKFLOW.steps[0].universalIdentifier,
      response: { note: 'Too late' },
    });

    expect(formAnswer.body.errors).toBeDefined();

    const runJob = await global.workflowTestServices.runJob();

    await runJob.handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: delayRunId,
      lastExecutedStepId: DELAY_WORKFLOW.steps[0].universalIdentifier,
    });
    await runJob.handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: queuedRunId,
    });

    expect(
      await Promise.all(
        [formRunId, delayRunId, queuedRunId].map(findTestWorkflowRun),
      ),
    ).toEqual(stoppedRunsBefore);
    expect(await countTestCompanies(FORM_COMPANY)).toBe(0);
    expect(await countTestCompanies(DELAYED_COMPANY)).toBe(0);
  }, 120000);

  it('repeats the cleanup without changing any run', async () => {
    const runIds = [
      formRunId,
      delayRunId,
      queuedRunId,
      slowRunId,
      completedRunId,
      failedRunId,
      otherAppRunId,
    ];
    const runsBefore = await Promise.all(runIds.map(findTestWorkflowRun));
    const [{ coreWorkflowIds }] = await globalThis.testDataSource.query(
      `SELECT array_agg(DISTINCT "coreWorkflowId") AS "coreWorkflowIds"
       FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
      [[formRunId, delayRunId, slowRunId, completedRunId, failedRunId]],
    );

    await (
      await global.app.resolve(StopDeletedWorkflowRunsJob)
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      coreWorkflowIds,
    });

    expect(await Promise.all(runIds.map(findTestWorkflowRun))).toEqual(
      runsBefore,
    );
  }, 120000);
});
