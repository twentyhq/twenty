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
  logicFunctionStep,
  runCoreWorkflowVersion,
  type TestApplicationWorkflow,
  waitForTestWorkflowRun,
  waitForTestWorkflowRunToEnd,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
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
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { ResumeDelayedWorkflowJob } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/jobs/resume-delayed-workflow.job';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PREFIX = `Deleted app workflow ${randomUUID()}`;
const APP_ID = randomUUID();
const ROLE_ID = randomUUID();
const COMPANY_PERMISSION_ID = randomUUID();
const FUNCTION_ID = randomUUID();

const DELAYED_COMPANY = `${PREFIX} delayed company`;
const SLOW_COMPANY = `${PREFIX} slow company`;

const DELAY_THEN_CREATE_WORKFLOW = buildTestApplicationWorkflow(
  `${PREFIX} delay then create`,
  [delayStep(45), createCompanyStep(DELAYED_COMPANY)],
);
const DELAY_ONLY_WORKFLOW = buildTestApplicationWorkflow(
  `${PREFIX} delay only`,
  [delayStep(45)],
);
const SLOW_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} slow`, [
  logicFunctionStep(FUNCTION_ID),
  createCompanyStep(SLOW_COMPANY),
]);
const FAILING_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} failing`, [
  createOpportunityStep(`${PREFIX} opportunity`),
]);

const WORKFLOWS = [
  DELAY_THEN_CREATE_WORKFLOW,
  DELAY_ONLY_WORKFLOW,
  SLOW_WORKFLOW,
  FAILING_WORKFLOW,
];

const createdWorkflowRunIds: string[] = [];
const versionIdByWorkflowIdentifier = new Map<string, string>();

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

const resumeDelay = async (
  workflowRunId: string,
  workflow: TestApplicationWorkflow,
) =>
  (await global.app.resolve(ResumeDelayedWorkflowJob)).handle({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    workflowRunId,
    stepId: workflow.steps[0].universalIdentifier,
  });

