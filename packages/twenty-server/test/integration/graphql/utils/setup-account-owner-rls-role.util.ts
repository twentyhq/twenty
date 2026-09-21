import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type RowLevelPermissionPredicateValue,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export type AccountOwnerRlsRoleSetup = {
  customRoleId: string;
  originalMemberRoleId: string;
  companyObjectMetadataId: string;
  accountOwnerFieldMetadataId: string;
};

export const setupAccountOwnerRlsRole = async ({
  label,
  description,
}: {
  label: string;
  description: string;
}): Promise<AccountOwnerRlsRoleSetup> => {
  const memberRole = await findOneRoleByLabel({ label: 'Member' });

  const { data: roleData } = await createOneRole({
    expectToFail: false,
    input: {
      label,
      description,
      icon: 'IconSettings',
      canUpdateAllSettings: false,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    },
  });

  const customRoleId = roleData?.createOneRole?.id;

  jestExpectToBeDefined(customRoleId);

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

  jestExpectToBeDefined(objects);

  const companyObjectMetadata = objects.find(
    (object) => object.nameSingular === 'company',
  );

  jestExpectToBeDefined(companyObjectMetadata);

  const accountOwnerFieldMetadata = companyObjectMetadata.fieldsList?.find(
    (field) => field.name === 'accountOwner',
  );

  jestExpectToBeDefined(accountOwnerFieldMetadata);

  await updateWorkspaceMemberRole({
    input: {
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
    expectToFail: false,
  });

  return {
    customRoleId,
    originalMemberRoleId: memberRole.id,
    companyObjectMetadataId: companyObjectMetadata.id,
    accountOwnerFieldMetadataId: accountOwnerFieldMetadata.id,
  };
};

export const upsertAccountOwnerRlsPredicate = async ({
  setup,
  predicateId,
  value,
  expectToFail = false,
}: {
  setup: AccountOwnerRlsRoleSetup;
  predicateId: string;
  value: RowLevelPermissionPredicateValue;
  expectToFail?: boolean;
}) =>
  upsertRowLevelPermissionPredicates({
    expectToFail,
    input: {
      roleId: setup.customRoleId,
      objectMetadataId: setup.companyObjectMetadataId,
      predicates: [
        {
          id: predicateId,
          fieldMetadataId: setup.accountOwnerFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.IS,
          value,
        },
      ],
      predicateGroups: [],
    },
  });

export const cleanupAccountOwnerRlsRole = async (
  setup: Partial<AccountOwnerRlsRoleSetup> = {},
): Promise<void> => {
  if (isDefined(setup.originalMemberRoleId)) {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: setup.originalMemberRoleId,
      },
      expectToFail: false,
    });
  }

  if (isDefined(setup.customRoleId)) {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: setup.customRoleId },
    });
  }
};
