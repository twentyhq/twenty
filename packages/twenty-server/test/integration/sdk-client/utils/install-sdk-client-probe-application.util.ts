import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { downloadSdkClientCoreModule } from 'test/integration/sdk-client/utils/download-sdk-client-core-module.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

// Installing a packaged application always regenerates its SDK client.
export const installSdkClientProbeApplication = async ({
  applicationUniversalIdentifier,
  objects,
}: {
  applicationUniversalIdentifier: string;
  objects: Manifest['objects'];
}) => {
  jest.useRealTimers();

  const tarballBuffer = await createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: uuidv4(),
        overrides: { objects },
      }),
    ),
    'package.json': JSON.stringify({
      name: `sdk-client-probe-${applicationUniversalIdentifier}`,
      version: '1.0.0',
    }),
  });

  await uploadAppTarball({
    tarballBuffer,
    universalIdentifier: applicationUniversalIdentifier,
    expectToFail: false,
  });

  const { data, errors: installErrors } = await installApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    expectToFail: false,
  });

  const coreModuleResponse = await downloadSdkClientCoreModule({
    applicationId: data.installApplication.id,
  });

  return { applyErrors: installErrors, coreModuleResponse };
};
