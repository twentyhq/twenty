import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

describe('Install application should return structured validation errors', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Validation Error App',
      description: 'App for testing structured validation error responses',
      sourcePath: 'test-validation-errors',
    });
  }, 60000);

  afterAll(async () => {
    try {
      await uninstallApplication({
        universalIdentifier: TEST_APP_ID,
        expectToFail: false,
      });
    } catch {
      // May fail if the test didn't install/sync
    }

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

  it('should return METADATA_VALIDATION_FAILED with structured errors for invalid navigation menu item', async () => {
    const nonExistentObjectId = uuidv4();

    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        navigationMenuItems: [
          {
            universalIdentifier: uuidv4(),
            position: 0,
            type: 'OBJECT' as const,
            targetObjectUniversalIdentifier: nonExistentObjectId,
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);

    const [error] = errors;

    expect(error.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(error.extensions.errors).toBeDefined();
    expect(error.extensions.summary).toBeDefined();
    expect(error.extensions.summary.totalErrors).toBeGreaterThan(0);
    expect(error.extensions.message).toMatch(/Validation failed for/);
  }, 60000);

  it('should return METADATA_VALIDATION_FAILED with structured errors for invalid view field reference', async () => {
    const objectId = uuidv4();
    const fieldId = uuidv4();
    const viewId = uuidv4();
    const nonExistentFieldId = uuidv4();

    const manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [
          {
            universalIdentifier: objectId,
            nameSingular: 'testObj',
            namePlural: 'testObjs',
            labelSingular: 'Test Obj',
            labelPlural: 'Test Objs',
            icon: 'IconBox',
            labelIdentifierFieldMetadataUniversalIdentifier: fieldId,
            fields: [
              {
                universalIdentifier: fieldId,
                name: 'name',
                type: 'TEXT',
                label: 'Name',
                icon: 'IconTextCaption',
              },
            ],
          },
        ],
        views: [
          {
            universalIdentifier: viewId,
            name: 'All Test Objs',
            objectUniversalIdentifier: objectId,
            type: 'TABLE',
            icon: 'IconBox',
            key: 'INDEX',
            position: 0,
            fields: [
              {
                universalIdentifier: uuidv4(),
                fieldMetadataUniversalIdentifier: fieldId,
                position: 0,
                isVisible: true,
                size: 200,
              },
              {
                universalIdentifier: uuidv4(),
                fieldMetadataUniversalIdentifier: nonExistentFieldId,
                position: 1,
                isVisible: true,
                size: 200,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);

    const [error] = errors;

    expect(error.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(error.extensions.errors).toBeDefined();
    expect(error.extensions.summary).toBeDefined();
    expect(error.extensions.summary.totalErrors).toBeGreaterThan(0);
  }, 60000);
});
