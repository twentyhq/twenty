import { randomUUID } from 'node:crypto';
import { type Manifest } from 'twenty-shared/application';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const APP_ID = randomUUID();
const ROLE_ID = randomUUID();
const WORKFLOW_ID = randomUUID();
const VERSION_ID = randomUUID();
const FORM_STEP_ID = randomUUID();
const GREET_STEP_ID = randomUUID();
const FUNCTION_ID = randomUUID();
const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);
const STARTED_WORKFLOW_RUN_IDS: string[] = [];

const buildManifest = ({
  functionChecksum,
  greetStepName,
  withWorkflow = true,
}: {
  functionChecksum: string;
  greetStepName: string;
  withWorkflow?: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: APP_ID,
    roleId: ROLE_ID,
    overrides: {
      logicFunctions: [
        {
          universalIdentifier: FUNCTION_ID,
          name: 'Lifecycle greeting',
          sourceHandlerPath: 'greet.ts',
          builtHandlerPath: 'greet.mjs',
          builtHandlerChecksum: functionChecksum,
          handlerName: 'handler',
          workflowActionTriggerSettings: {
            label: 'Greet',
            icon: 'IconHandStop',
          },
        },
      ],
      workflows: withWorkflow
        ? [
            {
              universalIdentifier: WORKFLOW_ID,
              name: 'Lifecycle workflow',
              version: {
                universalIdentifier: VERSION_ID,
                trigger: {
                  universalIdentifier: randomUUID(),
                  type: 'MANUAL',
                  nextStepIds: [FORM_STEP_ID],
                },
                steps: [
                  {
                    universalIdentifier: FORM_STEP_ID,
                    name: 'Wait for input',
                    type: 'FORM',
                    input: [
                      {
                        id: randomUUID(),
                        name: 'greeting',
                        label: 'Greeting',
                        type: FieldMetadataType.TEXT,
                      },
                    ],
                    nextStepIds: [GREET_STEP_ID],
                  },
                  {
                    universalIdentifier: GREET_STEP_ID,
                    name: greetStepName,
                    type: 'LOGIC_FUNCTION',
                    logicFunctionUniversalIdentifier: FUNCTION_ID,
                    input: { greeting: `{{${FORM_STEP_ID}.greeting}}` },
                    nextStepIds: [],
                  },
                ],
              },
            },
          ]
        : [],
    },
  });

const INITIAL_MANIFEST = buildManifest({
  functionChecksum: 'checksum-1',
  greetStepName: 'Greet',
});

type TestWorkflowRun = Pick<WorkflowRunWorkspaceEntity, 'status' | 'state'>;

const findDefinitions = async (): Promise<
  { workflowId: string; versionId: string; steps: { name: string }[] }[]
> =>
  globalThis.testDataSource.query(
    `SELECT w.id AS "workflowId", v.id AS "versionId", v.steps
     FROM core.workflow w
     JOIN core."workflowVersion" v ON v."coreWorkflowId" = w.id
     WHERE w."workspaceId" = $1 AND w."universalIdentifier" = $2`,
    [WORKSPACE_ID, WORKFLOW_ID],
  );

const findFunctionChecksum = async (): Promise<string | undefined> => {
  const [logicFunction] = await globalThis.testDataSource.query(
    `SELECT checksum FROM core."logicFunction"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [WORKSPACE_ID, FUNCTION_ID],
  );

  return logicFunction?.checksum;
};

const findRun = async (workflowRunId: string): Promise<TestWorkflowRun> => {
  const [workflowRun] = await globalThis.testDataSource.query(
    `SELECT status, state FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
    [workflowRunId],
  );

  return workflowRun;
};

