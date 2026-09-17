import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const ROLE_LABEL = 'Derived Permission Identifiers Role';

const PERMISSION_METADATA_NAMES = [
  'objectPermission',
  'fieldPermission',
  'rolePermissionFlag',
];

describe('Sync application should derive the permission identifiers the metadata API derives', () => {
  it('should plan no permission action for a manifest declaring permissions created through the metadata API without their universal identifiers', async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });
    const personObject = objects.find(
      ({ nameSingular }) => nameSingular === 'person',
    );

    jestExpectToBeDefined(personObject);

    const personJobTitleField = personObject.fieldsList?.find(
      ({ name }) => name === 'jobTitle',
    );

    jestExpectToBeDefined(personJobTitleField);

    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const customApplication = applicationsData.findManyApplications.find(
      ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );

    jestExpectToBeDefined(customApplication);

    const { data: createdRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: ROLE_LABEL,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
      },
      gqlFields: 'id universalIdentifier',
    });
    const createdRole = createdRoleData.createOneRole;

    try {
      const createdRoleUniversalIdentifier = createdRole.universalIdentifier;

      jestExpectToBeDefined(createdRoleUniversalIdentifier);

      await upsertObjectPermissions({
        expectToFail: false,
        input: {
          roleId: createdRole.id,
          objectPermissions: [
            {
              objectMetadataId: personObject.id,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      });
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: createdRole.id,
          fieldPermissions: [
            {
              objectMetadataId: personObject.id,
              fieldMetadataId: personJobTitleField.id,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        },
      });
      await upsertPermissionFlags({
        expectToFail: false,
        input: {
          roleId: createdRole.id,
          permissionFlagKeys: [PermissionFlagType.EXPORT_CSV],
        },
      });

      const dryRun = await syncApplication({
        manifest: buildBaseManifest({
          appId: customApplication.universalIdentifier,
          roleId: STANDARD_ROLE.admin.universalIdentifier,
          overrides: {
            roles: [
              {
                universalIdentifier: createdRoleUniversalIdentifier,
                label: ROLE_LABEL,
                objectPermissions: [
                  {
                    objectUniversalIdentifier:
                      STANDARD_OBJECTS.person.universalIdentifier,
                    canReadObjectRecords: true,
                    canUpdateObjectRecords: false,
                    canSoftDeleteObjectRecords: false,
                    canDestroyObjectRecords: false,
                  },
                ],
                fieldPermissions: [
                  {
                    objectUniversalIdentifier:
                      STANDARD_OBJECTS.person.universalIdentifier,
                    fieldUniversalIdentifier:
                      STANDARD_OBJECTS.person.fields.jobTitle
                        .universalIdentifier,
                    canReadFieldValue: false,
                    canUpdateFieldValue: false,
                  },
                ],
                permissionFlagUniversalIdentifiers: [
                  SystemPermissionFlag.EXPORT_CSV,
                ],
              },
            ],
          },
        }),
        dryRun: true,
        inferDeletionFromMissingEntities: false,
        expectToFail: false,
      });

      expect(dryRun.errors).toBeUndefined();

      const permissionActions = dryRun.data.syncApplication.actions.filter(
        ({ metadataName }) => PERMISSION_METADATA_NAMES.includes(metadataName),
      );

      expect(permissionActions).toEqual([]);
    } finally {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRole.id },
      });
    }
  }, 60000);
});
