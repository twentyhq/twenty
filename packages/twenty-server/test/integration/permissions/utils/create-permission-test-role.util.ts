import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { type PermissionTestRoleGrant } from 'test/integration/permissions/utils/permission-test-workspace.type';

export const createPermissionTestRole = async ({
  label,
  grant,
  rowLevelFilter,
  objectMetadataId,
  accessToken,
}: {
  label: string;
  grant: PermissionTestRoleGrant;
  rowLevelFilter: { fieldMetadataId: string; value: string };
  objectMetadataId: string;
  accessToken: string;
}) => {
  const isGranted = grant !== 'none';
  const { data } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: isGranted,
      canUpdateAllObjectRecords: isGranted,
      canSoftDeleteAllObjectRecords: isGranted,
      canDestroyAllObjectRecords: isGranted,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: true,
      canBeAssignedToApiKeys: true,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });
  const roleId: string = data.createOneRole.id;

  if (grant === 'rowLevel') {
    await upsertRowLevelPermissionPredicates({
      input: {
        roleId,
        objectMetadataId,
        predicates: [
          {
            fieldMetadataId: rowLevelFilter.fieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: rowLevelFilter.value,
          },
        ],
        predicateGroups: [],
      },
      expectToFail: false,
      token: accessToken,
    });
  }

  return roleId;
};
