import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import {
  SHARED_TEST_ROLES,
  type SharedTestRoleKey,
} from 'test/integration/permissions/utils/shared-test-roles.constant';
import { isDefined } from 'twenty-shared/utils';

import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

const SHARED_TEST_ROLE_GQL_FIELDS = `
  id
  label
  workspaceMembers {
    id
  }
  apiKeys {
    id
  }
`;

const sharedTestRolePromisesByKey = new Map<
  SharedTestRoleKey,
  Promise<RoleDTO>
>();

const findOrCreateSharedTestRole = async (
  key: SharedTestRoleKey,
): Promise<RoleDTO> => {
  const label = `Shared test role ${key}`;

  const { data: findRolesData } = await findRoles({
    gqlFields: SHARED_TEST_ROLE_GQL_FIELDS,
    expectToFail: false,
  });

  const existingRole = findRolesData.getRoles.find(
    (role) => role.label === label,
  );

  if (isDefined(existingRole)) {
    return existingRole;
  }

  const { data: createOneRoleData } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canAccessAllAgentChatChannels: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: true,
      ...SHARED_TEST_ROLES[key].grants,
    },
    gqlFields: SHARED_TEST_ROLE_GQL_FIELDS,
    expectToFail: false,
  });

  return createOneRoleData.createOneRole;
};

// Shared roles are created on first use and never modified or deleted, so
// later spec files in the same shard find them by label instead of paying
// for a workspace migration again.
export const getSharedTestRole = (key: SharedTestRoleKey): Promise<RoleDTO> => {
  const existingPromise = sharedTestRolePromisesByKey.get(key);

  if (isDefined(existingPromise)) {
    return existingPromise;
  }

  const sharedTestRolePromise = findOrCreateSharedTestRole(key);

  sharedTestRolePromisesByKey.set(key, sharedTestRolePromise);

  return sharedTestRolePromise;
};