const waitForRun = async (
  workflowRunId: string,
  isDone: (workflowRun: TestWorkflowRun) => boolean,
): Promise<TestWorkflowRun> => {
  for (let attempt = 0; attempt < 600; attempt++) {
    const workflowRun = await findRun(workflowRunId);

    if (isDefined(workflowRun) && isDone(workflowRun)) {
      return workflowRun;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return findRun(workflowRunId);
};

const startRunWaitingOnForm = async (): Promise<string> => {
  const [{ versionId }] = await findDefinitions();
  const response = await workflowGraphqlRequest(
    'mutation Run($input: RunCoreWorkflowVersionInput!) { runCoreWorkflowVersion(input: $input) { workflowRunId } }',
    { input: { coreWorkflowVersionId: versionId } },
  );

  expect(response.body.errors).toBeUndefined();

  const workflowRunId = response.body.data.runCoreWorkflowVersion.workflowRunId;

  STARTED_WORKFLOW_RUN_IDS.push(workflowRunId);
  const workflowRun = await waitForRun(
    workflowRunId,
    ({ state }) => state?.stepInfos?.[FORM_STEP_ID]?.status === 'PENDING',
  );

  expect(workflowRun.status).toBe('RUNNING');

  return workflowRunId;
};

const submitForm = async (workflowRunId: string) => {
  const response = await workflowGraphqlRequest(
    'mutation Submit($input: SubmitFormStepInput!) { submitFormStep(input: $input) }',
    {
      input: {
        stepId: FORM_STEP_ID,
        workflowRunId,
        response: { greeting: 'hello' },
      },
    },
  );

  expect(response.body.errors).toBeUndefined();
};

const retryRun = async (workflowRunId: string) => {
  const response = await workflowGraphqlRequest(
    'mutation Retry($workflowRunId: UUID!) { retryWorkflowRun(workflowRunId: $workflowRunId) { id status } }',
    { workflowRunId },
  );

  expect(response.body.errors).toBeUndefined();
};

const waitForRunToEnd = (workflowRunId: string) =>
  waitForRun(workflowRunId, ({ status }) =>
    ['COMPLETED', 'FAILED', 'STOPPED'].includes(status),
  );

describe('application workflow lifecycle', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Application workflow lifecycle',
      description: 'Application whose workflows are upgraded and removed',
      sourcePath: 'application-workflow-lifecycle',
    });
    jest.useRealTimers();
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."workflowRun" WHERE id = ANY($1)`,
      [STARTED_WORKFLOW_RUN_IDS],
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

  it('keeps in-progress runs on their definitions or fails them at a changed step', async () => {
    const installation = await syncApplication({ manifest: INITIAL_MANIFEST });

    expect(installation.errors).toBeUndefined();

    const workflowRunId = await startRunWaitingOnForm();
    const startedRun = await findRun(workflowRunId);

    expect(
      Object.keys(
        startedRun.state.pinnedDependencies?.logicFunctionFingerprintById ?? {},
      ),
    ).toHaveLength(1);

    const graphUpdate = await syncApplication({
      manifest: buildManifest({
        functionChecksum: 'checksum-1',
        greetStepName: 'Greet again',
      }),
    });

    expect(graphUpdate.errors).toBeUndefined();
    expect((await findRun(workflowRunId)).state.flow).toEqual(
      startedRun.state.flow,
    );

    const functionUpdate = buildManifest({
      functionChecksum: 'checksum-2',
      greetStepName: 'Greet again',
    });
    const rejectedFunctionUpdatePlan = await syncApplication({
      manifest: functionUpdate,
      dryRun: true,
      expectToFail: true,
    });

    expect(JSON.stringify(rejectedFunctionUpdatePlan.errors)).toContain(
      'still needs logic function',
    );
    expect(await findFunctionChecksum()).toBe('checksum-1');

    const rejectedRemoval = await syncApplication({
      manifest: buildManifest({
        functionChecksum: 'checksum-1',
        greetStepName: 'Greet again',
        withWorkflow: false,
      }),
      expectToFail: true,
    });

    expect(JSON.stringify(rejectedRemoval.errors)).toContain(
      'the workflow, which this update removes',
    );
    expect(await findDefinitions()).toHaveLength(1);

    const appliedFunctionUpdate = await syncApplication({
      manifest: functionUpdate,
    });

    expect(appliedFunctionUpdate.errors).toBeUndefined();
    expect(await findFunctionChecksum()).toBe('checksum-2');

    await submitForm(workflowRunId);

    const failedRun = await waitForRunToEnd(workflowRunId);

    expect(failedRun.status).toBe('FAILED');
    expect(failedRun.state.stepInfos[GREET_STEP_ID]?.error).toContain(
      'changed or removed what step',
    );

    const removal = await syncApplication({
      manifest: buildManifest({
        functionChecksum: 'checksum-2',
        greetStepName: 'Greet again',
        withWorkflow: false,
      }),
    });

    expect(removal.errors).toBeUndefined();
    expect(await findDefinitions()).toHaveLength(0);
    expect((await findRun(workflowRunId)).state.flow).toEqual(
      startedRun.state.flow,
    );
  }, 120000);

  it('fails a retried step whose function changed after the run started', async () => {
    const reinstallation = await syncApplication({
      manifest: buildManifest({
        functionChecksum: 'checksum-2',
        greetStepName: 'Greet',
      }),
    });

    expect(reinstallation.errors).toBeUndefined();

    const workflowRunId = await startRunWaitingOnForm();

    await submitForm(workflowRunId);

    expect((await waitForRunToEnd(workflowRunId)).status).toBe('FAILED');

    const functionUpdate = await syncApplication({
      manifest: buildManifest({
        functionChecksum: 'checksum-3',
        greetStepName: 'Greet',
      }),
    });

    expect(functionUpdate.errors).toBeUndefined();

    await retryRun(workflowRunId);

    const retriedRun = await waitForRunToEnd(workflowRunId);

    expect(retriedRun.status).toBe('FAILED');
    expect(retriedRun.state.stepInfos[GREET_STEP_ID]?.error).toContain(
      'changed or removed what step',
    );
  }, 120000);

  it('stops in-progress runs when the application is uninstalled', async () => {
    const reinstallation = await syncApplication({
      manifest: INITIAL_MANIFEST,
    });

    expect(reinstallation.errors).toBeUndefined();

    const workflowRunId = await startRunWaitingOnForm();

    const { errors } = await uninstallApplication({
      universalIdentifier: APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findDefinitions()).toHaveLength(0);

    const stoppedRun = await findRun(workflowRunId);

    expect(stoppedRun.status).toBe('STOPPED');
    expect(stoppedRun.state.flow.steps).toHaveLength(2);
  }, 120000);
});
