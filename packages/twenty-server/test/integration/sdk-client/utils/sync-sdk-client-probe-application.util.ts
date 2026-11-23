import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { downloadSdkClientCoreModule } from 'test/integration/sdk-client/utils/download-sdk-client-core-module.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

// Syncing a new application generates its SDK client on first apply, which is
// the path a member holding APPLICATIONS uses to trigger a build.
export const syncSdkClientProbeApplication = async ({
  applicationUniversalIdentifier,
  objects,
  fields = [],
}: {
  applicationUniversalIdentifier: string;
  objects: Manifest['objects'];
  fields?: Manifest['fields'];
}) => {
  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name: 'SDK client probe',
    description: 'Application whose SDK client is downloaded by the test',
    sourcePath: 'sdk-client-probe',
  });
  jest.useRealTimers();

  const { errors: applyErrors } = await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: uuidv4(),
      overrides: { objects, fields },
    }),
    expectToFail: false,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    expectToFail: false,
  });

  const coreModuleResponse = await downloadSdkClientCoreModule({
    applicationId: data.findOneApplication.id,
  });

  return { applyErrors, coreModuleResponse };
};