describe('runs of an application workflow that was deleted', () => {
  let delayThenCreateRunId: string;
  let delayOnlyRunId: string;
  let slowRunId: string;
  let failedRunId: string;
  let enqueuedRunId: string;
  let releaseFunction: () => void = () => {};
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Deleted application workflow runs',
      description: 'Application uninstalled while its runs are unfinished',
      sourcePath: 'deleted-application-workflow-runs',
    });
    jest.useRealTimers();

    const installation = await syncApplication({
      manifest: buildTestApplicationManifest({
        applicationUniversalIdentifier: APP_ID,
        roleUniversalIdentifier: ROLE_ID,
        companyPermissionUniversalIdentifier: COMPANY_PERMISSION_ID,
        logicFunctionUniversalIdentifier: FUNCTION_ID,
        workflows: WORKFLOWS,
      }),
    });

    expect(installation.errors).toBeUndefined();

    for (const workflow of WORKFLOWS) {
      const versionId = await findTestWorkflowVersionId({
        applicationUniversalIdentifier: APP_ID,
        workflow,
      });

      if (versionId === undefined) {
        throw new Error(`${workflow.name} was not installed`);
      }

      versionIdByWorkflowIdentifier.set(
        workflow.universalIdentifier,
        versionId,
      );
    }

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

    delayThenCreateRunId = await runWorkflow(DELAY_THEN_CREATE_WORKFLOW);
    delayOnlyRunId = await runWorkflow(DELAY_ONLY_WORKFLOW);
    failedRunId = await runWorkflow(FAILING_WORKFLOW);

    for (const workflowRunId of [delayThenCreateRunId, delayOnlyRunId]) {
      await waitForTestWorkflowRun(workflowRunId, ({ state }) =>
        Object.values(state?.stepInfos ?? {}).some(
          ({ status }) => status === 'PENDING',
        ),
      );
    }
    expect((await waitForTestWorkflowRunToEnd(failedRunId)).status).toBe(
      WorkflowRunStatus.FAILED,
    );

    slowRunId = await runWorkflow(SLOW_WORKFLOW);
    await waitForTestWorkflowRun(
      slowRunId,
      () => executeSpy.mock.calls.length > 0,
    );

    const stop = await workflowGraphqlRequest(
      'mutation Stop($workflowRunId: UUID!) { stopWorkflowRun(workflowRunId: $workflowRunId) { status } }',
      { workflowRunId: slowRunId },
    );

    expect(stop.body.data.stopWorkflowRun.status).toBe(
      WorkflowRunStatus.STOPPING,
    );

    const [definition] = await globalThis.testDataSource.query(
      `SELECT w.id AS "workflowId", v.id AS "versionId", v.triggers->0 AS trigger, v.steps
       FROM core.workflow w JOIN core."workflowVersion" v ON v."coreWorkflowId" = w.id
       WHERE v.id = $1`,
      [
        versionIdByWorkflowIdentifier.get(
          DELAY_THEN_CREATE_WORKFLOW.universalIdentifier,
        ),
      ],
    );

    enqueuedRunId =
      await getAppProviderByClassName<WorkflowRunWorkspaceService>(
        'WorkflowRunWorkspaceService',
      ).createCoreWorkflowRun({
        coreWorkflowId: definition.workflowId,
        coreWorkflowVersionId: definition.versionId,
        workspaceWorkflowId: null,
        workspaceWorkflowVersionId: null,
        workflowName: DELAY_THEN_CREATE_WORKFLOW.name,
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
    createdWorkflowRunIds.push(enqueuedRunId);

    const uninstall = await uninstallApplication({
      universalIdentifier: APP_ID,
    });

    expect(uninstall.errors).toBeUndefined();
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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: false,
      expectToFail: false,
    });
    jest.useFakeTimers();
  });

  it('lets a stopping run finish its executing step and end STOPPED', async () => {
    releaseFunction();

    const workflowRun = await waitForTestWorkflowRunToEnd(slowRunId);

    expect(workflowRun.status).toBe(WorkflowRunStatus.STOPPED);
    expect(
      workflowRun.state.stepInfos[SLOW_WORKFLOW.steps[0].universalIdentifier]
        .status,
    ).toBe('SUCCESS');
    expect(
      workflowRun.state.stepInfos[SLOW_WORKFLOW.steps[1].universalIdentifier]
        .status,
    ).toBe('NOT_STARTED');
    expect(await countTestCompanies(SLOW_COMPANY)).toBe(0);
  }, 120000);

  it('stops a run when its next step would execute', async () => {
    await resumeDelay(delayThenCreateRunId, DELAY_THEN_CREATE_WORKFLOW);

    const workflowRun = await waitForTestWorkflowRunToEnd(delayThenCreateRunId);

    expect(workflowRun.status).toBe(WorkflowRunStatus.STOPPED);
    expect(
      workflowRun.state.stepInfos[
        DELAY_THEN_CREATE_WORKFLOW.steps[1].universalIdentifier
      ].status,
    ).toBe('NOT_STARTED');
    expect(await countTestCompanies(DELAYED_COMPANY)).toBe(0);
  }, 120000);

  it('stops a run instead of completing it when its last waiting step resumes', async () => {
    await resumeDelay(delayOnlyRunId, DELAY_ONLY_WORKFLOW);

    expect((await waitForTestWorkflowRunToEnd(delayOnlyRunId)).status).toBe(
      WorkflowRunStatus.STOPPED,
    );
  }, 120000);

  it('stops a queued run when it starts', async () => {
    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: enqueuedRunId,
    });

    const workflowRun = await findTestWorkflowRun(enqueuedRunId);

    expect(workflowRun.status).toBe(WorkflowRunStatus.STOPPED);
    expect(
      workflowRun.state.stepInfos[
        DELAY_THEN_CREATE_WORKFLOW.steps[0].universalIdentifier
      ].status,
    ).toBe('NOT_STARTED');
  }, 120000);

  it('refuses to retry a failed run and leaves its history untouched', async () => {
    const failedRunBefore = await findTestWorkflowRun(failedRunId);

    const retry = await workflowGraphqlRequest(
      'mutation Retry($workflowRunId: UUID!) { retryWorkflowRun(workflowRunId: $workflowRunId) { status } }',
      { workflowRunId: failedRunId },
    );

    expect(retry.body.errors?.[0]?.message).toContain('no longer exists');
    expect(await findTestWorkflowRun(failedRunId)).toEqual(failedRunBefore);
  }, 120000);
});
