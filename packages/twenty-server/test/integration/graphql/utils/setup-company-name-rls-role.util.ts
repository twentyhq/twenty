import { upsertContainsRlsPredicate } from 'test/integration/graphql/utils/upsert-contains-rls-predicate.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

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

  await upsertContainsRlsPredicate({
    roleId: customRoleId,
    objectNameSingular: 'company',
    fieldName: 'name',
    value: VISIBLE_COMPANY_NAME_TOKEN,
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
