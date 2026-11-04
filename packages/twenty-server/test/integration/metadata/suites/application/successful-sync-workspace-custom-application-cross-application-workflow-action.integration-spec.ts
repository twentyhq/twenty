import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationManifest,
  buildTestApplicationWorkflow,
  logicFunctionStep,
  type TestApplicationWorkflow,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type Manifest } from 'twenty-shared/application';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';

const PROVIDER_APP_ID = randomUUID();
const PROVIDER_FUNCTION_ID = randomUUID();
const CONSUMER_APP_ID = randomUUID();

const toWorkflowManifest = (
  workflow: TestApplicationWorkflow,
): NonNullable<Manifest['workflows']>[number] => ({
  universalIdentifier: workflow.universalIdentifier,
  name: workflow.name,
  version: {
    trigger: {
      universalIdentifier: workflow.triggerUniversalIdentifier,
      type: 'MANUAL',
      nextStepIds: [workflow.steps[0].universalIdentifier],
    },
    steps: workflow.steps,
  },
});

describe('Workflows calling another application workflow action', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: PROVIDER_APP_ID,
      name: 'Workflow action provider',
      description: 'Application exposing a workflow action',
      sourcePath: 'cross-application-workflow-action-provider',
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
      name: 'Workflow action consumer',
      description: 'Installed application calling another one action',
      sourcePath: 'cross-application-workflow-action-consumer',
    });

    const providerInstallation = await syncApplication({
      manifest: buildTestApplicationManifest({
        applicationUniversalIdentifier: PROVIDER_APP_ID,
        roleUniversalIdentifier: randomUUID(),
        companyPermissionUniversalIdentifier: randomUUID(),
        logicFunctionUniversalIdentifier: PROVIDER_FUNCTION_ID,
        workflows: [],
      }),
    });

    expect(providerInstallation.errors).toBeUndefined();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: CONSUMER_APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: PROVIDER_APP_ID,
    });
  });

  it('resolves the action from the workspace Custom application', async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const customApplication = applicationsData.findManyApplications.find(
      ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );

    jestExpectToBeDefined(customApplication);

    const { data } = await exportApplication({
      universalIdentifier: customApplication.universalIdentifier,
      expectToFail: false,
    });
    const workflow = buildTestApplicationWorkflow(
      'Call the provider action from the Custom application',
      [logicFunctionStep(PROVIDER_FUNCTION_ID)],
    );

    const dryRun = await syncApplication({
      manifest: {
        ...data.exportApplication.manifest,
        workflows: [toWorkflowManifest(workflow)],
      },
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'create',
          metadataName: 'workflow',
        }),
      ]),
    );
  }, 60000);

  it('refuses the action from another installed application', async () => {
    const workflow = buildTestApplicationWorkflow(
      'Call the provider action from an installed application',
      [logicFunctionStep(PROVIDER_FUNCTION_ID)],
    );

    const sync = await syncApplication({
      manifest: buildTestApplicationManifest({
        applicationUniversalIdentifier: CONSUMER_APP_ID,
        roleUniversalIdentifier: randomUUID(),
        companyPermissionUniversalIdentifier: randomUUID(),
        logicFunctionUniversalIdentifier: randomUUID(),
        workflows: [workflow],
      }),
      dryRun: true,
      expectToFail: true,
    });

    expect(sync.errors).toBeDefined();
  }, 60000);
});
