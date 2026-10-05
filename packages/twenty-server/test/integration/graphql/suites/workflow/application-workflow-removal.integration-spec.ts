import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationManifest,
  buildTestApplicationWorkflow,
  countCoreWorkflows,
  countTestCompanies,
  countTestWorkflowRuns,
  createCompanyStep,
  findTestWorkflowRun,
  findTestWorkflowVersionId,
  formStep,
  logicFunctionStep,
  runCoreWorkflowVersion,
  type TestApplicationWorkflow,
  waitForTestWorkflowRun,
  waitForTestWorkflowRunsToBeDeleted,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type DeleteWorkflowActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workflow/services/delete-workflow-action-handler.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PREFIX = `Removed app workflow ${randomUUID()}`;
const APP_ID = randomUUID();
const ROLE_ID = randomUUID();
const COMPANY_PERMISSION_ID = randomUUID();
const FUNCTION_ID = randomUUID();

const KEPT_COMPANY = `${PREFIX} kept company`;

const FORM_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} form`, [
  formStep(),
  createCompanyStep(`${PREFIX} form company`),
]);
const SECOND_FORM_WORKFLOW = buildTestApplicationWorkflow(
  `${PREFIX} second form`,
  [
    formStep(),
    logicFunctionStep(FUNCTION_ID),
    createCompanyStep(`${PREFIX} second form company`),
  ],
);
const KEPT_WORKFLOW = buildTestApplicationWorkflow(`${PREFIX} kept`, [
  formStep(),
  createCompanyStep(KEPT_COMPANY),
]);

const buildManifest = (workflows: TestApplicationWorkflow[]) =>
  buildTestApplicationManifest({
    applicationUniversalIdentifier: APP_ID,
    roleUniversalIdentifier: ROLE_ID,
    companyPermissionUniversalIdentifier: COMPANY_PERMISSION_ID,
    logicFunctionUniversalIdentifier: FUNCTION_ID,
    workflows,
  });

const createdWorkflowRunIds: string[] = [];
const versionIdByWorkflowIdentifier = new Map<string, string>();

const runWorkflowAndWaitForFirstStep = async (
  workflow: TestApplicationWorkflow,
): Promise<string> => {
  const response = await runCoreWorkflowVersion(
    versionIdByWorkflowIdentifier.get(workflow.universalIdentifier) ?? '',
  );

  expect(response.body.errors).toBeUndefined();

  const workflowRunId = response.body.data.runCoreWorkflowVersion.workflowRunId;

  createdWorkflowRunIds.push(workflowRunId);

  await waitForTestWorkflowRun(
    workflowRunId,
    ({ state }) =>
      state?.stepInfos?.[workflow.steps[0].universalIdentifier]?.status ===
      'PENDING',
  );

  return workflowRunId;
};

const expectWaiting = async (
  workflowRunId: string,
  workflow: TestApplicationWorkflow,
) => {
  const workflowRun = await findTestWorkflowRun(workflowRunId);

  expect(workflowRun?.status).toBe(WorkflowRunStatus.RUNNING);
  expect(
    workflowRun?.state.stepInfos[workflow.steps[0].universalIdentifier]?.status,
  ).toBe('PENDING');
};

describe('removing workflows from an application manifest', () => {
  let formRunId: string;
  let secondFormRunId: string;
  let keptRunId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Application workflow removal',
      description: 'Application whose workflows are removed from its manifest',
      sourcePath: 'application-workflow-removal',
    });
    jest.useRealTimers();

    const installation = await syncApplication({
      manifest: buildManifest([
        FORM_WORKFLOW,
        SECOND_FORM_WORKFLOW,
        KEPT_WORKFLOW,
      ]),
    });

    expect(installation.errors).toBeUndefined();

    for (const workflow of [
      FORM_WORKFLOW,
      SECOND_FORM_WORKFLOW,
      KEPT_WORKFLOW,
    ]) {
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

    formRunId = await runWorkflowAndWaitForFirstStep(FORM_WORKFLOW);
    secondFormRunId =
      await runWorkflowAndWaitForFirstStep(SECOND_FORM_WORKFLOW);
    keptRunId = await runWorkflowAndWaitForFirstStep(KEPT_WORKFLOW);
  }, 180000);

  afterAll(async () => {
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

  it('leaves runs alone when an update keeps every workflow', async () => {
    const update = await syncApplication({
      manifest: buildManifest([
        FORM_WORKFLOW,
        SECOND_FORM_WORKFLOW,
        { ...KEPT_WORKFLOW, name: `${KEPT_WORKFLOW.name} renamed` },
      ]),
    });

    expect(update.errors).toBeUndefined();
    await expectWaiting(formRunId, FORM_WORKFLOW);
    await expectWaiting(secondFormRunId, SECOND_FORM_WORKFLOW);
    await expectWaiting(keptRunId, KEPT_WORKFLOW);
  }, 120000);

  it('keeps workflows and runs when the removal fails after deleting a workflow', async () => {
    const deleteWorkflowActionHandler =
      getAppProviderByClassName<DeleteWorkflowActionHandlerService>(
        'DeleteWorkflowActionHandlerService',
      );
    const deleteWorkflow = deleteWorkflowActionHandler.executeForMetadata.bind(
      deleteWorkflowActionHandler,
    );
    const deleteSpy = jest
      .spyOn(deleteWorkflowActionHandler, 'executeForMetadata')
      .mockImplementationOnce(async (context) => {
        await deleteWorkflow(context);
        throw new Error('Simulated sync failure after a workflow delete');
      });

    try {
      const failedRemoval = await syncApplication({
        manifest: buildManifest([KEPT_WORKFLOW]),
        expectToFail: true,
      });

      expect(failedRemoval.errors).toBeDefined();
    } finally {
      deleteSpy.mockRestore();
    }

    expect(await countCoreWorkflows(FORM_WORKFLOW)).toBe(1);
    expect(await countCoreWorkflows(SECOND_FORM_WORKFLOW)).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await expectWaiting(formRunId, FORM_WORKFLOW);
    await expectWaiting(secondFormRunId, SECOND_FORM_WORKFLOW);
  }, 120000);

  it('deletes the omitted workflows with their version and runs, and keeps the application function', async () => {
    const removal = await syncApplication({
      manifest: buildManifest([KEPT_WORKFLOW]),
    });

    expect(removal.errors).toBeUndefined();

    for (const workflow of [FORM_WORKFLOW, SECOND_FORM_WORKFLOW]) {
      expect(await countCoreWorkflows(workflow)).toBe(0);
      expect(
        await findTestWorkflowVersionId({
          applicationUniversalIdentifier: APP_ID,
          workflow,
        }),
      ).toBeUndefined();
    }

    await waitForTestWorkflowRunsToBeDeleted([formRunId, secondFormRunId]);

    expect(await countTestWorkflowRuns([keptRunId])).toBe(1);

    const [{ count: applicationFunctionCount }] =
      await globalThis.testDataSource.query(
        `SELECT COUNT(*)::int AS count FROM core."logicFunction"
         WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
        [FUNCTION_ID, SEED_APPLE_WORKSPACE_ID],
      );

    expect(applicationFunctionCount).toBe(1);
  }, 120000);

  it('keeps the remaining workflow runnable', async () => {
    await expectWaiting(keptRunId, KEPT_WORKFLOW);

    const submission = await submitFormStep({
      workflowRunId: keptRunId,
      stepId: KEPT_WORKFLOW.steps[0].universalIdentifier,
      response: { note: 'Still runnable' },
    });

    expect(submission.body.errors).toBeUndefined();

    await waitForTestWorkflowRun(
      keptRunId,
      ({ status }) => status === WorkflowRunStatus.COMPLETED,
    );

    expect(await countTestCompanies(KEPT_COMPANY)).toBe(1);
  }, 120000);

  it('makes no change when the same manifest is synced again', async () => {
    const runsBefore = await Promise.all(
      createdWorkflowRunIds.map(findTestWorkflowRun),
    );

    const repeat = await syncApplication({
      manifest: buildManifest([KEPT_WORKFLOW]),
    });

    expect(repeat.errors).toBeUndefined();
    expect(repeat.data.syncApplication.actions).toEqual([]);
    expect(
      await Promise.all(createdWorkflowRunIds.map(findTestWorkflowRun)),
    ).toEqual(runsBefore);
  }, 120000);
});
