import { randomUUID } from 'node:crypto';

import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const createRoleWithPermissionFlags = async ({
  permissionFlagKeys,
}: {
  permissionFlagKeys: PermissionFlagType[];
}): Promise<string> => {
  const { data } = await createOneRole({
    input: {
      label: `Permission flags ${randomUUID().slice(0, 8)}`,
      description: 'Role arranged by an integration test',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    },
    gqlFields: 'id',
    expectToFail: false,
  });

  const roleId = data.createOneRole.id;

  if (isNonEmptyArray(permissionFlagKeys)) {
    await upsertPermissionFlags({
      input: { roleId, permissionFlagKeys },
      expectToFail: false,
    });
  }

  return roleId;
};
