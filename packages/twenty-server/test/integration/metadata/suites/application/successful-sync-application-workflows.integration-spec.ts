import { randomUUID } from 'node:crypto';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const APP_ID = randomUUID();
const ROLE_ID = randomUUID();
const WORKFLOW_ID = randomUUID();
const VERSION_ID = randomUUID();
const STEP_ID = randomUUID();
const RECORD_STEP_ID = randomUUID();
const DELAY_STEP_ID = randomUUID();
const FUNCTION_ID = randomUUID();
const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);
const MANIFEST: Manifest = buildBaseManifest({
  appId: APP_ID,
  roleId: ROLE_ID,
  overrides: {
    logicFunctions: [
      {
        universalIdentifier: FUNCTION_ID,
        name: 'Application workflow greeting',
        sourceHandlerPath: 'greet.ts',
        builtHandlerPath: 'greet.mjs',
        builtHandlerChecksum: '',
        handlerName: 'handler',
        workflowActionTriggerSettings: { label: 'Greet', icon: 'IconHandStop' },
      },
    ],
    workflows: [
      {
        universalIdentifier: WORKFLOW_ID,
        name: 'Application workflow',
        version: {
          universalIdentifier: VERSION_ID,
          trigger: {
            universalIdentifier: randomUUID(),
            type: 'MANUAL',
            nextStepIds: [STEP_ID],
          },
          steps: [
            {
              universalIdentifier: STEP_ID,
              name: 'Greet',
              type: 'LOGIC_FUNCTION',
              logicFunctionUniversalIdentifier: FUNCTION_ID,
              input: { greeting: 'Before' },
              nextStepIds: [RECORD_STEP_ID],
            },
            {
              universalIdentifier: RECORD_STEP_ID,
              name: 'Create company',
              type: 'CREATE_RECORD',
              input: {
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                objectRecord: { name: 'Workflow test company' },
              },
              nextStepIds: [DELAY_STEP_ID],
            },
            {
              universalIdentifier: DELAY_STEP_ID,
              name: 'Wait',
              type: 'DELAY',
              input: { delayType: 'DURATION', duration: { seconds: 1 } },
              nextStepIds: [],
            },
          ],
        },
      },
    ],
  },
});

const findDefinitions = () =>
  globalThis.testDataSource.query(
    `SELECT w.id AS "workflowId", w."workspaceWorkflowId", w."lastPublishedCoreWorkflowVersionId", v.id AS "versionId", v."workspaceWorkflowVersionId", v.status, v.steps, f.id AS "functionId"
   FROM core.workflow w
   JOIN core."workflowVersion" v ON v."coreWorkflowId" = w.id
   JOIN core."logicFunction" f ON f."applicationId" = w."applicationId" AND f."universalIdentifier" = $3
   WHERE w."workspaceId" = $1 AND w."universalIdentifier" = $2`,
    [WORKSPACE_ID, WORKFLOW_ID, FUNCTION_ID],
  );

const runVersion = async (coreWorkflowVersionId: string): Promise<string> => {
  const response = await workflowGraphqlRequest(
    'mutation Run($input: RunCoreWorkflowVersionInput!) { runCoreWorkflowVersion(input: $input) { workflowRunId } }',
    { input: { coreWorkflowVersionId } },
  );
  expect(response.body.errors).toBeUndefined();
  return response.body.data.runCoreWorkflowVersion.workflowRunId;
};

