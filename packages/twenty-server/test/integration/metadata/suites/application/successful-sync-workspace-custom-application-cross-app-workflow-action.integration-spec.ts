import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationWorkflow,
  buildWorkflowManifest,
  logicFunctionStep,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { buildWorkflowActionProviderManifest } from 'test/integration/metadata/suites/application/utils/build-workflow-action-provider-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { pullWorkspaceCustomApplicationManifest } from 'test/integration/metadata/suites/application/utils/pull-workspace-custom-application-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';

import { SEED_BLANK_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PROVIDER_APP_ID = randomUUID();
const PROVIDER_ROLE_ID = randomUUID();
const WORKFLOW_ACTION_LOGIC_FUNCTION_ID = randomUUID();
const INTERNAL_LOGIC_FUNCTION_ID = randomUUID();

const WORKFLOW = buildTestApplicationWorkflow(
  'Call another application workflow action',
  [logicFunctionStep(WORKFLOW_ACTION_LOGIC_FUNCTION_ID)],
);

describe('Workspace custom application workflow calling another application workflow action', () => {
  let pulledManifest: Manifest;

  beforeAll(async () => {
    pulledManifest = await pullWorkspaceCustomApplicationManifest({
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: PROVIDER_APP_ID,
      name: 'Workflow action provider',
      description: 'Exposes a logic function as a workflow action',
      sourcePath: 'workflow-action-provider',
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    await syncApplication({
      manifest: buildWorkflowActionProviderManifest({
        appId: PROVIDER_APP_ID,
        roleId: PROVIDER_ROLE_ID,
        workflowActionLogicFunctionId: WORKFLOW_ACTION_LOGIC_FUNCTION_ID,
        internalLogicFunctionId: INTERNAL_LOGIC_FUNCTION_ID,
      }),
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  }, 60000);

  afterAll(async () => {
    await syncApplication({
      manifest: pulledManifest,
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: PROVIDER_APP_ID,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  });

  it('resolves the step to the other application logic function', async () => {
    await syncApplication({
      manifest: {
        ...pulledManifest,
        workflows: [buildWorkflowManifest(WORKFLOW)],
      },
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    const [logicFunction] = await globalThis.testDataSource.query(
      `SELECT id FROM core."logicFunction"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_BLANK_WORKSPACE_ID, WORKFLOW_ACTION_LOGIC_FUNCTION_ID],
    );
    const [workflowVersion] = await globalThis.testDataSource.query(
      `SELECT v.steps FROM core.workflow w
       JOIN core."workflowVersion" v ON v."coreWorkflowId" = w.id
       WHERE w."workspaceId" = $1 AND w."universalIdentifier" = $2`,
      [SEED_BLANK_WORKSPACE_ID, WORKFLOW.universalIdentifier],
    );

    expect(workflowVersion.steps[0].settings.input).toEqual({
      logicFunctionId: logicFunction.id,
      logicFunctionInput: {},
    });
  });
});
