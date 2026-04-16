import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_PERMISSION_ID = uuidv4();

const ADMIN_ROLE_UNIVERSAL_IDENTIFIER =
  STANDARD_ROLE.admin.universalIdentifier;

const buildManifest = (overrides?: Partial<Manifest>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'App Default Role',
          description: 'Default role for the test app',
        },
        {
          universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Custom Admin Override',
          description: 'Attempts to override the standard admin role',
          objectPermissions: [
            {
              universalIdentifier: TEST_OBJECT_PERMISSION_ID,
              objectUniversalIdentifier:
                STANDARD_OBJECTS.company.universalIdentifier,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      ],
      ...overrides,
    },
  });

describe('Sync application should fail when trying to create permissions on standard admin role', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Admin Override App',
      description: 'App for testing admin role permission override',
      sourcePath: 'test-admin-role-override',
    });
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."role" WHERE "universalIdentifier" = $1`,
      [TEST_ROLE_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "applicationId" IN (
        SELECT id FROM core."application" WHERE "universalIdentifier" = $1
      )`,
      [TEST_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."application"
       WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration"
       WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );
  });

  it('should fail with a validation error when manifest declares a role with admin universalIdentifier and object permissions', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThanOrEqual(1);

    const [firstError] = errors;

    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  }, 60000);
});