const findRun = async (runId: string): Promise<WorkflowRunWorkspaceEntity> => {
  const [run] = await globalThis.testDataSource.query(
    `SELECT * FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
    [runId],
  );
  return run;
};

describe('application-owned core workflows', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Workflow POC integration',
      description: 'Application workflow synchronization',
      sourcePath: 'workflow-poc-integration',
    });
    jest.useRealTimers();
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."workflowRun" WHERE "coreWorkflowId" IN (SELECT id FROM core.workflow WHERE "universalIdentifier" = $1 AND "workspaceId" = $2)`,
      [WORKFLOW_ID, WORKSPACE_ID],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
    jest.useFakeTimers();
  });

  it('installs, upgrades through additive pre-install sync, and protects saved runs and app-owned definitions', async () => {
    const initial = await syncApplication({ manifest: MANIFEST });
    expect(initial.errors).toBeUndefined();
    const definitions = await findDefinitions();
    expect(definitions).toHaveLength(1);
    const [installed] = definitions;
    expect(installed).toMatchObject({
      status: 'ACTIVE',
      workspaceWorkflowId: null,
      workspaceWorkflowVersionId: null,
      lastPublishedCoreWorkflowVersionId: installed.versionId,
    });
    expect(installed.steps[0].settings.input).toEqual({
      logicFunctionId: installed.functionId,
      logicFunctionInput: { greeting: 'Before' },
    });
    expect(installed.steps[1].settings.input).toEqual({
      objectName: 'company',
      objectRecord: { name: 'Workflow test company' },
    });
    expect(installed.steps[2].settings.input).toEqual({
      delayType: 'DURATION',
      duration: { seconds: 1 },
    });
    const oldRunId = await runVersion(installed.versionId);
    const oldRun = await findRun(oldRunId);
    expect(oldRun.coreWorkflowId).toBe(installed.workflowId);
    expect(oldRun.coreWorkflowVersionId).toBe(installed.versionId);
    expect(oldRun.state?.flow?.steps).toEqual(installed.steps);

    const [ownerFlatApplication] = await globalThis.testDataSource.query<
      FlatApplication[]
    >(
      'SELECT * FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2',
      [APP_ID, WORKSPACE_ID],
    );
    expect(ownerFlatApplication).toBeDefined();
    const migrationService =
      getAppProviderByClassName<ApplicationManifestMigrationService>(
        'ApplicationManifestMigrationService',
      );
    await migrationService.syncPreInstallLogicFunctionFromManifest({
      manifest: {
        ...MANIFEST,
        application: {
          ...MANIFEST.application,
          preInstallLogicFunction: { universalIdentifier: FUNCTION_ID },
        },
      },
      workspaceId: WORKSPACE_ID,
      ownerFlatApplication,
    });
    expect(await findDefinitions()).toEqual(definitions);
    const unchanged = await syncApplication({ manifest: MANIFEST });
    expect(unchanged.errors).toBeUndefined();
    expect(unchanged.data.syncApplication.actions).toEqual([]);

    const rename = await workflowGraphqlRequest(
      'mutation Rename($input: UpdateCoreWorkflowInput!) { updateCoreWorkflow(input: $input) { id } }',
      {
        input: { coreWorkflowId: installed.workflowId, name: 'Forbidden edit' },
      },
    );
    expect(rename.body.errors).toBeDefined();
    expect(JSON.stringify(rename.body.errors)).toContain('read-only');
    const deletion = await workflowGraphqlRequest(
      'mutation Delete($input: DeleteCoreWorkflowsInput!) { deleteCoreWorkflows(input: $input) { id } }',
      { input: { coreWorkflowIds: [installed.workflowId] } },
    );
    expect(deletion.body.errors).toBeDefined();
    expect(JSON.stringify(deletion.body.errors)).toContain('read-only');

    const changed = structuredClone(MANIFEST);
    const changedStep = changed.workflows![0].version.steps[0];
    if (changedStep.type !== 'LOGIC_FUNCTION')
      { throw new Error('Expected a function step'); }
    changedStep.input.greeting = 'After';
    const upgrade = await syncApplication({ manifest: changed });
    expect(upgrade.errors).toBeUndefined();
    const updatedDefinitions = await findDefinitions();
    expect(updatedDefinitions).toHaveLength(1);
    const [updated] = updatedDefinitions;
    expect(updated.workflowId).toBe(installed.workflowId);
    expect(updated.versionId).toBe(installed.versionId);
    expect(updated.steps[0].settings.input.logicFunctionInput).toEqual({
      greeting: 'After',
    });
    expect((await findRun(oldRunId)).state?.flow).toEqual(oldRun.state?.flow);
    const newRunId = await runVersion(updated.versionId);
    expect((await findRun(newRunId)).state?.flow?.steps).toEqual(updated.steps);

    const missingWorkflow = { ...changed, workflows: [] };
    const additive = await syncApplication({
      manifest: missingWorkflow,
      inferDeletionFromMissingEntities: false,
    });
    expect(additive.errors).toBeUndefined();
    const removing = await syncApplication({
      manifest: missingWorkflow,
      expectToFail: true,
    });
    expect(removing.errors).toBeDefined();
    expect(await findDefinitions()).toEqual(updatedDefinitions);
  }, 90000);
});
