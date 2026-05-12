import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { upsertPermissionFlagGrants } from 'test/integration/metadata/suites/permission-flag-grant/utils/upsert-permission-flag-grants.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpsertPermissionFlagGrantsInput } from 'src/engine/metadata-modules/permission-flag-grant/dtos/upsert-permission-flag-grant-input';

type GlobalTestContext = {
  editableRoleId: string;
  nonEditableRoleId: string;
};

type TestContext = {
  input: (globalContext: GlobalTestContext) => UpsertPermissionFlagGrantsInput;
};

const failingPermissionFlagGrantUpsertTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when roleId is not a valid UUID',
      context: {
        input: () => ({
          roleId: 'invalid-uuid',
          permissionFlagGrantKeys: [PermissionFlagType.DATA_MODEL],
        }),
      },
    },
    {
      title: 'when roleId does not exist',
      context: {
        input: () => ({
          roleId: v4(),
          permissionFlagGrantKeys: [PermissionFlagType.DATA_MODEL],
        }),
      },
    },
    {
      title: 'when role is not editable (system role)',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.nonEditableRoleId,
          permissionFlagGrantKeys: [PermissionFlagType.DATA_MODEL],
        }),
      },
    },
    {
      title: 'when permissionFlagGrantKeys contains invalid enum value',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.editableRoleId,
          permissionFlagGrantKeys: ['INVALID_FLAG' as PermissionFlagType],
        }),
      },
    },
  ];

describe('Permission flag upsert should fail', () => {
  let editableRoleId: string;
  let nonEditableRoleId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Permission Flag Failing',
        description: 'Role for permission flag failing tests',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    editableRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(editableRoleId);

    const { data: rolesData } = await findRoles({
      expectToFail: false,
      gqlFields: `
        id
        label
        isEditable
      `,
    });

    jestExpectToBeDefined(rolesData?.getRoles);
    const adminRole = rolesData.getRoles.find(
      (role: { label: string; isEditable: boolean }) =>
        role.label === 'Admin' && role.isEditable === false,
    );
    jestExpectToBeDefined(adminRole);
    nonEditableRoleId = adminRole.id;
  });

  afterAll(async () => {
    if (isDefined(editableRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: editableRoleId },
      });
    }
  });

  it.each(eachTestingContextFilter(failingPermissionFlagGrantUpsertTestCases))(
    '$title',
    async ({ context }) => {
      const globalContext: GlobalTestContext = {
        editableRoleId: editableRoleId ?? '',
        nonEditableRoleId: nonEditableRoleId ?? '',
      };
      const input = context.input(globalContext);

      const { errors } = await upsertPermissionFlagGrants({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
