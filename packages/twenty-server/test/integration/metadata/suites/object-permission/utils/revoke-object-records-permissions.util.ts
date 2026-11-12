import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';

import { type ObjectPermissionInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';

// upsertObjectPermissions replaces every override of the role, so the existing ones are carried over
export const revokeObjectRecordsPermissions = async ({
  roleId,
  objectMetadataId,
  token,
}: {
  roleId: string;
  objectMetadataId: string;
  token?: string;
}): Promise<void> => {
  const existingObjectPermissions: ObjectPermissionInput[] =
    await globalThis.testDataSource.query(
      `SELECT "objectMetadataId", "canReadObjectRecords", "canUpdateObjectRecords",
        "canSoftDeleteObjectRecords", "canDestroyObjectRecords"
        FROM core."objectPermission" WHERE "roleId" = $1`,
      [roleId],
    );

  await upsertObjectPermissions({
    expectToFail: false,
    token,
    input: {
      roleId,
      objectPermissions: [
        ...existingObjectPermissions.filter(
          (objectPermission) =>
            objectPermission.objectMetadataId !== objectMetadataId,
        ),
        {
          objectMetadataId,
          canReadObjectRecords: false,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        },
      ],
    },
  });
};
