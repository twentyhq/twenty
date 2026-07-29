import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

// No seeded company name contains this token, so the predicate only ever
// matches companies a suite created itself
export const VISIBLE_COMPANY_NAME_TOKEN = 'Visible';

export type CompanyNameRlsRoleSetup = {
  customRoleId: string;
  originalMemberRoleId: string;
};

export const setupCompanyNameRlsRole = async ({
  label,
  description,
}: {
  label: string;
  description: string;
}): Promise<CompanyNameRlsRoleSetup> => {
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

  const companyNameFieldMetadata = companyObjectMetadata.fieldsList?.find(
    (field) => field.name === 'name',
  );

  jestExpectToBeDefined(companyNameFieldMetadata);

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

  await upsertRowLevelPermissionPredicates({
    expectToFail: false,
    input: {
      roleId: customRoleId,
      objectMetadataId: companyObjectMetadata.id,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadata.id,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: VISIBLE_COMPANY_NAME_TOKEN,
        },
      ],
      predicateGroups: [],
    },
  });

  await updateWorkspaceMemberRole({
    input: {
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
    expectToFail: false,
  });

  return { customRoleId, originalMemberRoleId: memberRole.id };
};

// Tolerates a partial setup so a suite whose beforeAll threw still restores
// whatever it managed to change
export const cleanupCompanyNameRlsRole = async (
  setup: Partial<CompanyNameRlsRoleSetup> = {},
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
