import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { createSdkClientCanaryFile } from 'test/integration/sdk-client/utils/create-sdk-client-canary-file.util';
import { downloadSdkClientCoreModule } from 'test/integration/sdk-client/utils/download-sdk-client-core-module.util';
import { findApplicationSdkClientChecksums } from 'test/integration/sdk-client/utils/find-application-sdk-client-checksums.util';
import { loadSdkClientCoreModule } from 'test/integration/sdk-client/utils/load-sdk-client-core-module.util';
import { storeUnkeyedSdkClientArchive } from 'test/integration/sdk-client/utils/store-unkeyed-sdk-client-archive.util';
import { v4 as uuidv4 } from 'uuid';

import { SDK_CLIENT_MODULE_CACHE_CONTROL } from 'src/engine/core-modules/sdk-client/constants/sdk-client-module-cache-control';
import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('SDK client generation key', () => {
  let applicationUniversalIdentifier: string;
  let applicationId: string;

  beforeEach(async () => {
    applicationUniversalIdentifier = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'SDK client generation key probe',
      description: 'Application whose SDK client predates the generation key',
      sourcePath: 'sdk-client-generation-key-probe',
    });
    jest.useRealTimers();

    const { data } = await findOneApplication({
      input: { universalIdentifier: applicationUniversalIdentifier },
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;
  });

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  });

  it('regenerates instead of serving an archive stored before the key', async () => {
    const { marker, removeCanaryFile } = await createSdkClientCanaryFile();

    try {
      await storeUnkeyedSdkClientArchive({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationUniversalIdentifier,
        coreModuleSource: `export const storedBeforeTheKey = ${JSON.stringify(marker)};`,
      });

      const response = await downloadSdkClientCoreModule({ applicationId });

      expect(response.status).toBe(200);
      expect(response.text).not.toContain(marker);

      const coreModule = await loadSdkClientCoreModule(response.text);

      expect(typeof coreModule.CoreApiClient).toBe('function');
    } finally {
      await removeCanaryFile();
    }
  });

  it('serves the core module under a checksum that carries the key', async () => {
    await downloadSdkClientCoreModule({ applicationId });

    const checksums = await findApplicationSdkClientChecksums(applicationId);

    expect(checksums?.core).toMatch(
      new RegExp(`^${SDK_CLIENT_GENERATION_KEY}-[0-9a-f]{64}$`),
    );

    const response = await downloadSdkClientCoreModule({
      applicationId,
      checksum: checksums?.core,
    });

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe(
      SDK_CLIENT_MODULE_CACHE_CONTROL,
    );
  });
});
