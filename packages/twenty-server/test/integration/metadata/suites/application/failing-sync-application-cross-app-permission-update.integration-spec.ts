import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

const APP_A_ID = 'b1b2c3d4-0010-4000-a000-000000000010';
const APP_B_ID = 'b1b2c3d4-0010-4000-a000-000000000011';
const APP_A_ROLE_ID = 'b1b2c3d4-0010-4000-a000-000000000012';
const APP_B_ROLE_ID = 'b1b2c3d4-0010-4000-a000-000000000013';

type SyncValidationGraphQLError = {
  extensions?: {
    code?: string;
    errors?: Record<
      string,
      Array<{
        errors: Array<{ code: string }>;
      }>
    >;
  };
};

const assertCrossAppValidationError = ({
  errors,
  metadataName,
}: {
  errors: SyncValidationGraphQLError[];
  metadataName: 'permissionFlag' | 'objectPermission' | 'fieldPermission';
}) => {
  expect(errors).toHaveLength(1);

  const [error] = errors;

  expect(error.extensions?.code).toBe('METADATA_VALIDATION_FAILED');

  const metadataErrors = error.extensions?.errors?.[metadataName] ?? [];

  expect(metadataErrors.length).toBeGreaterThan(0);

  const nestedCodes = metadataErrors.flatMap((entry) =>
    entry.errors.map((entryError) => entryError.code),
  );

  expect(nestedCodes).toContain('ROLE_BELONGS_TO_ANOTHER_APPLICATION');
};

describe('Sync application should fail when updating permissions to another app role', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_A_ID,
      name: 'Permission Update Source App',
      description: 'App A for cross-app permission update tests',
      sourcePath: 'test-cross-app-update-source',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_B_ID,
      name: 'Permission Update Target App',
      description: 'App B for cross-app permission update tests',
      sourcePath: 'test-cross-app-update-target',
    });
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."role" WHERE "universalIdentifier" IN ($1, $2)`,
      [APP_A_ROLE_ID, APP_B_ROLE_ID],
    );

    for (const appId of [APP_A_ID, APP_B_ID]) {
      await globalThis.testDataSource.query(
        `DELETE FROM core."file" WHERE "applicationId" IN (
          SELECT id FROM core."application" WHERE "universalIdentifier" = $1
        )`,
        [appId],
      );

      await globalThis.testDataSource.query(
        `DELETE FROM core."application" WHERE "universalIdentifier" = $1`,
        [appId],
      );

      await globalThis.testDataSource.query(
        `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [appId],
      );
    }
  });

  it('should fail when updating a permission flag to another app role', async () => {
    const permissionFlagId = 'b1b2c3d4-0010-4000-a000-000000000020';

    const initialManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
            permissionFlags: [
              {
                universalIdentifier: permissionFlagId,
                flag: PermissionFlagType.WORKSPACE,
              },
            ],
          },
        ],
      },
    });

    const targetAppManifest = buildBaseManifest({
      appId: APP_B_ID,
      roleId: APP_B_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_B_ROLE_ID,
            label: 'Target Role',
            description: 'Target app role',
          },
        ],
      },
    });

    expect(
      (await syncApplication({ manifest: initialManifest })).errors,
    ).toBeUndefined();
    expect(
      (await syncApplication({ manifest: targetAppManifest })).errors,
    ).toBeUndefined();

    const updatedManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
          },
          {
            universalIdentifier: APP_B_ROLE_ID,
            label: 'Target Role',
            description: 'Target app role',
            permissionFlags: [
              {
                universalIdentifier: permissionFlagId,
                flag: PermissionFlagType.WORKSPACE,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest: updatedManifest,
      expectToFail: true,
    });

    assertCrossAppValidationError({
      errors: errors as SyncValidationGraphQLError[],
      metadataName: 'permissionFlag',
    });
  }, 60000);

  it('should fail when updating an object permission to another app role', async () => {
    const objectPermissionId = 'b1b2c3d4-0010-4000-a000-000000000021';

    const initialManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
            objectPermissions: [
              {
                universalIdentifier: objectPermissionId,
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                canReadObjectRecords: true,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
              },
            ],
          },
        ],
      },
    });

    expect(
      (await syncApplication({ manifest: initialManifest })).errors,
    ).toBeUndefined();

    const updatedManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
          },
          {
            universalIdentifier: APP_B_ROLE_ID,
            label: 'Target Role',
            description: 'Target app role',
            objectPermissions: [
              {
                universalIdentifier: objectPermissionId,
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                canReadObjectRecords: true,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest: updatedManifest,
      expectToFail: true,
    });

    assertCrossAppValidationError({
      errors: errors as SyncValidationGraphQLError[],
      metadataName: 'objectPermission',
    });
  }, 60000);

  it('should fail when updating a field permission to another app role', async () => {
    const fieldPermissionId = 'b1b2c3d4-0010-4000-a000-000000000022';

    const initialManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
            fieldPermissions: [
              {
                universalIdentifier: fieldPermissionId,
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                fieldUniversalIdentifier:
                  STANDARD_OBJECTS.company.fields.name.universalIdentifier,
                canReadFieldValue: true,
                canUpdateFieldValue: false,
              },
            ],
          },
        ],
      },
    });

    expect(
      (await syncApplication({ manifest: initialManifest })).errors,
    ).toBeUndefined();

    const updatedManifest = buildBaseManifest({
      appId: APP_A_ID,
      roleId: APP_A_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: APP_A_ROLE_ID,
            label: 'Source Role',
            description: 'Source app role',
          },
          {
            universalIdentifier: APP_B_ROLE_ID,
            label: 'Target Role',
            description: 'Target app role',
            fieldPermissions: [
              {
                universalIdentifier: fieldPermissionId,
                objectUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
                fieldUniversalIdentifier:
                  STANDARD_OBJECTS.company.fields.name.universalIdentifier,
                canReadFieldValue: true,
                canUpdateFieldValue: false,
              },
            ],
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest: updatedManifest,
      expectToFail: true,
    });

    assertCrossAppValidationError({
      errors: errors as SyncValidationGraphQLError[],
      metadataName: 'fieldPermission',
    });
  }, 60000);
});
