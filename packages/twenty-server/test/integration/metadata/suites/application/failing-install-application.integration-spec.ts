import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { v4 as uuidv4 } from 'uuid';

const INVALID_UUID_APP_ID = uuidv4();
const INVALID_UUID_ROLE_ID = uuidv4();

describe('Install application should fail when entity does not exist', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: INVALID_UUID_APP_ID,
      name: 'Test Invalid UUID App',
      description: 'App for testing UUID v4 validation',
      sourcePath: 'test-invalid-uuid',
    });
  }, 60000);

  afterEach(async () => {
    try {
      await uninstallApplication({
        universalIdentifier: INVALID_UUID_APP_ID,
        expectToFail: false,
      });
    } catch {
      // May fail if the test didn't install/sync
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "applicationId" IN (
        SELECT id FROM core."application" WHERE "universalIdentifier" = $1
      )`,
      [INVALID_UUID_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."application"
       WHERE "universalIdentifier" = $1`,
      [INVALID_UUID_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration"
       WHERE "universalIdentifier" = $1`,
      [INVALID_UUID_APP_ID],
    );
  });

  it('should fail with execution error when installing non-existent app registration', async () => {
    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        appRegistrationId: '20202020-0000-0000-0000-000000000000',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should fail when a role has an invalid universalIdentifier', async () => {
    const manifest = buildBaseManifest({
      appId: INVALID_UUID_APP_ID,
      roleId: INVALID_UUID_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: 'not-a-valid-uuid',
            label: 'Invalid UUID Role',
            description: 'Role with invalid universalIdentifier',
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
