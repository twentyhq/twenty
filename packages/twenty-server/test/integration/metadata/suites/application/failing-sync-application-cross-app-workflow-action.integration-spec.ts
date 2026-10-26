import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  buildTestApplicationWorkflow,
  buildWorkflowManifest,
  logicFunctionStep,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildWorkflowActionProviderManifest } from 'test/integration/metadata/suites/application/utils/build-workflow-action-provider-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { pullWorkspaceCustomApplicationManifest } from 'test/integration/metadata/suites/application/utils/pull-workspace-custom-application-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';

const PROVIDER_APP_ID = 'b7a1e000-0001-4000-a000-000000000001';
const PROVIDER_ROLE_ID = 'b7a1e000-0001-4000-a000-000000000002';
const WORKFLOW_ACTION_LOGIC_FUNCTION_ID =
  'b7a1e000-0001-4000-a000-000000000003';
const INTERNAL_LOGIC_FUNCTION_ID = 'b7a1e000-0001-4000-a000-000000000004';
const CONSUMER_APP_ID = 'b7a1e000-0001-4000-a000-000000000005';
const CONSUMER_ROLE_ID = 'b7a1e000-0001-4000-a000-000000000006';

describe('Sync application should fail when a workflow calls another application function it cannot reference', () => {
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

    await setupApplicationForSync({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
      name: 'Workflow action consumer',
      description: 'Calls another application workflow action',
      sourcePath: 'workflow-action-consumer',
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: PROVIDER_APP_ID,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  });

  it('should fail when the workspace custom application calls a function not exposed as a workflow action', async () => {
    const { errors } = await syncApplication({
      manifest: {
        ...pulledManifest,
        workflows: [
          buildWorkflowManifest(
            buildTestApplicationWorkflow('Call an internal function', [
              logicFunctionStep(INTERNAL_LOGIC_FUNCTION_ID),
            ]),
          ),
        ],
      },
      expectToFail: true,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail when another application calls a workflow action it does not own', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: CONSUMER_APP_ID,
        roleId: CONSUMER_ROLE_ID,
        overrides: {
          workflows: [
            buildWorkflowManifest(
              buildTestApplicationWorkflow(
                'Call another application workflow action',
                [logicFunctionStep(WORKFLOW_ACTION_LOGIC_FUNCTION_ID)],
              ),
            ),
          ],
        },
      }),
      expectToFail: true,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
